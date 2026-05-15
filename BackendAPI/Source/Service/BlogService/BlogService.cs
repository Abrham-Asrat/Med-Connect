using System.Data;
using Flurl.Util;
using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Services;
using BackendAPI.Source.Service.BlogService;
using Microsoft.EntityFrameworkCore;
using RestSharp;


namespace BackendAPI.Source.Service.BlogService
{
public class BlogService(ApplicationDbContext appContext, ILogger<BlogService> logger) : IBlogService
{
  public async Task<BlogDto> CreateBlogAsync(CreateBlogDto createBlogDto)
  {
    try
    {
      var author = await appContext
        .Doctors.Include(d => d.User)
        .FirstOrDefaultAsync(d => d.UserId == createBlogDto.AuthorId);

      if (author == default)
        throw new KeyNotFoundException(
          "Author with the specified id doesn't exist. Please make sure you provided a userId of a doctor!"
        );

      // Create the tags
      var tags = await CreateTagsAsync(createBlogDto.Tags);

      var blog = createBlogDto.ToBlog();

      var result = await appContext.AddAsync(blog);
      await appContext.SaveChangesAsync();

      // Estabilish association between blog and a tag
      await CreateBlogTagAssocAsync(result.Entity.BlogId, tags);

      return result.Entity.ToBlogDto(author.User, result.Entity.BlogLikes, tags, result.Entity.BlogComments);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to create a blog.");
      throw;
    }
  }

  public async Task<List<BlogDto>> GetAllBlogsAsync()
  {
    try
    {
      var blogs = await appContext
        .Blogs.Include(b => b.Author)
        .Include(b => b.BlogLikes)
        .ThenInclude(b => b.User)
        .Include(b => b.BlogComments)
        .ThenInclude(bc => bc.Sender)
        .Include(b => b.BlogTags)
          .ThenInclude(bt => bt.Tag)
        .Include(b => b.Image)
        .Where(b => b.Author != null)
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => b.ToBlogDto(b.Author!, b.BlogLikes, b.BlogTags.Select(bt => bt.Tag!).ToList(), b.BlogComments))
        .ToListAsync();
      return blogs;
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to get all blogs");
      throw;
    }
  }

  public async Task<List<BlogDto>> GetTrendingBlogsAsync(int count = 5)
  {
    try
    {
      var blogs = await appContext
        .Blogs.Include(b => b.Author)
        .Include(b => b.BlogLikes)
        .ThenInclude(b => b.User)
        .Include(b => b.BlogComments)
        .ThenInclude(bc => bc.Sender)
        .Include(b => b.BlogTags)
          .ThenInclude(bt => bt.Tag)
        .Include(b => b.Image)
        .Where(b => b.Author != null)
        .OrderByDescending(b => b.BlogLikes.Count)
        .Take(count)
        .Select(b => b.ToBlogDto(b.Author!, b.BlogLikes, b.BlogTags.Select(bt => bt.Tag!).ToList(), b.BlogComments))
        .ToListAsync();
      return blogs;
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to get trending blogs");
      throw;
    }
  }


  public async Task<BlogDto> GetBlogAsync(Guid blogId)
  {
    try
    {
      var blog = await appContext
        .Blogs.Include(b => b.Author)
        .Include(b => b.BlogLikes)
        .ThenInclude(bl => bl.User)
        .Include(b => b.BlogComments)
        .ThenInclude(bc => bc.Sender)
        .Include(b => b.BlogTags)
          .ThenInclude(bt => bt.Tag)
        .Include(b => b.Image)
        .FirstOrDefaultAsync(b => b.BlogId == blogId);

      if (blog == default)
        throw new KeyNotFoundException("Blog with the given id is not found!");

      return blog.ToBlogDto(
        blog.Author!,
        blog.BlogLikes,
        blog.BlogTags.Select(bt => bt.Tag!).ToList(),
        blog.BlogComments
      );
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to get blog by id.");
      throw;
    }
  }

