using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Entities
{
    public class Conversation : BaseEntity
{
  public Guid ConversationId { get; set; } = Guid.NewGuid(); // <<PK>>

  /// <summary>
  /// Manages the state lockout for telemedicine UI routing
  /// </summary>
  public AppointmentStatus Status { get; set; } = AppointmentStatus.active;

  /// <summary>
  /// Foreign key linking this chat room to its specific telemedicine appointment
  /// </summary>
  public Guid? AppointmentId { get; set; }
  public virtual Appointment? Appointment { get; set; }

  /// <summary>
  /// Timestamp of the last interaction to correctly sort chat lists
  /// </summary>
  public DateTime? LastMessageAt { get; set; }

  public virtual ICollection<Message> Messages { get; set; } = new HashSet<Message>();
  public virtual ICollection<ConversationMembershipModel> ConversationMemberships { get; set; } =
    new HashSet<ConversationMembershipModel>();
}
}