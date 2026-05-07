using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;
using Microsoft.AspNetCore.SignalR;

public class NotificationHub(ApplicationDbContext appContext, UserConnection userConnection) : Hub
{
  private string? _senderId;

  public override async Task OnConnectedAsync()
  {
    // UserIdentifier is now populated by our custom UserIdProvider
    _senderId = Context.UserIdentifier;

    if (string.IsNullOrWhiteSpace(_senderId))
    {
      throw new UnauthorizedAccessException("User not authenticated. Valid JWT token required.");
    }

    userConnection.AddConnection(_senderId, Context.ConnectionId);
    await base.OnConnectedAsync();
  }

  public override async Task OnDisconnectedAsync(Exception? exception)
  {
    if (_senderId != null)
    {
      userConnection.RemoveConnection(_senderId);
    }

    await base.OnDisconnectedAsync(exception);
  }

  /// <summary>
  /// Send notifications to the user specified by the userId
  /// </summary>
  /// <param name="message"></param>
  /// <param name="userId"></param>
  /// <param name="notificationType"></param>
  /// <returns></returns>
  public async Task SendNotification(string message, Guid userId, NotificationType notificationType)
  {
    try
    {
      if (string.IsNullOrWhiteSpace(_senderId))
      {
        throw new FormatException("The userId cookie is missing or empty.");
      }

      var notification = new Notification
      {
        Message = message,
        NotificationType = notificationType,
        UserId = userId
      };

      await appContext.Notifications.AddAsync(notification);

      await appContext.SaveChangesAsync();

      if (!string.IsNullOrEmpty(_senderId))
      {
        await Clients
          .User(_senderId)
          .SendAsync(NotificationEvents.ReceiveNotification.ToString(), new { 
            message, 
            type = notificationType.ToString().ToLower(),
            timestamp = DateTime.UtcNow 
          });
      }
      else
      {
        throw new FormatException("The connectionId is missing or empty.");
      }
    }
    catch (System.Exception)
    {
      throw;
    }
  }
}
