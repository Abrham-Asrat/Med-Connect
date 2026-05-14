using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Entities;

public class Message : BaseEntity
{
  public Guid MessageId { get; set; } = Guid.NewGuid(); // <<PK>>
  public string? MessageText { get; set; }
  
  public MessageType Type { get; set; } = MessageType.text;
  public bool IsRead { get; set; } = false;

  // Voice Note Payload Support
  public string? AudioUrl { get; set; }
  public string? AudioDuration { get; set; }

  public virtual ICollection<FileModel>? Files { get; set; } = new HashSet<FileModel>();

  public Guid? SenderId { get; set; }   // null = system message
  public virtual UserModel? Sender { get; set; }

  public Guid ConversationId { get; set; }
  public virtual Conversation? Conversation { get; set; }

  // Virtual relation to Official Pharmacological Prescriptions issued within this message bubble
  public virtual PrescriptionModel? PrescriptionDetails { get; set; }
}
