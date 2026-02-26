using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class ExperienceModel
    {
        public Guid ExperienceId { get; set; } = Guid.NewGuid();
        public required string Institution { get; set; }
        public required string Position { get; set; }   
        public required DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public required Guid DoctorId { get; set; }
        public virtual DoctorModel? Doctor { get; set; }

    }
}