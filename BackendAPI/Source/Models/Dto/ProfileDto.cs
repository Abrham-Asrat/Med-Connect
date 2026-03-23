using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Dto
{
    public record ProfileDto
    {
        public required Guid UserId { get; init; }
        public required string FirstName { get; init; }
        public required string LastName { get; init; }
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
}