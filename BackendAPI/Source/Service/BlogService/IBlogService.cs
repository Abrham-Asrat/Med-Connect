using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;

namespace BackendAPI.Source.Service.BlogService
{
public interface IBlogService
{
  Task<BlogDto> CreateBlogAsync(CreateBlogDto createBlogDto);

  Task<List<BlogDto>> GetAllBlogsAsync();
  Task<List<BlogDto>> GetTrendingBlogsAsync(int count = 5);


  Task<BlogDto> GetBlogAsync(Guid blogId);

  Task<BlogDto> UpdateBlogAsync(Guid blogId, EditBlogDto editBlogDto);

  Task<Blog> GetBlogIfExists(Guid blogId);

  void DeleteAllBlogs();

  Task DeleteBlogAsync(Guid blogId);

  Task<ICollection<Tag>> CreateTagsAsync(IList<string> tags);

  Task<ICollection<BlogTag>> CreateBlogTagAssocAsync(Guid blogId, ICollection<Tag> tags);

  Task<BlogCommentDto> CreateBlogCommentAsync(CreateBlogCommentDto createBlogCommentDto);

  Task<ICollection<BlogCommentDto>> GetBlogCommentsAsync(Guid blogId);
  Task<BlogCommentDto> UpdateBlogCommentAsync(Guid commentId, EditBlogCommentDto editBlogCommentDto);
  Task<bool> DeleteBlogCommentAsync(Guid commentId);

  Task<BlogLikeDto?> CreateBlogLikeAsync(CreateBlogLikeDto createBlogLikeDto);
}
}