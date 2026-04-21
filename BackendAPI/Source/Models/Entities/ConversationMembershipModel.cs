using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class ConversationMembershipModel
    {
         public Guid UserId { get; set; }
  public virtual UserModel? User { get; set; }

  public Guid ConversationId { get; set; }
  public virtual Conversation? Conversation { get; set; }
        
    }
}