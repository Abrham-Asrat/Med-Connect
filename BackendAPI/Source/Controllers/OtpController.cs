using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Responses;

namespace BackendAPI.Source.Controllers
{
     [ApiController]
     [Route("api")]
    public class OtpController(
        AuthService authService,
        UserService userService,
        ILogger<OtpController> logger
    ) : ControllerBase
    {
        
        // Send OTP to the user's email for verification
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto request)
        {
            try
            {
                if(!ModelState.IsValid)
                  return BadRequest(new ApiResponse<string>(false,"Invalid email address", null));
            
              var user = await userService.GetUserByEmail(request.Email);
                if (user == null)
                {
                    return NotFound(new ApiResponse<string>(false,"User not found", null));
                }

                await authService.SendOtp(user.UserId);

                return Ok(new ApiResponse<string>(true,"OTP sent successfully", null));
            }
            catch (System.Exception ex)
            {
               logger.LogError(ex ,"Failed to send OTP for email: {Email}", request.Email);  
                
                // return StatusCode(500, new ApiResponse<string>(false,"An error occurred while sending OTP", null));
               
               throw new Exception("An error occurred while sending OTP", ex);
            }
        }

        // Verify otp provided by user for authentication
         [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            try
            {
                if(!ModelState.IsValid)
                   return NotFound(new ApiResponse<string>(false,"Invalid OTP", null));

                var user = await userService.GetUserByEmail(request.Email);
                if (user == null)
                {
                    return NotFound(new ApiResponse<string>(false,"User not found", null));
                }

                if (user.Otp != request.Otp)
                {
                    return BadRequest(new ApiResponse<string>(false,"Invalid OTP", null));
                }

                // Clear the OTP after successful verification
                user.Otp = null;
                user.IsEmailVerified = true;
                await userService.UpdateUser(user);

                return Ok(new ApiResponse<string>(true,"OTP verified successfully", null));
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex ,"Failed to verify OTP for email: {Email}", request.Email);  
                
                return StatusCode(500, new ApiResponse<string>(false,"An error occurred while verifying OTP", null));
            }
        }
    }
}