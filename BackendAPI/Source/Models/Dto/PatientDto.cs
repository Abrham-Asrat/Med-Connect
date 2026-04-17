using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Dto
{
    public record PatientDto
    {
        public Guid PatientId { get; set; }
        public Guid UserId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required bool IsEmailVerified { get; set; }
        public required string Phone { get; set; }
        public required Gender Gender { get; set; }
        public required DateOnly DateOfBirth {get;set;}
        public required string ProfilePicture{ get; set; }
        public required string Address { get; set; }

        public required string MedicalHistory { get; set; }
        public required string EmergencyContactName { get; set; }
        public required string EmergencyContactPhone { get; set; }
    }

    public record CreatePatientDto
    {
        public required UserModel User { get; init; }
        public  string? MedicalHistory { get; set; }
        public  string? EmergencyContactName { get; set; }
        public  string? EmergencyContactPhone { get; set; }
    }

    public record UpdatePatientProfileDto(
        Guid UserId,
        string? MedicalHistory,
        string? EmergencyContactName,
        string? EmergencyContactPhone
    );

}