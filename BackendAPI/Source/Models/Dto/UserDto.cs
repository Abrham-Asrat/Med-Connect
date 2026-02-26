
using System;
using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Attributes;

namespace BackendAPI.Source.Models.Dto
{
    /// <summary>
    /// Read-only user representation for API responses
    /// </summary>
    public record UserDto
    {
        public Guid Id { get; init; }
        public string FirstName { get; init; } = null!;
        public string LastName { get; init; } = null!;
        public string Email { get; init; } = null!;
        public string Phone { get; init; } = null!;
        public string Role { get; init; } = null!;
        public bool IsEmailVerified { get; init; }
    }

    /// <summary>
    /// Used ONLY for initializing local profile AFTER Auth0 authentication
    /// Passwords are NEVER handled by this backend
    /// </summary>
    public record RegisterUserDto
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, MinimumLength = 1)]
        public required string FirstName { get; init; }

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, MinimumLength = 1)]
        public required string LastName { get; init; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public required string Email { get; init; } // Fallback only

        [Phone]
        [MinLength(4)]
        [MaxLength(20)]
        public required string Phone { get; init; }

        [Required(ErrorMessage = "Gender is required")]
        [GenderAttribute]
        public required string Gender { get; init; }

        [Required(ErrorMessage = "Date of birth is required")]
        [DataType(DataType.Date)]
        public required string DateOfBirth { get; init; }

        [StringLength(500)]
        public required string Address { get; init; }

        [Required(ErrorMessage = "Role is required")]
        [RoleValidation]
        public required string Role { get; init; }
    }
}