using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Attributes;
using System.ComponentModel.DataAnnotations;


namespace BackendAPI.Source.Models.Dto
{
    public record ProfileDto
    {
        public required Guid UserId { get; init; }
        public required string FirstName { get; init; }
        public required string LastName { get; init; }
        public required string Email { get; init; }
        public required string ProfilePicture { get; init; }
        public required string Phone { get; init; }
        public required Gender Gender { get; init; }
        public required DateOnly DateOfBirth { get; init; }
        public required string Address { get; init; }
        public required Role Role { get; init; }
    }

    public record Auth0ProfileDto
    {
        public Guid UserId { get; init; }
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public Role Role { get; init; }
        public String Phone { get; init; } = string.Empty;
        public Gender Gender { get; init; }
        public string DateOfBirth { get; init; } = string.Empty;
    }

    public record DoctorProfileDto : ProfileDto
    {
        public required Guid DoctorId { get; init; }
        public required List<string> Specialties { get; init; } = [];
        public required List<DoctorAvailabilityDto> Availabilities { get; init; } = [];
        public required string Qualifications { get; init; }
        public required string Biography { get; init; }

        public required DoctorStatus DoctorStatus { get; init; }
        public required List<EducationDto> Educations { get; init; } = [];
        public required List<ExperienceDto> Experiences { get; init; } = [];
    }


    public record UpdateProfileDto
    {
        public required string UserId { get; init; }
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string? ProfilePicture { get; init; }
        public string? Phone { get; init; }
        public string? Gender { get; init; }
        public string? DateOfBirth { get; init; }
        public string? Address { get; init; }

        [EmailAddress]
        public string? Email { get; set; }
        public string? MedicalHistory { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }

        // If the user is a doctor, they may/may-not specify the following
        // Note the following fields MUST be validated in the controller based on the Role field provided as payload
        public List<string>? Specialties { get; set; }
        public List<DoctorAvailabilityDto>? Availabilities { get; set; }
        public string? Qualifications { get; set; }
        public string? Biography { get; set; }
        public string? DoctorStatus { get; set; }
        public CreateFileDto? Cv { get; set; }
        public List<UpdateEducationDto>? Educations { get; set; }
        public List<UpdateExperienceDto>? Experiences { get; set; }
    }

    public record PatientProfileDto : ProfileDto
    {
        public required Guid PatientId {get;set;}
         public required string MedicalHistory { get; init; }
        public required string EmergencyContactName { get; init; }
        public required string EmergencyContactPhone { get; init; }
    }
}