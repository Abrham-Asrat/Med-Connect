using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BackendAPI.Source.Service;
using BackendAPI.Source.Models.Responses;

namespace BackendAPI.Source.Controllers
{[Route("api/verify")]
public class VerificationController(UserService userService, ILogger<VerificationController> logger) : ControllerBase {

  /// <summary>
  /// This endpoint is responsible for verifying a user's email.
  /// </summary>
  /// <param name="email"></param>
  /// <returns></returns>
  /// <exception cref="Exception"></exception>
  [HttpGet("email/{email}")]
  public async Task<IApiResponse<bool>> VerifyEmailAsync(string email) {
    try {
      if (!ModelState.IsValid) {
        return new ApiResponse<bool>(false, "Invalid Model State", false);
      }

      var result = await userService.CheckEmailVerified(email);

      return new ApiResponse<bool>(result.Success, result.Message, result.Data ?? false);
    } catch (Exception ex) {
      logger.LogError(ex, "Failed to Check Email Verification");
      throw;
    }
  }

  [HttpGet("resend/{email}")]
  public async Task<IApiResponse<bool>> ResendEmailVerificationAsync(string email) {
    try {
      if (!ModelState.IsValid) {
        return new ApiResponse<bool>(false, "Invalid Model State", false);
      }

      var result = await userService.ResendVerificationEmail(email);

      return new ApiResponse<bool>(result.Success, result.Message, result.Data);
    } catch (Exception ex) {
      logger.LogError(ex, "Failed to Resend Email Verification");
      throw;
    }
  }
}

}