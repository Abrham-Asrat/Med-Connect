using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service.PaymentService;
using BackendAPI.Source.Helpers.Default;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

// These were missing:
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Helpers;
using BackendAPI.Source.Config;
using BackendAPI.Source.Models.Interface.Payments;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/payments")]
    // [Authorize] // All payment endpoints require authentication
    public partial class PaymentController(
        IPaymentService paymentService,
        ILogger<PaymentController> logger,
        AppConfig appConfig
    ) : ControllerBase
    {
        [HttpPost("transfer")]
        public async Task<IActionResult> TransferBalance(TransferRequestDto transferRequestDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                // Get user ID from JWT token claims (secure)
                var userId = User.FindFirst("sub")?.Value ?? 
                             User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    logger.LogWarning("Unauthorized transfer attempt: User ID not found in JWT token");
                    throw new UnauthorizedAccessException("User not authenticated. Valid JWT token required.");
                }

                if (!Guid.TryParse(userId, out var senderId))
                {
                    logger.LogError("Invalid user ID format in JWT token: {UserId}", userId);
                    throw new FormatException("Invalid user ID format. Please login again.");
                }

                logger.LogInformation("Transfer initiated by user: {UserId}", senderId);
                var result = await paymentService.TransferAsync(transferRequestDto, senderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error transferring balance");
                throw;
            }
        }

         [HttpPost("charge")]
        public async Task<IActionResult> ChargeCustomer(ChargeRequest chargeRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    return BadRequest(new ApiResponse<ChargeResponse>(false, ErrorMessages.ModelValidationError, null));
                }

                var result = await paymentService.ChargeAsync(chargeRequest);
                return Ok(new ApiResponse<ChargeResponse>(result.Status, result.Message, result));
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Invalid argument when charging customer");
                return BadRequest(new ApiResponse<ChargeResponse>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error charging customer");
                return StatusCode(500, new ApiResponse<ChargeResponse>(false, "An error occurred while processing your payment", null));
            }
        }

        /// <summary>
        /// Chapa Webhook Callback Endpoint
        /// </summary>
        [HttpPost("chapa/webhook")]
        public async Task<IActionResult> ChapaWebhook([FromBody] ChapaWebhookDto webhookData)
        {
            try
            {
                // Optional: Log raw request body for debugging
                using var reader = new StreamReader(Request.Body);
                var rawBody = await reader.ReadToEndAsync();
                logger.LogDebug("Raw webhook body: {Body}", rawBody);

                if (webhookData == null)
                {
                    logger.LogWarning("Received empty webhook payload");
                    return BadRequest("Invalid payload");
                }

                logger.LogInformation("Received Chapa webhook: {Event} | TxRef: {TxRef}",
                    webhookData.Event, webhookData.TxRef);

                // Verify signature if needed
                var chapaSignature = Request.Headers["Chapa-Signature"].ToString();
                var hash = EncryptionHelper.GetHmacSha256Hash(rawBody, appConfig.WebhookSecret 
                    ?? throw new Exception("No secret key configured."));

                if (hash != chapaSignature)
                {
                    logger.LogWarning("Invalid signature on webhook. Hash: {Hash}, Signature: {Signature}",
                        hash, chapaSignature);
                    return Unauthorized("Invalid signature");
                }

                // Only process successful payments
                if (webhookData.Event == "charge.success" && webhookData.Status == "success")
                {
                    await paymentService.VerifyAsync(new VerifyRequest
                    {
                        TransactionReference = webhookData.TxRef
                    });

                    logger.LogInformation("Successfully processed transaction reference: {TxRef}",
                        webhookData.TxRef);
                }

                // Always return 200 OK immediately after acknowledging receipt
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while processing Chapa webhook.");
                return StatusCode(500);
            }
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetPaymentHistory(Guid userId)
        {
            try
            {
                var history = await paymentService.GetPaymentHistoryAsync(userId);
                return Ok(new ApiResponse<List<PaymentDto>>(true, "Payment history retrieved successfully", history));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving payment history for {UserId}", userId);
                return StatusCode(500, new ApiResponse<List<PaymentDto>>(false, "Error retrieving payment history", null));
            }
        }
    }
}