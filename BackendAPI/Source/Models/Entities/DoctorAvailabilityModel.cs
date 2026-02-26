using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class DoctorAvailabilityModel
    {
        public Guid DoctorAvailabilityID { get; set; } = Guid.NewGuid();

        [Required]
        public required Guid DoctorId { get; set; }
        [Required]
        public required DayOfWeek AvailableDay { get; set; }
        public required TimeOnly StartTime { get; set; } = TimeOnly.MinValue.AddHours(6);
        public required TimeOnly EndTime { get; set; } = TimeOnly.MinValue.AddHours(-6);
        
        public virtual required DoctorModel Doctor{ get; set; }
    }
}