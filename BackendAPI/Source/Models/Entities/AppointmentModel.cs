using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Entities
{
    public class AppointmentModel : BaseEntity
    {
        public Guid AppointmentId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid DoctorId { get; set; }

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public string AppointmentReason { get; set; } = string.Empty;

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeOnly AppointmentTime { get; set; }

        [Required]
        public TimeSpan AppointmentTimeSpan { get; set; } = TimeSpan.FromMinutes(30);

        [Required]
        public AppointmentType AppointmentType { get; set; }

        [Required]
        public AppointmentStatus AppointmentStatus { get; set; } = AppointmentStatus.scheduled;

        public virtual required DoctorModel Doctor { get; set; }
        // public virtual required PatientModel Patient { get; set; }
        
    }
}