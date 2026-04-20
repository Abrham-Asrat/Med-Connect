using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities;

public class BlogLike : BaseEntity
{
  public Guid BlogLikeId { get; set; } = Guid.NewGuid();

  public Guid UserId { get; set; } // <<FK>>

  public Guid BlogId { get; set; } // <<FK>>

  public virtual UserModel? User { get; set; }
  public virtual Blog? Blog { get; set; }
}
