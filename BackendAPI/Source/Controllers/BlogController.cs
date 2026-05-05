using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using BackendAPI.Source.Service.BlogService;
using BackendAPI.Source.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Data;

[ApiController]
[Route("api/blogs")]
// [Authorize] // All blog endpoints require authentication
public class BlogController : ControllerBase
{
  private readonly IBlogService _blogService;
  private readonly AuthService _authService;
  private readonly ApplicationDbContext _context;
  private readonly ILogger<BlogController> _logger;

  public BlogController(
    IBlogService blogService,
    AuthService authService,
    ApplicationDbContext context,
    ILogger<BlogController> logger)
  {
    _blogService = blogService;
    _authService = authService;
    _context = context;
    _logger = logger;
  }

  /// <summary>
  /// Get all blogs
  /// </summary>
  /// <returns></returns>
  [HttpGet("all")]
  [AllowAnonymous]
  public async Task<IActionResult> GetAllBlogs()
  {
    try
    {
      var result = await _blogService.GetAllBlogsAsync();
      return Ok(new ApiResponse<List<BlogDto>>(true, "Blogs retrieved successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get all the blogs.");
      throw;
    }
  }

  /// <summary>
  /// Get trending blogs (most liked)
  /// </summary>
  /// <returns></returns>
  [HttpGet("trending")]
  [AllowAnonymous]
  public async Task<IActionResult> GetTrendingBlogs([FromQuery] int count = 5)
  {
    try
    {
      var result = await _blogService.GetTrendingBlogsAsync(count);
      return Ok(new ApiResponse<List<BlogDto>>(true, "Trending blogs retrieved successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get trending blogs.");
      throw;
    }
  }


  /// <summary>
  /// Get blog by id
  /// </summary>
  /// <param name="blogId"></param>
  /// <returns></returns>
  [HttpGet("{blogId}")]
  [AllowAnonymous]
  public async Task<IActionResult> GetBlogById([FromRoute] [Required] [Guid] Guid blogId)
  {
    try
    {
      var result = await _blogService.GetBlogAsync(blogId);
      return Ok(new ApiResponse<BlogDto>(true, "Blog retrieved successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get blog by id.");
      throw;
    }
  }

  /// <summary>
  /// Create a new blog
  /// </summary>
  /// <param name="createBlogDto"></param>
  /// <returns></returns>
  [HttpPost]
  public async Task<IActionResult> CreateBlog([FromBody] CreateBlogDto createBlogDto)
  {
    try
    {
      var result = await _blogService.CreateBlogAsync(createBlogDto);
      return Ok(new ApiResponse<BlogDto>(true, "Blog created successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to create blog");
      throw;
    }
  }

  /// <summary>
  /// Update a blog
  /// </summary>
  /// <param name="blogId"></param>
  /// <param name="editBlogDto"></param>
  /// <returns></returns>
  [HttpPut("{blogId}")]
  public async Task<IActionResult> UpdateBlog(
    [FromRoute] Guid blogId,
    [FromBody] EditBlogDto editBlogDto
  )
  {
    try
    {
      var result = await _blogService.UpdateBlogAsync(blogId, editBlogDto);
      return Ok(new ApiResponse<BlogDto>(true, "Blog updated successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to update blog");
      throw;
    }
  }

  /// <summary>
  /// Delete all blogs (Only for Testing Purpose)
  /// </summary>
  /// <returns></returns>
  [HttpDelete("all")]
  public IActionResult DeleteAllBlogs()
  {
    try
    {
      _blogService.DeleteAllBlogs();
      return NoContent();
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to update blog");
      throw;
    }
  }

  [HttpPost("comment")]
  public async Task<IActionResult> PostCommentOnBlog(
    [FromBody] CreateBlogCommentDto createBlogCommentDto
  )
  {
    try
    {
      var result = await _blogService.CreateBlogCommentAsync(createBlogCommentDto);
      return Ok(new ApiResponse<BlogCommentDto>(true, "Comment posted successfully", result));
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to post a  blog comment");
      throw;
    }
  }

  [HttpGet("{blogId}/comments")]
  [AllowAnonymous]
  public async Task<IActionResult> GetBlogComments([FromRoute] [Required] [Guid] Guid blogId)
  {
    try
    {
      var result = await _blogService.GetBlogCommentsAsync(blogId);
      return Ok(
        new ApiResponse<ICollection<BlogCommentDto>>(
          true,
          "Blog comments retrieved successfully",
          result
        )
      );
    }
    catch (System.Exception ex)
    {
      _logger.LogError(ex, "An error occured trying to get blog comments.");
      throw;
    }
  }

  [HttpPost("{id}/like")]
  public async Task<IActionResult> LikeBlog(Guid id)
  {
    try
    {
      var userId = await User.GetUserIdAsync(_context);
      if (userId == null)
      {
        return Unauthorized(new ApiResponse<object>(false, "Could not identify the current user.", null));
      }
      var createBlogLikeDto = new CreateBlogLikeDto(userId.Value, id);
      var result = await _blogService.CreateBlogLikeAsync(createBlogLikeDto);
      return Ok(new ApiResponse<BlogLikeDto?>(true, result == null ? "Unliked" : "Liked", result));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error liking blog post");
      return StatusCode(500, "An error occurred while liking the blog post");
    }
  }
}
