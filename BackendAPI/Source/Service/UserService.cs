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
        SpecialtyService specialtyService
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

                // Add Doctor 
                if (role == Role.Doctor)
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

                List<ProfileDto?> profiles = [];

                foreach (UserModel u in users)
                {
                    if (u.Role == Role.Doctor)
                    {
                        profiles.Add(await doctorService.GetDoctorProfileAsync(u.UserId));
                    }

                }

                return new ServiceResponse<List<ProfileDto?>>(true, 200, profiles, "Successfully retrieved all users");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get all users");
                throw new Exception("Failed to Get all users from database", ex);
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
                            updateProfileDto.Specialties,updateProfileDto.Qualifications, updateProfileDto.Biography,
                            updateProfileDto.Availabilities,
                            updateProfileDto.DoctorStatus,
                            updateProfileDto.Educations, updateProfileDto.Experiences
                        )                       
                  );
                }
                await appContext.SaveChangesAsync();

                return new ServiceResponse<ProfileDto> (true , 200 , updatedProfile , "Profile Update Success");



            }
            catch (System.Exception)
            {

                logger.LogInformation("Error occurred when trying to get all user");
                throw ;
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

                return new ServiceResponse<ProfileDto>(true, 200, profile, "User profile retrieved successfully");
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Failed to get user profile with ID: {UserId}", userId);

                throw new Exception("Failed to get user profile", ex);
            }
        }
    }
}