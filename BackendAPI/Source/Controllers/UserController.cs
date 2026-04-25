using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Service;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Validation;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Config;
using FluentValidation;
using FluentValidation.Results;
using System.Security.Claims;
// using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Standardized REST route: /api/users
    public class UserController(
        UserService userService,
        // AppConfig appConfig ,
        ILogger<UserController> logger,

        IValidator<RegisterUserDto> registerUserDtoValidator,

        IValidator<UpdateProfileDto> updateProfileValidator
    ) : ControllerBase
    {

        /// Initialize local profile AFTER first Auth0 login
        /// Called by frontend AFTER successful Universal Login redirect
        // / </summary>

        [HttpPost("Register")]
        [AllowAnonymous] // Registration should be public
        [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 409)]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;

                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                // Role Based Validation of payload 
                var validation = registerUserDtoValidator.Validate(dto);

                if (!validation.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.FluentValidationErrors] = validation.ToFluentValidationErrorResult();
                }

                var response = await userService.RegisterUser(dto);

                if (!response.Success)
                {
                    return response.StatusCode switch
                    {
                        400 => BadRequest(new ApiResponse<object>(false, response.Message, null)),
                        409 => Conflict(new ApiResponse<object>(false, response.Message, null)),
                        _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                    };
                }

                return Ok(new ApiResponse<ProfileDto>(true, response.Message ?? "User registered successfully", response.Data));
            }
            catch (System.Exception ex)
            {


                logger.LogError(ex, "Failed to Register User\n\n");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }

        }


        //    <summary>
        // Login Controller 
        //    </Summary>
        [HttpPost("login")]
        [AllowAnonymous] // Login should be public
        public async Task<IActionResult> LoginUserAsync(LoginUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var response = await userService.LoginUserAsync(dto);


                if (!response.Success)
                {
                    return response.StatusCode switch
                    {
                        400 => BadRequest(new ApiResponse<object>(false, response.Message, null)),
                        404 => NotFound(new ApiResponse<object>(false, response.Message, null)),
                        _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                    };
                }
                var CookiesOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7) // Set cookie expiration as needed
                };
                Response.Cookies.Append(AuthDefaults.AccessToken.ToSnakeCase(), response.Data?.AccessToken ?? string.Empty, CookiesOptions);

                var UserProfile = response.Data?.Profile;

                if (UserProfile != null)
                {
                    foreach (
                        var field in UserProfile.GetType().GetProperties(
                            System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance
                        )
                    )
                    {
                        var value = field.GetValue(UserProfile);
                        Response.Cookies.Append(field.Name.ToSnakeCase(), value?.ToString() ?? string.Empty, CookiesOptions);
                    }

                }



                return Ok(new ApiResponse<Auth0LoginDto>(true, response.Message ?? "Login successful", response.Data));
            }
            catch (System.Exception)
            {
                logger.LogError("An unexpected error occurred during user login.");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

        // Get All Users Controller - Admin Only Access
        [HttpGet("all")]
        // [Authorize(Roles = "Admin")] // Only admins can view all users
        // desipine 
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var response = await userService.GetAllUsersAsync();

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(response);

            }
            catch (Exception ex)
            {
              logger.LogError(ex, "Failed to get all users");
              return StatusCode(500, new ApiResponse<object>(false, "Failed to get all users", null));
            }
        }
        // update user Profile Controller 
        [HttpPut("profile")]
        [Authorize] // Must be authenticated to update profile
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var validation = await updateProfileValidator.ValidateAsync(dto);

                if (!validation.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.FluentValidationErrors] = validation.ToFluentValidationErrorResult();
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var response = await userService.UpdateUserProfile(dto);
                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return StatusCode(response.StatusCode, response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to update user profile for User ID: {UserId}", User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);

                throw new Exception("Failed to update user profile", ex);
            }
        }

        // Delete User Profile Controller
        [HttpDelete("{userId}")]
        [Authorize] // Must be authenticated to delete user
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            try
            {
                var response = await userService.DeleteUserAsync(userId);
                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return NoContent();
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to delete user with ID: {UserId}", userId);

                throw new Exception("Failed to delete user", ex);
            }
        }

        // Get user profile by user id
        [HttpGet("{userId}")]
        [Authorize] // Must be authenticated to view user profile
        public async Task<IActionResult> GetUserProfile(Guid userId)
        {
            try
            {
                var response = await userService.GetUserProfileAsync(userId);
                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to get user profile for ID: {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }


        // <summary>
        //Endpoint responsible for getting the profile or the currently logged in user 
        // </summary>
        [HttpGet("profile/me")]
        [Authorize]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                bool validGuid = Guid.TryParse(HttpContext.Request.Cookies[CookieDefaults.Profile.UserId]?.ToString(), out var userId);

                if (!validGuid)
                {
                    throw new UnauthorizedAccessException($"Please login again. Cookie is corrupt. {userId}");


                }

                var response = await userService.GetUserProfileAsync(userId);

                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogInformation(ex, "Failed to get user Profile");
                throw;
            }
        }

    }
}

