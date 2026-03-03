// BackendAPI.Source.Service.UserService.cs
using System;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BackendAPI.Source.Models.Enums;
using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Service;

namespace BackendAPI.Source.Service
{
    public class UserService(
        ApplicationDbContext appContext,
        ILogger<UserService> logger,
        FileService fileService,
        DoctorService doctorService
    )
    {
        /// <summary>
        /// Initialize local profile AFTER successful Auth0 authentication
        /// Auth0Id and email come FROM VALIDATED TOKEN (never from DTO)
        /// </summary>
        public async Task<ServiceResponse<ProfileDto>> RegisterUser(
            string auth0Id,
            string emailFromToken,
            bool isEmailVerified,
            RegisterUserDto registerUserDto
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
                    .AnyAsync(u => u.Phone == registerUserDto.Phone);

                if (existingByPhone)
                {
                    logger.LogWarning($"Phone number already in use: {registerUserDto.Phone}");
                    return new ServiceResponse<ProfileDto>(
                        false,
                        409,
                        null,
                        "Phone number is already associated with another account"
                    );
                }

                // ✅ Step 3: Create user WITH token-derived identity (never trust DTO for identity)
                var userEntity = registerUserDto.ToUserModel(auth0Id); // Auth0Id comes from token

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
                var addUser = await appContext.Users.AddAsync(userEntity);

                Role role = Enum.Parse<Role>(registerUserDto.Role, true);


                if (role == Role.Doctor)
                {
                    var cvFile = await fileService.CreateFileAsync(

                      new CreateFileDto(
                          registerUserDto.Cv!.MimeType,
                          registerUserDto.Cv!.FileDataBase64,
                          registerUserDto!.Cv!.FileName
                      )
                    );       
                    
                     // Create Doctor
                    // DoctorModel doctor

                    DoctorModel doctor = await doctorService.CreateDoctorAsync(
                        registerUserDto.ToCreateDoctorDto(
                            addUser.Entity,
                            cvFile,
                            registerUserDto.Education,
                            registerUserDto.Experience
                        )
                    );


                    // Create Specialties
                    var specialties = await SpecialtyService.CreateSpecialtiesAsync(
                        registerUserDto.Specialties.ToSpecialtyList(doctor.DoctorId)
                        );
                }




                await appContext.SaveChangesAsync();


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