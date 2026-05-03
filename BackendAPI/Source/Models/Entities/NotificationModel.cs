using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Entities;

public class Notification : BaseEntity
{
  public Guid NotificationId { get; set; } = Guid.NewGuid();

  [Required]
  public required Guid UserId { get; set; } // <<FK>>

  [Required]
  public required NotificationType NotificationType { get; set; }

  [Required]
  public required string Message { get; set; }

  public bool IsRead { get; set; } = false;

  public virtual UserModel? User { get; set; }
}
