using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Interface.Payments;
using BackendAPI.Source.Models.Interface.Payments.Chapa;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Service;
using BackendAPI.Source.Service.PaymentProviders;

namespace BackendAPI.Source.Service.PaymentService
{
    public class PaymentService(
      IPaymentProviderFactory paymentProviderFactory,
      DoctorService doctorService,
      PatientService patientService,
      ApplicationDbContext appContext,
      ILogger<PaymentService> logger
    ) : IPaymentService
    {
        public async Task<decimal> CheckBalanceAsync(string email, PaymentProvider provider)
        {
            try
            {
                IPaymentProvider paymentProvider = paymentProviderFactory.GetProvider(provider);

                var balance = await paymentProvider.CheckBalanceAsync(email);
                return balance;
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error checking balance");
                throw;
            }
        }

        public async Task<TransferResponseDto> TransferAsync(
          TransferRequestDto transferRequestDto,
          Guid senderId
        )
        {
            try
            {
                IPaymentProvider paymentProvider = paymentProviderFactory.GetProvider(
                  transferRequestDto.PaymentProvider
                );

                // Perform the transfer
                var result = await paymentProvider.TransferAsync(transferRequestDto);

                // Create a payment record
                var payment = await CreatePaymentAsync(
                  transferRequestDto.ToCreatePaymentDto(senderId, result.IsSuccessful),
                  result.TransactionReference
                );

                // TODO

                return new TransferResponseDto
                {
                    IsSuccessful = result.IsSuccessful,
                    Message = new { result.Message, payment }
                };
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error transferring funds");
                throw;
            }
        }

        public async Task<PaymentDto> CreatePaymentAsync(
          CreatePaymentDto createPaymentDto,
          string transactionReference
        )
        {
            try
            {
                if (!await doctorService.UserExistsAsync(createPaymentDto.ReceiverId))
                {
                    throw new ArgumentException("Doctor with the specified receiver_id does not exist");
                }

                if (!await patientService.UserExistsAsync(createPaymentDto.SenderId))
                {
                    throw new ArgumentException("Patient with the specified user_id does not exist");
                }

                var payment = createPaymentDto.ToPayment(transactionReference);
                var result = await appContext.Payments.AddAsync(payment);
                await appContext.SaveChangesAsync();
                return result.Entity.ToPaymentDto();
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error creating payment");
                throw;
            }
        }

        public async Task<PaymentDto> ChangePaymentStatusAsync(
          string transactionReference,
          PaymentStatus status
        )
        {
            try
            {
                var payment = await appContext.Payments.FirstOrDefaultAsync(p =>
                  p.TransactionReference == transactionReference
                );
                if (payment == default)
                {
                    throw new KeyNotFoundException(
                      "Payment with the specified transaction reference does not exist"
                    );
                }
                payment.PaymentStatus = status; // update the status
                await appContext.SaveChangesAsync();
                return payment.ToPaymentDto();
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error changing payment status");
                throw;
            }
        }

          public async Task<ChargeResponse> ChargeAsync(IChargeRequest charge)
        {
            try
            {
                logger.LogInformation("Starting charge request: Amount={Amount}, Currency={Currency}, Provider={Provider}, Method={Method}", 
                    charge.Amount, charge.Currency, charge.PaymentProvider, charge.PaymentMethod);

                var providerEnum = charge.PaymentProvider.ConvertToEnum<PaymentProvider>();
                logger.LogInformation("Converted payment provider to enum: {ProviderEnum}", providerEnum);

                IPaymentProvider provider = paymentProviderFactory.GetProvider(providerEnum);
                logger.LogInformation("Got payment provider: {ProviderType}", provider.GetType().Name);

                var currencyEnum = charge.Currency.ConvertToEnum<PaymentCurrency>();
                logger.LogInformation("Converted currency to enum: {CurrencyEnum}", currencyEnum);

                var paymentMethodEnum = charge.PaymentMethod.ToLowerInvariant().ConvertToChapaPaymentMethod();
                logger.LogInformation("Converted payment method to enum: {MethodEnum}", paymentMethodEnum);

                var chapaCharge = new ChapaCharge
                {
                    Amount = charge.Amount,
                    Currency = currencyEnum,
                    PhoneNumber = charge.PhoneNumber,
                    PaymentProvider = providerEnum,
                    PaymentMethod = paymentMethodEnum
                };

                logger.LogInformation("Calling provider.ChargeAsync with: {@ChapaCharge}", chapaCharge);
                
                var result = await provider.ChargeAsync(chapaCharge);
                
                logger.LogInformation("Charge request completed successfully: Status={Status}, RefId={RefId}", 
                    result.Status, result.RefId);
                
                return (ChargeResponse)result;
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error charging - Exception Type: {ExceptionType}, Message: {Message}", 
                    ex.GetType().Name, ex.Message);
                
                if (ex.InnerException != null)
                {
                    logger.LogError("Inner Exception: {InnerExceptionType} - {InnerMessage}", 
                        ex.InnerException.GetType().Name, ex.InnerException.Message);
                }
                
                throw;
            }
        }

        public async Task<IVerifyResponse> VerifyAsync(IVerifyRequest verifyRequest)
        {
            try
            {
                logger.LogInformation("Verifying payment transaction: {TransactionReference}", 
                    verifyRequest.TransactionReference);

                // Find the payment provider from the transaction
                // For now, we'll use Chapa as default (can be enhanced to detect provider from transaction)
                IPaymentProvider provider = paymentProviderFactory.GetProvider(PaymentProvider.Chapa);
                
                var verifyResponse = await provider.VerifyAsync(verifyRequest);
                
                if (verifyResponse.Success)
                {
                    // Update payment status in database
                    var payment = await appContext.Payments.FirstOrDefaultAsync(p => 
                        p.TransactionReference == verifyRequest.TransactionReference);
                    
                    if (payment != null)
                    {
                        payment.PaymentStatus = PaymentStatus.Success;
                        await appContext.SaveChangesAsync();
                        logger.LogInformation("Payment verified and status updated to Success: {TransactionReference}", 
                            verifyRequest.TransactionReference);
                    }
                    else
                    {
                        logger.LogWarning("Payment record not found for transaction: {TransactionReference}", 
                            verifyRequest.TransactionReference);
                    }
                }
                
                return verifyResponse;
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error verifying payment transaction: {TransactionReference}", 
                    verifyRequest.TransactionReference);
                throw;
            }
        }
        public async Task<List<PaymentDto>> GetPaymentHistoryAsync(Guid userId)
        {
            try
            {
                var payments = await appContext.Payments
                    .Where(p => p.SenderId == userId || p.ReceiverId == userId)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                return payments.Select(p => p.ToPaymentDto()).ToList();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching payment history for user: {UserId}", userId);
                throw;
            }
        }
    }
}