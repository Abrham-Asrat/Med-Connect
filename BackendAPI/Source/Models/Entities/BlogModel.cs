using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities;

public class Blog : BaseEntity
{
  public Guid BlogId { get; set; } = Guid.NewGuid();

  public required string Title { get; set; }

  public required string Content { get; set; }

  public Guid? ImageId { get; set; } // <<FK>> - Optional image for blog
  public virtual FileModel? Image { get; set; }

  public required Guid AuthorId { get; set; } // <<FK>>
  public virtual UserModel? Author { get; set; }

  public virtual ICollection<BlogComment> BlogComments { get; set; } = new HashSet<BlogComment>();

  public virtual ICollection<BlogLike> BlogLikes { get; set; } = new HashSet<BlogLike>();

  public virtual ICollection<BlogTag> BlogTags { get; set; } = new HashSet<BlogTag>();
}
