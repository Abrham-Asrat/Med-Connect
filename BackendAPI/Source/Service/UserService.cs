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
using BackendAPI.Source.Attributes;

using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;


namespace BackendAPI.Source.Service
{
    public class UserService(
        ApplicationDbContext appContext,
        ILogger<UserService> logger,
        FileService fileService,
        DoctorService doctorService,
        Auth0Service auth0Service,
        DoctorSpecialtyService doctorSpecialtyService,
        SpecialtyService specialtyService,
        PatientService patientService,
        AdminService adminService
    )

    {
        // <summary>
        //Initialize local profile AFTER successful Auth0 authentication
        //Auth0Id and email come FROM VALIDATED TOKEN (never from DTO)
        //</summary>

        public async Task<ServiceResponse<ProfileDto>> RegisterUser(

            RegisterUserDto registerUserDto
        )
        {
            Auth0UserInfoDto? auth0User = null;
            try
            {
                //Search the user by Email 
                var userByEmail = await appContext.Users.AnyAsync(u => u.Email == registerUserDto.Email);

                if (userByEmail)
                {
                    logger.LogInformation("User with this email exists");
                    throw new BadHttpRequestException("User with  this email already exist ");

                }

                // search the user by phone number 
                var userByPhone = await appContext.Users.AnyAsync(u => u.Phone == registerUserDto.Phone);

                if (userByPhone)
                {
                    logger.LogInformation("User with this phone number exists");
                    throw new BadHttpRequestException("User with  this phone number already exist ");

                }

                // Create user in Auth0
                Guid userId = Guid.NewGuid();

                // Create user in Auth0
                auth0User = await auth0Service.CreateUserAsync(registerUserDto, userId);

                logger.LogInformation($"Auth0Created User in USerServices auth0User : {auth0User}");

                if (auth0User == null || auth0User.UserId == null)
                {
                    throw new Exception("Failed to create user in Auth0");
                }

                var user = registerUserDto.ToUserModel();

                // add additional user Entity with auth0user Accordingly 
                user.UserId = userId;
                user.Auth0Id = auth0User.UserId;
                user.ProfilePicture = auth0User.Profile;
                user.IsEmailVerified = auth0User.IsEmailVerified;


                // add User to the database 
                var addUser = await appContext.Users.AddAsync(user);

                // add Doctor , patient , Admin by there own specified work and role 

                Role role = registerUserDto.Role.ConvertToEnum<Role>();

                ProfileDto? userProfile = null;


               // If the user is registering as a patient, we just need to create a patient profile for them

                if(role == Role.Patient)
                {
                    PatientModel patient = await patientService.CreatePatientAsync(registerUserDto.ToCreatePatientDto(addUser.Entity));

                    userProfile = addUser.Entity.ToPatientProfileDto(patient);
                }

                // If the user is registering as a doctor, we need to create a doctor profile for them
                // Add Doctor 
                else if (role == Role.Doctor)
                {
                    var DoctorCv = await fileService.CreateFileAsync(
                        new CreateFileDto(
                            registerUserDto.Cv!.MimeType,
                            registerUserDto.Cv!.FileDataBase64,
                            registerUserDto.Cv!.FileName
                        )
                    );

                    // Creating Doctor 
                    DoctorModel doctor = await doctorService.CreateDoctorAsync(
                        registerUserDto.ToCreateDoctorDto(
                            addUser.Entity,
                            DoctorCv,
                            registerUserDto.Education,
                            registerUserDto.Experience
                        )
                    );

                    // Create  Specialties

                    var specialties = await specialtyService.CreateSpecialtiesAsync
                    (
                     registerUserDto.Specialties.ToSpecialtyList(doctor.DoctorId)
                    );

                    var createDoctorSpecialtyDto = specialties.Select(s => new CreateDoctorSpecialtyDto
                    {
                        DoctorId = doctor.DoctorId,
                        SpecialtyId = s.SpecialtyId
                    }).ToList();


                    // Create Specialty for doctor
                    var doctorSpecialty = await doctorSpecialtyService.CreateDoctorSpecialtiesAsync(createDoctorSpecialtyDto);


                    // Create availabilities
                    var availabilities = await doctorService.AddDoctorAvailabilitiesAsync(registerUserDto.Availabilities,
                    doctor);

                    ICollection<EducationModel> educations = await doctorService.GetDoctorEducationsAsync(doctor.DoctorId);

                    ICollection<ExperienceModel> experiences = await doctorService.GetDoctorExperiencesAsync(doctor.DoctorId);


                    userProfile = addUser.Entity.ToDoctorProfileDto(doctor, availabilities, specialties, educations, experiences);
                }
                else
                {
                    var admin = await adminService.CreateAdminAsync(registerUserDto.ToCreateAdminDto(addUser.Entity));

                    userProfile = addUser.Entity.ToProfileDto();
                }


                try
                {
                    await appContext.SaveChangesAsync();
                    logger.LogInformation("Successfully saved changes to database for user registration ");

                }
                catch (System.Exception ex)
                {

                    logger.LogError(ex, "Failed to save changes to database during user registration");
                    throw new Exception("Database operation failed during user registration", ex);
                }

                return new ServiceResponse<ProfileDto>(success: true,
                statusCode: 201,
                message: "Registration Success! We have sent you an email verification link to your email. Please verify your account.",
                data: userProfile
     );
            }
            catch (Exception ex)
            {

                // include message in response during development; remove or sanitize for production
                var errorMessage = $"failed To register user {ex}";
                return new ServiceResponse<ProfileDto>(
                    false,
                    500,
                    null,
                    errorMessage
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
        private static ProfileDto MapToProfileDto(UserModel user)
        {
            return new ProfileDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                Email = user.Email,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture ?? string.Empty,
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address ?? string.Empty,
                Role = user.Role
            };
        }


        // Login Service 
        public async Task<ServiceResponse<Auth0LoginDto>> LoginUserAsync(LoginUserDto loginUserDto)
        {
            try
            {
                var user = await appContext.Users.FirstOrDefaultAsync(u => u.Email == loginUserDto.Email);

                if (user == null)
                {
                    throw new KeyNotFoundException("User with that email is not found");
                }

                if (user.Auth0Id == null)
                {
                    throw new KeyNotFoundException("User does not have an Auth0 ID");
                }

                var auth0LoginDto = await auth0Service.LoginUserAsync(loginUserDto, user.Auth0Id);

                logger.LogInformation($"Auth0 Login Response in UserService: {auth0LoginDto}");
                return new ServiceResponse<Auth0LoginDto>(true, 200, auth0LoginDto, "Login success!");

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to login user");
                throw;
            }
        }

        // Get All user Service Worked here 
        public async Task<ServiceResponse<List<ProfileDto?>>> GetAllUsersAsync()
        {
            try
            {
                var users = await appContext.Users.ToListAsync();

                var profiles = new List<ProfileDto?>();

                foreach (UserModel u in users)
                {
                    if (u.Role == Role.Patient)
                    {
                        try
                        {
                            profiles.Add(await patientService.GetPatientProfileAsync(u.UserId));
                        }
                        catch (KeyNotFoundException ex)
                        {
                            logger.LogWarning(ex, "Patient profile missing for UserId {UserId}. Returning basic user profile.", u.UserId);
                            profiles.Add(u.ToProfileDto());
                        }
                    }
                    else if (u.Role == Role.Doctor)
                    {
                        try
                        {
                            profiles.Add(await doctorService.GetDoctorProfileAsync(u.UserId));
                        }
                        catch (KeyNotFoundException ex)
                        {
                            logger.LogWarning(ex, "Doctor profile missing for UserId {UserId}. Returning basic user profile.", u.UserId);
                            profiles.Add(u.ToProfileDto());
                        }
                    }
                    else
                    {
                        profiles.Add(u.ToProfileDto());
                    }
                }

                return new ServiceResponse<List<ProfileDto?>>(true, 200, profiles, "Successfully retrieved all users");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get all users");
                throw new Exception("Failed to get all users from database", ex);
            }
        }

        // Update User Profile Service
        public async Task<ServiceResponse> UpdateUserProfile(UpdateProfileDto updateProfileDto)
        {
            try
            {
                Guid userId = updateProfileDto.UserId.ConvertToGuid();

                var user = await appContext.Users.FirstOrDefaultAsync(U => U.UserId == userId);
                if (user == null)
                {
                    throw new KeyNotFoundException("User with that id is not found.");
                }

                // Update only the fields that are provided in the DTO (non-null)
                user.FirstName = updateProfileDto.FirstName ?? user.FirstName;
                user.LastName = updateProfileDto.LastName ?? user.LastName;
                user.ProfilePicture = updateProfileDto.ProfilePicture ?? user.ProfilePicture;
                user.Phone = updateProfileDto.Phone ?? user.Phone;

                user.Address = updateProfileDto.Address ?? user.Address;


                user.DateOfBirth = updateProfileDto.DateOfBirth == null ? user.DateOfBirth : updateProfileDto.DateOfBirth.ConvertTo<DateOnly>();

                user.Gender = updateProfileDto.Gender != null ? updateProfileDto.Gender.ConvertToEnum<Gender>() : user.Gender;

                if (updateProfileDto.Email != null && updateProfileDto.Email != user.Email)
                {
                    user.Email = updateProfileDto.Email;
                    user.IsEmailVerified = false; // Mark email as unverified if it has been changed
                }

                ProfileDto? updatedProfile = null;

                if (user.Role == Role.Doctor)
                {
                    updatedProfile = await doctorService.UpdateDoctorProfileAsync
                    (
                        new UpdateDoctorProfileDto
                        (
                            userId,
                            updateProfileDto.Specialties, updateProfileDto.Qualifications, updateProfileDto.Biography,
                            updateProfileDto.Availabilities,
                            updateProfileDto.DoctorStatus,
                            updateProfileDto.Educations, updateProfileDto.Experiences
                        )
                  );
                }
                await appContext.SaveChangesAsync();

                return new ServiceResponse<ProfileDto>(true, 200, updatedProfile, "Profile Update Success");



            }
            catch (System.Exception)
            {

                logger.LogInformation("Error occurred when trying to get all user");
                throw;
            }
        }
        // Delete User Service
        public async Task<ServiceResponse> DeleteUserAsync(Guid userId)
        {
            try
            {
                var user = await appContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return new ServiceResponse(false, 404, "User not found");
                }

                if (user.Auth0Id != null)
                {
                    await auth0Service.DeleteUserAsync(user.Auth0Id);
                }

                // Remove user appointments if exist
                // await appointmentService.DeleteAppointmentWhereUserIdAsync(userId);

                appContext.Users.Remove(user);
                await appContext.SaveChangesAsync();

                return new ServiceResponse(true, 204, "User deleted successfully");
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to delete user with ID: {UserId}", userId);

                throw new Exception("Failed to delete user", ex);
            }

        }


        // Get user profile by user id
        public async Task<ServiceResponse<ProfileDto>> GetUserProfileAsync(Guid userId)
        {
            try
            {
                var user = await appContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return new ServiceResponse<ProfileDto>(false, 404, null, "User not found");
                }

                ProfileDto? profile = null;

                if (user.Role == Role.Doctor)
                {
                    profile = await doctorService.GetDoctorProfileAsync(user.UserId);
                }
                else if (user.Role == Role.Patient)
                {
                    profile = await patientService.GetPatientProfileAsync(userId);
                }

                return new ServiceResponse<ProfileDto>(true, 200, profile, "User profile retrieved successfully");
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to get user profile with ID: {UserId}", userId);

                throw new Exception("Failed to get user profile", ex);
            }
        }

        // Email verification check service
        public async Task<ServiceResponse<bool?>> CheckEmailVerified(string email)
        {
            try
            {
                var user = await appContext.Users.FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    return new ServiceResponse<bool?>(false, 404, false, "User not found");
                }

                if (user.IsEmailVerified)
                {
                    logger.LogInformation("Email is verified for user with email: {Email}", email);
                    return new ServiceResponse<bool?>(true, 200, true, "Email is verified");
                }
                if (user.Auth0Id == null)
                {
                    throw new KeyNotFoundException("User doesn't have an account.");
                }

                var isEmailVerified = await auth0Service.IsEmailVerified(user.Auth0Id);


                if (isEmailVerified == null)
                {
                    logger.LogError("Failed to retrieve email verification status from Auth0 for user with email: {Email}", email);
                    throw new Exception("Failed to verify email.");
                }
                // Sync the auth0 email verification status with the user entity
                user.IsEmailVerified = (bool)isEmailVerified;

                await appContext.SaveChangesAsync();


                return new ServiceResponse<bool?>(true, 200, user.IsEmailVerified, "Email verification status retrieved successfully");
            }

            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to check email verification for email: {Email}", email);

                throw new Exception("Failed to check email verification", ex);
            }
        }

        // <summary>
        // Get user by email (used in OTP controller for sending OTP to the correct user)
        // </summary>

        public async Task<UserModel?> GetUserByEmail(string email)
        {
            try
            {
                return await appContext.Users
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (System.Exception)
            {
                logger.LogError("Failed to get user by email: {Email}", email);
                throw;
            }
        }


        // Update user (used in OTP controller to update user entity after OTP verification)
        public async Task UpdateUser(UserModel user)
        {
            try
            {
                appContext.Users.Update(user);
                await appContext.SaveChangesAsync();
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to update user with ID: {UserId}", user.UserId);
                throw new Exception("Failed to update user", ex);
            }
        }

    }
}