using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Dto
{
    public record AppointmentDto
    {
        public Guid AppointmentId { get; init; }

        public DoctorDto? Doctor { get; init; }
        // public PatientDto? Patient { get; init; }
        public Guid PatientId { get; init; }
        public DateOnly AppointmentDate { get; init; }
        public TimeOnly AppointmentTime { get; init; }
        public AppointmentType AppointmentType { get; init; }
    }
}