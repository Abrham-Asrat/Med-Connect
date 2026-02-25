using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Service;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Validation;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Config;
using FluentValidation;
using System.Security.Claims;
// using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Extensions;


namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Standardized REST route: /api/users
    [Authorize] // 🔒 ALL endpoints require valid Auth0 token
    public class UserController(
        UserService userService,
        // AppConfig appConfig ,
        // ILogger<UserController> logger,

        IValidator<RegisterUserDto> registerUserDtoValidator
    ) : ControllerBase
    {

       /// Initialize local profile AFTER first Auth0 login
        /// Called by frontend AFTER successful Universal Login redirect
        /// </summary>
        [HttpPost("initialize")]
        [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 409)]
        public async Task<IActionResult> InitializeProfile([FromBody] RegisterUserDto dto)
        {
            // 🔒 STEP 1: Extract identity claims FROM TOKEN (never trust DTO!)
            var auth0Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? User.FindFirst("sub")?.Value; // Standard + Auth0 fallback
            
            var emailFromToken = User.FindFirst(ClaimTypes.Email)?.Value 
                              ?? User.FindFirst("email")?.Value;
            
            var emailVerifiedClaim = User.FindFirst("email_verified")?.Value 
                                  ?? User.FindFirst(ClaimTypes.Email)?.Value;
            
            var isEmailVerified = !string.IsNullOrEmpty(emailVerifiedClaim) 
                               && bool.Parse(emailVerifiedClaim);

            // 🔒 Validate token contains required identity claims
            if (string.IsNullOrWhiteSpace(auth0Id))
                return Unauthorized(new ApiResponse<object>(false, "Missing user identifier in authentication token",null));
            
            // Email from token is optional - we can use DTO email as fallback
            if (string.IsNullOrWhiteSpace(emailFromToken))
            {
                // Use email from DTO as fallback
                emailFromToken = dto.Email;
            }

            // 🔒 STEP 2: Validate DTO payload (business rules only — NOT identity)
            var validation = registerUserDtoValidator.Validate(dto);
            if (!validation.IsValid)
            {
                var errors = validation.Errors.Select(e => new 
                { 
                    Field = e.PropertyName, 
                    Message = e.ErrorMessage 
                });
                return BadRequest(new ApiResponse<object>(false, "Validation failed", errors));
            }

            // 🔒 STEP 3: Initialize profile with token-derived identity
            var response = await userService.InitializeUserProfile(
                auth0Id, 
                emailFromToken, 
                isEmailVerified, 
                dto
            );

            if (!response.Success)
            {
                return response.StatusCode switch
                {
                    409 => Conflict(new ApiResponse<object>(false, response.Message, null)),
                    400 => BadRequest(new ApiResponse<object>(false, response.Message, null)),
                    _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                };
            }

            return CreatedAtAction(
                nameof(GetProfile), 
                null, 
                new ApiResponse<ProfileDto>(true, response.Message, response.Data)
            );
        }

         /// <summary>
        /// Get current authenticated user's profile
        /// </summary>
        [HttpGet("profile")]
        [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> GetProfile()
        {
            // 🔒 Extract Auth0 ID from token
            var auth0Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(auth0Id))
                return Unauthorized(new ApiResponse<object>(false, "Missing user identifier in token", null));

            // 🔒 Fetch profile from database
            var user = await userService.GetUserByAuth0IdAsync(auth0Id);
            if (user == null)
                return NotFound(new ApiResponse<object>(false, "Profile not found. Call /initialize to create your profile.", null));

            return Ok(new ApiResponse<ProfileDto>(
                true, 
                "Profile retrieved successfully", 
                user.ToProfileDto()
            ));
        }

    }

    
}

