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
using BackendAPI.Source.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Standardized REST route: /api/users
    public class UserController(
        UserService userService,
        Auth0Service auth0Service,
        // AppConfig appConfig ,
        ILogger<UserController> logger,
        IValidator<RegisterUserDto> registerUserDtoValidator,
        IValidator<UpdateProfileDto> updateProfileValidator,
        BackendAPI.Source.Data.ApplicationDbContext context
    ) : ControllerBase
    {

        /// Initialize local profile AFTER first Auth0 login
        /// Called by frontend AFTER successful Universal Login redirect
        // / </summary>

        [HttpPost("Register")]
        [AllowAnonymous] // Registration should be public
        [EnableRateLimiting("RegistrationLimit")] // 3 attempts per hour
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
        [EnableRateLimiting("LoginLimit")] // 5 attempts per 15 minutes
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
                    Secure = true, // Must be true for SameSite = None
                    SameSite = SameSiteMode.None, // Allow cross-origin cookie sharing (needed for cross-port localhost)
                    Path = "/",
                    Expires = DateTime.UtcNow.AddDays(7)
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
            catch (System.Exception ex)
            {
                // Log the full exception details for debugging
                logger.LogError(ex, 
                    "Login failed for user '{Email}'. Exception: {ExceptionType} - {Message}", 
                    dto.Email, ex.GetType().Name, ex.Message);
                
                // Log inner exception if it exists
                if (ex.InnerException != null)
                {
                    logger.LogError("Inner Exception: {InnerType} - {InnerMessage}", 
                        ex.InnerException.GetType().Name, ex.InnerException.Message);
                }
                
                // Return detailed error message (helpful for debugging)
                return StatusCode(500, new ApiResponse<object>(
                    false, 
                    $"Login failed: {ex.GetType().Name} - {ex.Message}", 
                    null));
            }
        }

        // Get All Users Controller - Admin Only Access
        [HttpGet("all")]
        // [Authorize(Roles = "Admin")] // Only admins can view all users
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

        [HttpPost("profile-picture")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new ApiResponse<object>(false, "No file uploaded", null));

                // Check file size (e.g., 5MB limit)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new ApiResponse<object>(false, "File size exceeds 5MB limit", null));

                var userId = await User.GetUserIdAsync(context);
                if (!userId.HasValue)
                    return Unauthorized(new ApiResponse<object>(false, "User not identified", null));

                // Convert file to byte array
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                var fileBytes = ms.ToArray();

                var createFileDto = new CreateFileDto(
                    file.ContentType,
                    Convert.ToBase64String(fileBytes),
                    file.FileName
                );

                var response = await userService.UpdateProfilePictureAsync(userId.Value, createFileDto);

                if (!response.Success)
                    return StatusCode(response.StatusCode, response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error uploading profile picture");
                return StatusCode(500, new ApiResponse<object>(false, "Internal server error during upload", null));
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
                // 1. Try Cookies
                if (Guid.TryParse(HttpContext.Request.Cookies[CookieDefaults.Profile.UserId]?.ToString(), out var userId))
                {
                    // userId is already set correctly
                }
                else
                {
                    // 2. Try Jwt Claim via centralized extension (checks NameIdentifier, sub, and DB lookup)
                    var id = await User.GetUserIdAsync(context);
                    if (id.HasValue)
                    {
                        userId = id.Value;
                    }
                    else
                    {
                        throw new UnauthorizedAccessException("Could not identify the user. Please login again.");
                    }
                }

                var response = await userService.GetUserProfileAsync(userId);
                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogInformation(ex, "Failed to get user Profile");
                return StatusCode(ex is UnauthorizedAccessException ? 401 : 500, new ApiResponse<object>(false, ex.Message, null));
            }
        }

        // Change Password Endpoint
        [HttpPost("change-password")]
        [Authorize]
        [EnableRateLimiting("PasswordChangeLimit")] // 3 attempts per hour
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                // Get user email from claims
                var email = User.FindFirstValue(ClaimTypes.Email) ?? 
                           User.FindFirstValue("email");
                
                if (string.IsNullOrEmpty(email))
                {
                    // Fallback: lookup user by Auth0 ID (sub)
                    var auth0Id = User.GetAuth0Id();
                    if (!string.IsNullOrEmpty(auth0Id))
                    {
                        var user = await context.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);
                        email = user?.Email;
                    }
                }

                if (string.IsNullOrEmpty(email))
                {
                    throw new UnauthorizedAccessException("User email not found");
                }

                // Verify current password first
                var isCurrentPasswordValid = await auth0Service.VerifyPasswordAsync(email, dto.CurrentPassword);
                
                if (!isCurrentPasswordValid)
                {
                    return BadRequest(new ApiResponse<object>(false, "Current password is incorrect", null));
                }

                // Change to new password
                var passwordChanged = await auth0Service.ChangePasswordAsync(email, dto.NewPassword);
                
                if (!passwordChanged)
                {
                    return StatusCode(500, new ApiResponse<object>(false, "Failed to change password. Please try again later.", null));
                }

                return Ok(new ApiResponse<object>(true, "Password changed successfully", null));
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to change password for user");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

    }
}

