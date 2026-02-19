
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class DtoExtensions
    {

         /// Maps RegisterUserDto to User,
        public static UserModel ToUser(this RegisterUserDto dto)
        {
            return new UserModel()
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                Gender = Enum.Parse<Gender>(dto.Gender, true),
                Role = Enum.Parse<Role>(dto.Role, true),
                DateOfBirth = DateOnly.Parse(dto.DateOfBirth)
            };
        }
    }
}