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
}

public class ConversationDtoBase : IConversationDto
{
  public required Guid ConversationId { get; set; }
  public required ICollection<IProfileDto> Participants { get; set; }
  public DateTime? LastMessageAt { get; set; }
  public string Status { get; set; } = "active";
}

public class CreateConversationDto
{
  [Required]
  [GuidCollection]
  public required ICollection<Guid> Participants = [];
}
