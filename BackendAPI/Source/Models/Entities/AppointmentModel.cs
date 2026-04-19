using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Entities;

public class Appointment : BaseEntity
{
  public Guid AppointmentId { get; set; } = Guid.NewGuid();

  [Required]
  public Guid DoctorId { get; set; } // <<FK>>

  [Required]
  public Guid PatientId { get; set; } // <<FK>>

  [Required]
  public DateOnly AppointmentDate { get; set; }

  [Required]
  public TimeOnly AppointmentTime { get; set; }

  [Required]
  public TimeSpan AppointmentTimeSpan { get; set; } = TimeSpan.FromMinutes(30);

  [Required]
  public AppointmentType AppointmentType { get; set; }
  public AppointmentStatus Status { get; set; } = AppointmentStatus.scheduled;

  public virtual required DoctorModel Doctor { get; set; } // <<NAV>>
  public virtual required PatientModel Patient { get; set; } // <<NAV>>
}
