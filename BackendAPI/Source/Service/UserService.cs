// BackendAPI.Source.Service.UserService.cs
using System;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BackendAPI.Source.Service
{
    public class UserService(
        ApplicationDbContext appContext,
        ILogger<UserService> logger
    )
    {
        /// <summary>
        /// Initialize local profile AFTER successful Auth0 authentication
        /// Auth0Id and email come FROM VALIDATED TOKEN (never from DTO)
        /// </summary>
        public async Task<ServiceResponse<ProfileDto>> InitializeUserProfile(
            string auth0Id, 
            string emailFromToken, 
            bool isEmailVerified,
            RegisterUserDto dto
        )
        {
            try
            {
                // 🔒 CRITICAL: Validate inputs BEFORE database queries
                if (string.IsNullOrWhiteSpace(auth0Id))
                    return new ServiceResponse<ProfileDto>(false, 400, null, "Auth0 user ID is required");
                
                if (string.IsNullOrWhiteSpace(emailFromToken))
                    return new ServiceResponse<ProfileDto>(false, 400, null, "Email from token is required");

                // ✅ Step 1: Prevent duplicate initialization for same Auth0 user
                var existingByAuth0Id = await appContext.Users
                    .FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);
                
                if (existingByAuth0Id != null)
                {
                    logger.LogWarning($"Duplicate profile initialization attempt for Auth0Id: {auth0Id}");
                    return new ServiceResponse<ProfileDto>(
                        false, 
                        409, 
                        null, 
                        "Profile already exists for this authenticated user"
                    );
                }

                // ✅ Step 2: Enforce phone uniqueness (email uniqueness handled by Auth0)
                var existingByPhone = await appContext.Users
                    .AnyAsync(u => u.Phone == dto.Phone);
                
                if (existingByPhone)
                {
                    logger.LogWarning($"Phone number already in use: {dto.Phone}");
                    return new ServiceResponse<ProfileDto>(
                        false, 
                        409, 
                        null, 
                        "Phone number is already associated with another account"
                    );
                }

                // ✅ Step 3: Create user WITH token-derived identity (never trust DTO for identity)
                var userEntity = dto.ToUser(auth0Id); // Auth0Id comes from token
                
                // 🔒 SECURITY: ALWAYS use email FROM TOKEN (not DTO) to prevent spoofing
                userEntity.Email = emailFromToken;
                userEntity.IsEmailVerified = isEmailVerified;
                
                // // 🔒 SECURITY: Enforce "User" role for self-registration (block privilege escalation)
                // if (userEntity.Role != Role.User)
                // {
                //     logger.LogWarning($"Attempted privilege escalation during registration. Auth0Id: {auth0Id}, RequestedRole: {userEntity.Role}");
                //     userEntity.Role = Role.User; // Force to User role
                // }

                userEntity.LastLogin = DateTime.UtcNow;
                userEntity.UserId = Guid.NewGuid(); // Generate new GUID for local user

                // ✅ Step 4: Save to database
                await appContext.Users.AddAsync(userEntity);
                await appContext.SaveChangesAsync();

                logger.LogInformation($"New user profile initialized. Auth0Id: {auth0Id}, UserId: {userEntity.UserId}");

                return new ServiceResponse<ProfileDto>(
                    true,
                    201,
                    userEntity.ToProfileDto(),
                    "Profile created successfully. Welcome to MedConnect!"
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to initialize user profile. Auth0Id: {Auth0Id}", auth0Id);
                return new ServiceResponse<ProfileDto>(
                    false,
                    500,
                    null,
                    "Failed to create profile. Please try again later."
                );
            }
        }

        /// <summary>
        /// Get user by Auth0 ID (for profile endpoints)
        /// </summary>
        public async Task<UserModel?> GetUserByAuth0IdAsync(string auth0Id)
        {
            if (string.IsNullOrWhiteSpace(auth0Id))
                return null;

            return await appContext.Users
                .FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);
        }

        /// <summary>
        /// Update user profile (for PATCH /profile endpoint)
        // /// </summary>
        // public async Task<ServiceResponse<ProfileDto>> UpdateUserProfile(string auth0Id, UpdateProfileDto dto)
        // {
        //     try
        //     {
        //         var user = await GetUserByAuth0IdAsync(auth0Id);
        //         if (user == null)
        //             return new ServiceResponse<ProfileDto>(false, 404, null, "User profile not found");

        //         // 🔒 Only allow updating non-identity fields
        //         user.FirstName = dto.FirstName ?? user.FirstName;
        //         user.LastName = dto.LastName ?? user.LastName;
        //         user.Phone = dto.Phone ?? user.Phone;
        //         user.Address = dto.Address ?? user.Address;
        //         user.Gender = dto.Gender.HasValue ? (Gender)dto.Gender : user.Gender;
        //         user.DateOfBirth = dto.DateOfBirth ?? user.DateOfBirth;
        //         user.LastLogin = DateTime.UtcNow;

        //         await appContext.SaveChangesAsync();
        //         return new ServiceResponse<ProfileDto>(true, 200, user.ToProfileDto(), "Profile updated successfully");
        //     }
        //     catch (Exception ex)
        //     {
        //         logger.LogError(ex, "Failed to update profile for Auth0Id: {Auth0Id}", auth0Id);
        //         return new ServiceResponse<ProfileDto>(false, 500, null, "Failed to update profile");
        //     }
        // }
    }
}