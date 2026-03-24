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
using System.Security.Claims;
// using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;


namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Standardized REST route: /api/users
    // [Authorize] // 🔒 ALL endpoints require valid Auth0 token
    public class UserController(
        UserService userService,
        // AppConfig appConfig ,
        ILogger<UserController> logger,

        IValidator<RegisterUserDto> registerUserDtoValidator
    ) : ControllerBase
    {

        /// Initialize local profile AFTER first Auth0 login
        /// Called by frontend AFTER successful Universal Login redirect
        // / </summary>

        [HttpPost("Register")]
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

        //  /// <summary>
        // /// Get current authenticated user's profile
        // /// </summary>
        // [HttpGet("profile")]
        // [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
        // [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        // public async Task<IActionResult> GetProfile()
        // {
        //     // 🔒 Extract Auth0 ID from token
        //     var auth0Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
        //                ?? User.FindFirst("sub")?.Value;

        //     if (string.IsNullOrWhiteSpace(auth0Id))
        //         return Unauthorized(new ApiResponse<object>(false, "Missing user identifier in token", null));

        //     // 🔒 Fetch profile from database
        //     var user = await userService.GetUserByAuth0IdAsync(auth0Id);
        //     if (user == null)
        //         return NotFound(new ApiResponse<object>(false, "Profile not found. Call /initialize to create your profile.", null));

        //     return Ok(new ApiResponse<ProfileDto>(
        //         true, 
        //         "Profile retrieved successfully", 
        //         user.ToProfileDto()
        //     ));
        // }

        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> LoginUser()
        {
            try
            {
                var auth0Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(auth0Id))
                    return Unauthorized(new ApiResponse<object>(false, "Missing user identifier in authentication token", null));

                var response = await userService.LoginUserAsync(auth0Id);

                if (!response.Success)
                {
                    return response.StatusCode switch
                    {
                        404 => NotFound(new ApiResponse<object>(false, response.Message, null)),
                        _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                    };
                }

                return Ok(new ApiResponse<ProfileDto>(true, response.Message ?? "Login successful", response.Data));
            }
            catch (System.Exception)
            {
                logger.LogError("An unexpected error occurred during user login.");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

    }


}