  public async Task<BlogDto> UpdateBlogAsync(Guid blogId, EditBlogDto editBlogDto)
  {
    try
    {
      var blog = await appContext
        .Blogs.Include(b => b.Author)
        .Where(b => b.Author != null)
        .Include(b => b.BlogLikes)
        .ThenInclude(bl => bl.User)
        .Include(b => b.BlogComments)
          .ThenInclude(bc => bc.Sender)
        .Include(b => b.Image)
        .FirstOrDefaultAsync(b => b.BlogId == blogId);

      if (blog == default)
        throw new KeyNotFoundException("Blog with the given id doesn't exist. Unable to update.");

      blog.Title = editBlogDto.Title;
      blog.Content = editBlogDto.Content;
      blog.ImageId = editBlogDto.ImageId;

      var tags = await CreateTagsAsync(editBlogDto.Tags);

      // Estabilish association between blog and a tag
      await CreateBlogTagAssocAsync(blog.BlogId, tags);

      await appContext.SaveChangesAsync();
      return blog.ToBlogDto(blog.Author!, blog.BlogLikes, tags, blog.BlogComments);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to update blog.");
      throw;
    }
  }

  /// <summary>
  /// Get a blog by id
  /// </summary>
  /// <param name="blogId"></param>
  /// <returns></returns>
  /// <exception cref="KeyNotFoundException"></exception>
  public async Task<Blog> GetBlogIfExists(Guid blogId)
  {
    var blog = await appContext.Blogs.FirstOrDefaultAsync(b => b.BlogId == blogId);
    if (blog == default)
      throw new KeyNotFoundException("Blog with the given id doesn't exist.");
    return blog;
  }

  public async Task<ICollection<Tag>> CreateTagsAsync(IList<string> tags)
  {
    try
    {
      ICollection<Tag> result = [];

      var existingTags = await appContext.Tags.Where(t => tags.Contains(t.TagName)).ToListAsync();

      foreach (var tag in tags)
      {
        // Search the db for such a tag
        var tagInDb = existingTags.FirstOrDefault(t => t.TagName == tag);

        if (tagInDb != default)
        {
          // if the tag exists no need to create just use it
          result.Add(tagInDb);
        }
        else
        {
          // if there is no such tag then create a new one
          var createdTag = await appContext.Tags.AddAsync(new Tag { TagName = tag });
          result.Add(createdTag.Entity);
        }
      }

      await appContext.SaveChangesAsync();
      return result;
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to create tags.");
      throw;
    }
  }

  public async Task<ICollection<BlogTag>> CreateBlogTagAssocAsync(
    Guid blogId,
    ICollection<Tag> tags
  )
  {
    try
    {
      var blog = await appContext
        .Blogs.Include(b => b.BlogTags)
        .FirstOrDefaultAsync(b => b.BlogId == blogId);

      if (blog == default)
        throw new KeyNotFoundException(
          "Blog with the given id doesn't exist. Unable to create blog tag association."
        );

      // Fetch existing blog-tag associations for the given blogId
      var existingBlogTags = appContext
        .BlogTags.Where(bt => bt.BlogId == blogId)
        .Select(bt => bt.TagId)
        .ToHashSet();

      var blogTagsCreated = new List<BlogTag>();

      foreach (var tag in tags)
      {
        if (!existingBlogTags.Contains(tag.TagId))
        {
          // Add the association to the collection if it doesn't exist
          blogTagsCreated.Add(new BlogTag { BlogId = blogId, TagId = tag.TagId });
        }
      }

      if (blogTagsCreated.Any())
      {
        await appContext.BlogTags.AddRangeAsync(blogTagsCreated);
        await appContext.SaveChangesAsync();
      }

      return await appContext.BlogTags.Where(bt => bt.BlogId == blog.BlogId).ToListAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to create blog tag association.");
      throw;
    }
  }

