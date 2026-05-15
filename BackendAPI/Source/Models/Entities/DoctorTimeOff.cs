using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Source.Models.Entities
{
    public class DoctorTimeOff
    {
        [Key]
        public Guid TimeOffId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid DoctorId { get; set; }
        public virtual DoctorModel? Doctor { get; set; }

        public required DateTime StartDate { get; set; }
        public required DateTime EndDate { get; set; }

        public string? Reason { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
