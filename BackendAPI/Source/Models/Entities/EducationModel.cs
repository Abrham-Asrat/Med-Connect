using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities
{
    public class EducationModel
    {
        public Guid EducationId { get; set; } = Guid.NewGuid();

        [Required]
        public required string Degree { get; set; }

        [Required]
        public required string Institution { get; set; }

        [Required]
        public required DateTime GraduationDate { get; set; }

        public virtual DoctorModel? Doctor { get; set; }
    }
}