
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
        public required Guid UserId { get; init; }
        public required string FirstName { get; init; }
        public required string LastName { get; init; } 
        public required string Phone { get; init; } 
        public required Gender Gender { get; init; }
        public required DateOnly DateOfBirth {get; init;}
        public required string Address { get; init; }
        public required string ProfilePicture { get; init; }
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

        // [Required(ErrorMessage = "Email is required")]
        // [EmailAddress]
        // public required string Email { get; init; } // Fallback only

        [Phone]
        [MinLength(4)]
        [MaxLength(20)]
        public required string Phone { get; init; }

        [Required(ErrorMessage = "Gender is required")]
        public required string Gender { get; init; }

        [Required(ErrorMessage = "Date of birth is required")]
        [DataType(DataType.Date)]
        public required string DateOfBirth { get; init; }

        [StringLength(500)]
        public required string Address { get; init; }

        [Required(ErrorMessage = "Role is required")]
        [RoleValidation]
        public required string Role { get; init; }


        // Optional patient-specific fields (can be null for doctors)
        public string? MedicalHistory { get; init; }
        public string? EmergencyContact { get; init; }
        public string? EmergencyPhone { get; init; }


        // Optional doctor-specific fields (can be null for patients)
        public List<string> Specialties { get; init; } = [];
        public List<DoctorAvailabilityDto> Availabilities { get; init; } = [];   

        public string? Qualifications { get; init; }
        public string? Biography { get; init; }
        public DoctorStatus? DoctorStatus { get; init; }

        public CreateFileDto? Cv { get; init; }
        public required decimal OnlineAppointmentFee { get; init; }
        public required decimal InPersonAppointmentFee { get; init; }

        public List<CreateEducationDto> Education { get; init; } = [];
        public List<CreateExperienceDto> Experience { get; init; } = [];
    }
     

   

    // <summary>
    // Dto for Login data transfer object Access token response, not used in this backend as Auth0 handles authentication, but defined for completeness and potential future use
    // </summary>
    public record LoginResponseDto
    {
        public required string AccessToken { get; init; }
        public required DateTime ExpiresAt { get; init; }
    }

}