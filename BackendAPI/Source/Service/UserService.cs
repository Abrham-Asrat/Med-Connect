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
        /// <summary>
        /// Initialize local profile AFTER successful Auth0 authentication
        /// Auth0Id and email come FROM VALIDATED TOKEN (never from DTO)
        /// </summary>
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

        public async Task<ServiceResponse<ProfileDto>> LoginUserAsync(string auth0Id)
        {
            if (string.IsNullOrWhiteSpace(auth0Id))
                return new ServiceResponse<ProfileDto>(false, 401, null, "Missing user identifier in token");

            var user = await GetUserByAuth0IdAsync(auth0Id);
            if (user == null)
                return new ServiceResponse<ProfileDto>(false, 404, null, "User not found. Please register first.");

            user.LastLogin = DateTime.UtcNow;

            await appContext.SaveChangesAsync();

            if (user.Role == Role.Doctor)
            {
                var doctor = await appContext.Doctors
                    .FirstOrDefaultAsync(d => d.UserId == user.UserId);

                if (doctor == null)
                    return new ServiceResponse<ProfileDto>(false, 500, null, "Doctor profile is missing for this user.");

                var availabilities = await appContext.DoctorAvailabilities
                    .Where(a => a.DoctorId == doctor.DoctorId)
                    .ToListAsync();

                var specialtyIds = await appContext.DoctorSpecialties
                    .Where(ds => ds.DoctorId == doctor.DoctorId)
                    .Select(ds => ds.SpecialtyId)
                    .ToListAsync();

                var specialties = await appContext.Specializations
                    .Where(s => specialtyIds.Contains(s.SpecialtyId))
                    .ToListAsync();

                var educations = await doctorService.GetDataAsync<EducationModel>(doctor.DoctorId);
                var experiences = await doctorService.GetDataAsync<ExperienceModel>(doctor.DoctorId);

                var doctorDto = user.ToDoctorProfileDto(doctor, availabilities, specialties, educations, experiences);
                return new ServiceResponse<ProfileDto>(true, 200, doctorDto, "Login successful");
            }

            var profileDto = MapToProfileDto(user);
            return new ServiceResponse<ProfileDto>(true, 200, profileDto, "Login successful");
        }
    }
}