  public void DeleteAllBlogs()
  {
    try
    {
      appContext.Blogs.RemoveRange(appContext.Blogs);
      appContext.SaveChanges();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "Error deleting all blogs");
      throw;
    }
  }

  public async Task DeleteBlogAsync(Guid blogId)
  {
    try
    {
      var blog = await appContext.Blogs
          .Include(b => b.BlogTags)
          .Include(b => b.BlogLikes)
          .Include(b => b.BlogComments)
          .FirstOrDefaultAsync(b => b.BlogId == blogId);

      if (blog == null)
        throw new KeyNotFoundException("Blog not found.");

      appContext.Blogs.Remove(blog);
      await appContext.SaveChangesAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "Error deleting blog {BlogId}", blogId);
      throw;
    }
  }

  public async Task<BlogCommentDto> CreateBlogCommentAsync(
    CreateBlogCommentDto createBlogCommentDto
  )
  {
    try
    {
      var blog = appContext.Blogs.FirstOrDefault(b => b.BlogId == createBlogCommentDto.BlogId);

      if (blog == default)
        throw new KeyNotFoundException(
          "Blog with the given id doesn't exist. Unable to create blog comment."
        );

      var sender = appContext.Users.FirstOrDefault(u => u.UserId == createBlogCommentDto.SenderId);

      if (sender == default)
        throw new KeyNotFoundException(
          "Sender with the given id doesn't exist. Unable to create blog comment."
        );

      var comment = await appContext.BlogComments.AddAsync(createBlogCommentDto.ToBlogComment());

      await appContext.SaveChangesAsync();

      return comment.Entity.ToBlogCommentDto(sender);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to create blog comment");
      throw;
    }
  }

  public async Task<ICollection<BlogCommentDto>> GetBlogCommentsAsync(Guid blogId)
  {
    try
    {
      var comments = await appContext.BlogComments
        .Where(bc => bc.BlogId == blogId && bc.ParentCommentId == null)
        .Include(bc => bc.Sender)
        .Include(bc => bc.Replies)
          .ThenInclude(r => r.Sender)
        .OrderByDescending(bc => bc.CreatedAt)
        .ToListAsync();

      return comments
        .Select(c => c.ToBlogCommentDto(c.Sender ?? throw new Exception("Include sender")))
        .ToList();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to get blog comments.");
      throw;
    }
  }

  public async Task<BlogCommentDto> UpdateBlogCommentAsync(Guid commentId, EditBlogCommentDto editBlogCommentDto)
  {
    try
    {
      var comment = await appContext.BlogComments
        .Include(c => c.Sender)
        .FirstOrDefaultAsync(c => c.BlogCommentId == commentId);

      if (comment == default)
        throw new KeyNotFoundException("Comment not found.");

      comment.CommentText = editBlogCommentDto.CommentText;
      await appContext.SaveChangesAsync();

      return comment.ToBlogCommentDto(comment.Sender!);
    }
    catch (Exception ex)
    {
       logger.LogError(ex, "Error updating blog comment");
       throw;
    }
  }

  public async Task<bool> DeleteBlogCommentAsync(Guid commentId)
  {
    try
    {
      var comment = await appContext.BlogComments
        .Include(c => c.Replies)
        .FirstOrDefaultAsync(c => c.BlogCommentId == commentId);

      if (comment == default) return false;

      // Also recursively delete replies or handle them? 
      // For now let's just delete the comment. (Cascading delete should handle replies if configured)
      appContext.BlogComments.Remove(comment);
      await appContext.SaveChangesAsync();
      return true;
    }
    catch (Exception ex)
    {
       logger.LogError(ex, "Error deleting blog comment");
       throw;
    }
  }

  /// <summary>
  /// Create a blog like. If called subsequently acts as a toggle between like and unlike.
  /// In other words creates and deletes a like.
  /// </summary>
  /// <param name="createBlogLikeDto"></param>
  /// <returns></returns>
  public async Task<BlogLikeDto?> CreateBlogLikeAsync(CreateBlogLikeDto createBlogLikeDto)
  {
    try
    {
      var blog = await GetBlogIfExists(createBlogLikeDto.BlogId);
      var user = await appContext.Users.FirstOrDefaultAsync(u =>
        u.UserId == createBlogLikeDto.UserId
      );
      if (user == default)
        throw new KeyNotFoundException(
          "User(Liker) with the given id doesn't exist. Unable to create blog like."
        );
      var blogLikeExists = await appContext.BlogLikes.FirstOrDefaultAsync(bl =>
        bl.BlogId == createBlogLikeDto.BlogId && bl.UserId == createBlogLikeDto.UserId
      );
      // If bloglike already exists
      if (blogLikeExists != default)
      {
        // Deletes the existing like
        appContext.BlogLikes.Remove(blogLikeExists);
        await appContext.SaveChangesAsync();
        return null;
      }
      // If bloglike doesn't exist
      else
      {
        // Creates a new like
        var blogLike = await appContext.BlogLikes.AddAsync(createBlogLikeDto.ToBlogLike());
        await appContext.SaveChangesAsync();
        return blogLike.Entity.ToBlogLikeDto(user);
      }
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to create blog like.");
      throw;
    }
  }
}
}