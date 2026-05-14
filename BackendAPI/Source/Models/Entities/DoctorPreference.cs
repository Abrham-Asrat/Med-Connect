using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities;

public class DoctorPreference
{
  [Key]
  public required Guid DoctorId { get; set; }
  public virtual DoctorModel? Doctor { get; set; }

  public required decimal OnlineAppointmentFee { get; set; }
  public required decimal InPersonAppointmentFee { get; set; }

  /// <summary>Whether the doctor accepts virtual/online appointments.</summary>
  public bool AcceptsOnline { get; set; } = true;

  /// <summary>Whether the doctor accepts in-person clinic appointments.</summary>
  public bool AcceptsInPerson { get; set; } = true;

  /// <summary>Name of the clinic or hospital where the doctor sees patients in person.</summary>
  public string? ClinicName { get; set; }

  /// <summary>Street address of the clinic.</summary>
  public string? ClinicAddress { get; set; }

  /// <summary>City where the clinic is located.</summary>
  public string? ClinicCity { get; set; }
}
