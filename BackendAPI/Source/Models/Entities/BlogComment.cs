using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities;

public class BlogComment : BaseEntity
{
  public Guid BlogCommentId { get; set; }

  public Guid BlogId { get; set; } // <<FK>>

  public Guid SenderId { get; set; } // <<FK>>

  public required string CommentText { get; set; }
  
  public Guid? ParentCommentId { get; set; } // <<FK>> - Optional parent for replies
  public virtual BlogComment? ParentComment { get; set; } // <<NAV>>
  public virtual ICollection<BlogComment> Replies { get; set; } = new HashSet<BlogComment>();

  public virtual Blog? Blog { get; set; } // <<NAV>>
  public virtual UserModel? Sender { get; set; } // <<NAV>>
}
