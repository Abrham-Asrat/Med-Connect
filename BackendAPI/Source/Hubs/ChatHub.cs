using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Service;
using BackendAPI.Source.Service.ChatService;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Asn1.Cms;
using Serilog;

namespace BackendAPI.Source.Hubs
{
  public class ChatHub : Hub
  {
    private readonly IChatService _chatService;
    private readonly UserConnection _userConnection;
    private readonly ILogger<ChatHub> _logger;
    private string? _senderId;

    public ChatHub(
      IChatService chatService, 
      UserConnection userConnection,
      ILogger<ChatHub> logger)
    {
      _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
      _userConnection = userConnection ?? throw new ArgumentNullException(nameof(userConnection));
      _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override async Task OnConnectedAsync()
    {
      try
      {
        // Context.UserIdentifier is now the DB GUID (set by our custom UserIdProvider)
        _senderId = Context.UserIdentifier;

        if (string.IsNullOrEmpty(_senderId))
        {
          _logger.LogWarning("Connection attempt without user ID");
          Context.Abort();
          return;
        }

        _userConnection.AddConnection(_senderId, Context.ConnectionId);
        _logger.LogInformation("User {UserId} connected with connection ID {ConnectionId}", _senderId, Context.ConnectionId);
        await base.OnConnectedAsync();
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in OnConnectedAsync");
        Context.Abort();
      }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
      try
      {
        if (_senderId != null)
        {
          _userConnection.RemoveConnection(_senderId);
          _logger.LogInformation("User {UserId} disconnected", _senderId);
        }

        if (exception != null)
        {
          _logger.LogError(exception, "Connection closed with error");
          _logger.LogError("Connection ID: {ConnectionId}", Context.ConnectionId);
          _logger.LogError("User: {User}", Context.User?.Identity?.Name);
        }

        await base.OnDisconnectedAsync(exception);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in OnDisconnectedAsync");
      }
    }

    /// <summary>
    /// Sends a message to a user specified by the receiverId
    /// </summary>
    /// <param name="conversationId"></param>
    /// <param name="messageText"></param>
    /// <param name="files"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    /// <exception cref="FormatException"></exception>
    public async Task SendMessage(
      [Guid] Guid conversationId,
      string? messageText = null,
      [ValidCreateFileList] List<CreateFileDto>? files = null,
      BackendAPI.Source.Models.Enums.MessageType type = BackendAPI.Source.Models.Enums.MessageType.text,
      string? audioUrl = null,
      string? audioDuration = null,
      CreatePrescriptionDto? prescriptionDetails = null
    )
    {
      try
      {
        if (string.IsNullOrWhiteSpace(_senderId))
        {
          _logger.LogWarning("SendMessage attempt without user ID");
          throw new HubException("User is not authenticated");
        }

        if (string.IsNullOrWhiteSpace(messageText) && (files == null || files.Count == 0))
        {
          throw new ArgumentException("Either message text or files must be provided.");
        }

        if (!Guid.TryParse(_senderId, out Guid senderGuid))
        {
          _logger.LogWarning("Invalid user ID format: {UserId}", _senderId);
          throw new HubException("Invalid user ID format — ensure you are logged in with a valid account");
        }

        var messagePayload = new CreateMessageDto(
          conversationId, 
          senderGuid, 
          messageText, 
          files, 
          type, 
          audioUrl, 
          audioDuration, 
          prescriptionDetails
        );
        var createdMessage = await _chatService.CreateMessageAsync(messagePayload);

        // Get all participants in the conversation and broadcast to each
        var participants = await _chatService.GetConversationParticipantsAsync(conversationId);
        foreach (var participant in participants)
        {
          await Clients.User(participant.UserId.ToString())
            .SendAsync(ChatEvents.ReceiveMessage.ToString(), createdMessage);
        }
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in SendMessage");
        throw new HubException($"Error sending message: {ex.Message}");
      }
    }

    public async Task SendMessageAll(string user, string message)
    {
      await Clients.All.SendAsync("ReceiveMessageAll", user, message);
    }
  }
}
