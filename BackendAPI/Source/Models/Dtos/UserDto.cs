using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Attributes;

namespace BackendAPI.Source.Models.Dtos
{
    public record UserDto
    {
        public Guid Id { get; init; }
        public string FirstName { get; init; } = null!;
        public string LastName { get; init; } = null!;
        public string Email { get; init; } = null!;
        public string Phone { get; init; } = null!;

    }

    public record RegisterUserDto
    {
        [Required]
        public required string FirstName { get; init; }

        [Required]
        public required string LastName { get; init; }

        [Required]
        [EmailAddress]
        public required string Email { get; init; }


        [Required]
        [PasswordAttributes(8)]
        public required string Password { get; init; }

        [Required]
        [Phone]
        [MinLength(4, ErrorMessage = "The field must be at least 4 characters long.")]
        public required string Phone { get; init; }

        [Required]
        public required string Gender { get; init; }

        [Required]
        public required string DateOfBirth { get; init; }

        [Required]
        public required string Address { get; init; }

        [Required]
        public required string Role { get; init; }
    }
    
    /// <summary>
       /// These are the fields what a newly created Auth0 User will have
    /// </summary>
    /// <param name="UserId"></param>
    /// <param name="Profile"></param>
    /// <param name="EmailVerified"></param>
    public record Auth0UserDto(string UserId, string Profile, bool EmailVerified);
}