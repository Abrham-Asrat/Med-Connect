
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class DtoExtensions
    {

        /// Maps RegisterUserDto to User,
        public static UserModel ToUser(this RegisterUserDto dto, string auth0Id)
        {
            return new UserModel
            {
                Auth0Id = auth0Id, // ✅ Comes ONLY from validated token
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email, // Set Email property as required
                Phone = dto.Phone,
                Address = dto.Address,
                Gender = Enum.Parse<Gender>(dto.Gender, true),
                Role = Enum.Parse<Role>(dto.Role, true),
                DateOfBirth = DateOnly.Parse(dto.DateOfBirth)
            };
        }

        public static ProfileDto ToProfileDto(this UserModel user)
        {
            return new ProfileDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                Address = user.Address ?? string.Empty,
                Gender = user.Gender,
                Role = user.Role,
                DateOfBirth = user.DateOfBirth,
                ProfilePicture = user.ProfilePicture // Ensure this property exists in UserModel
            };
        }
    }
}