using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    [Route("api/verify")]
    public class VerificationController(UserService userService, ILogger<VerificationController> looger) : ControllerBase
    {
        [HttpGet("email/{email}")]
        public async Task<IApiResponse<bool>> VerifyEmailAsync(string email)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return new ApiResponse<bool>(false, "Invalid email format", false);
                }

                var result = await userService.IsEmailRegisteredAsync(email);

                return new ApiResponse<bool>(result.Success, result.Message, true);
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }       
    }
}