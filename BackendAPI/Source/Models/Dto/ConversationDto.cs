using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Models.Dto;
using Microsoft.AspNetCore.Antiforgery;
using Xunit;

public interface IConversationDto
{
  Guid ConversationId { get; set; }
  ICollection<IProfileDto> Participants { get; set; }
  DateTime? LastMessageAt { get; set; }
  string Status { get; set; }
  string? AppointmentType { get; set; }
}

public class ConversationDtoBase : IConversationDto
{
  public required Guid ConversationId { get; set; }
  public required ICollection<IProfileDto> Participants { get; set; }
  public DateTime? LastMessageAt { get; set; }
  public string Status { get; set; } = "active";
  public string? AppointmentType { get; set; }
}

public class CreateConversationDto
{
  [Required]
  [GuidCollection]
  public required ICollection<Guid> Participants = [];

  /// <summary>
  /// Optional: link this conversation to a specific appointment.
  /// When provided, the chat service will send a welcome system message
  /// to the doctor and schedule auto-close 7 days after the appointment date.
  /// </summary>
  public Guid? AppointmentId { get; set; }
}
