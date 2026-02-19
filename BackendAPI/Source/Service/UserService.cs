using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Helpers.Extensions;


namespace BackendAPI.Source.Service
{
    public class UserService
     (
        ApplicationDbContext appContext,
        Auth0Service auth0Service,
        ILogger<UserService> logger
    )
    {
        public async Task<ServiceResponse<ProfileDto>> RegisterUser(RegisterUserDto registerUserDto)
        {
            Auth0UserDto? auth0User = null;

            try
            {
                // Search user by the email 

                var userByMail = await appContext.Users.AnyAsync(u => u.Email == registerUserDto.Email);

                if (userByMail)
                {
                    return new ServiceResponse<ProfileDto>(false, 409, null, "User with the given email already exists");
                }

                var userByPhone = await appContext.Users.AnyAsync(u => u.Phone == registerUserDto.Phone);

                if (userByPhone)
                {
                    return new ServiceResponse<ProfileDto>(false, 409, null, "User with the given phone number already exists");
                }

                Guid userId = Guid.NewGuid();

                // create user in auth0
                auth0User = await auth0Service.CreateUserAsync(registerUserDto, userId);


                logger.LogInformation($"Auth0 User Created: {auth0User}");

                if (auth0User == null || auth0User?.UserId == null)
                {
                    logger.LogError($"Auth0 User Creation Failed for email: {registerUserDto.Email}");
                    return new ServiceResponse<ProfileDto>(false, 500, null, "Failed to create user in authentication service");
                }


                // Convert dto to user entity or Model
                var userEntity = registerUserDto.ToUser();

                userEntity.UserId = userId;
                userEntity.Auth0Id = auth0User.UserId;
                userEntity.ProfilePicture = auth0User.Profile;
                userEntity.IsEmailVerified = auth0User.EmailVerified;

                // Save user to database
                var addUser = await appContext.Users.AddAsync(userEntity);

                if (addUser == null)
                {
                    logger.LogError($"Failed to add user to database for email: {registerUserDto.Email}");
                    return new ServiceResponse<ProfileDto>(false, 500, null, "Failed to create user in database");
                }

                await appContext.SaveChangesAsync();


                return new ServiceResponse<ProfileDto>(true, 201, null, "Registration Success! We have sent you an email verification link to your email. Please verify your account.");  
            }
            catch (System.Exception)
            {

                throw;
            }

        }
    }
}