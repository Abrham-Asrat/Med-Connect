using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Service;
using BackendAPI.Source.Service.ChatService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/conversations")]
// [Authorize] // All chat endpoints require authentication
public class ChatController(
  UserService userService,
  IChatService chatService,
  ILogger<ChatController> logger
) : ControllerBase
{
  [HttpPost]
  public async Task<IActionResult> CreateConversation(
    [Required] [FromBody] CreateConversationDto createConversationDto
  )
  {
    try
    {
      // Basically participants is of size 2. Just in case though we allow more than that
      foreach (Guid guid in createConversationDto.Participants)
      {
        if (await userService.UserExistsAsync(guid) == false)
        {
          throw new KeyNotFoundException(
            $"User with the id {guid} doesn't exist. Please provide correct userId."
          );
        }
      }
      var result = await chatService.CreateConversationAsync(createConversationDto);
      return Ok(result);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to create a conversation.");
      throw;
    }
  }

  /// <summary>
  /// Get all messages by conversation id
  /// </summary>
  /// <param name="conversationId"></param>
  /// <returns></returns>
  [HttpGet("messages/{conversationId}")]
  public async Task<IActionResult> GetMessagesByConversationId(
    [FromRoute] [Required(ErrorMessage = "Conversation id is required")] [Guid] Guid conversationId
  )
  {
    try
    {
      var result = await chatService.GetMessagesAsync(conversationId);
      return Ok(result);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all messages.");
      throw;
    }
  }

  /// <summary>
  /// Get all conversations by user id
  /// </summary>
  /// <param name="userId"></param>
  /// <returns></returns>
  [HttpGet("users/{userId}")]
  public async Task<IActionResult> GetConversations([FromRoute] [Required] [Guid] Guid userId)
  {
    try
    {
      logger.LogInformation($"\n\n{userId}");
      var result = await chatService.GetAllConversations(userId);

      return Ok(result);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all conversations.");
      throw;
    }
  }

  /// <summary>
  /// Get conversation by id
  /// </summary>
  /// <param name="conversationId"></param>
  /// <returns></returns>
  [HttpGet("{conversationId}")]
  public async Task<IActionResult> GetConversation(
    [FromRoute] [Required] [Guid] Guid conversationId
  )
  {
    try
    {
      var result = await chatService.GetConversationAsync(conversationId);

      return Ok(result);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all conversations.");
      throw;
    }
  }

  /// <summary>
  /// Get all conversations
  /// </summary>
  /// <returns></returns>
  [HttpGet("all")]
  public async Task<IActionResult> GetAllConversations()
  {
    try
    {
      var result = await chatService.GetAllConversations();

      return Ok(result);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all conversations.");
      throw;
    }
  }

  /// <summary>
  /// Removes a message by the provided messageId
  /// </summary>
  /// <param name="messageId"></param>
  /// <returns></returns>
  [HttpDelete("message/{messageId}")]
  public async Task<IActionResult> DeleteMessage([Required] [FromRoute] [Guid] Guid messageId)
  {
    try
    {
      await chatService.DeleteMessage(messageId);

      return NoContent();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to delete a message.");
      throw;
    }
  }

  /// <summary>
  /// Blocks an active conversation, permanently locking out interaction.
  /// </summary>
  /// <param name="conversationId"></param>
  /// <param name="requestBody"></param>
  /// <returns></returns>
  [HttpPost("{conversationId}/block")]
  public async Task<IActionResult> BlockConversation(
    [FromRoute] [Required] [Guid] Guid conversationId,
    [FromBody] [Required] BlockConversationRequestDto requestBody
  )
  {
    try
    {
      await chatService.BlockConversationAsync(conversationId, requestBody.UserId);
      return NoContent();
    }
    catch (UnauthorizedAccessException ex)
    {
      return Unauthorized(ex.Message);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while blocking the conversation.");
      throw;
    }
  }
}

public record BlockConversationRequestDto([Required] Guid UserId);
