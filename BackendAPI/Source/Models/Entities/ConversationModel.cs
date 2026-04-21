using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class Conversation : BaseEntity
{
  public Guid ConversationId { get; set; } = Guid.NewGuid(); // <<PK>>
  public virtual ICollection<Message> Messages { get; set; } = new HashSet<Message>();
  public virtual ICollection<ConversationMembershipModel> ConversationMemberships { get; set; } =
    new HashSet<ConversationMembershipModel>();
}
}