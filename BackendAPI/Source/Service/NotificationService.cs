using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using BackendAPI.Source.Hubs;

namespace BackendAPI.Source.Service;

public class NotificationService(
    ApplicationDbContext appContext,
    IHubContext<NotificationHub> hubContext,
    ILogger<NotificationService> logger
)
{
    public async Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, object? data = null)
    {
        try
        {
            // 1. Save to Database
            var notification = new Notification
            {
                UserId = userId,
                Message = $"{title}: {message}",
                NotificationType = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await appContext.Notifications.AddAsync(notification);
            await appContext.SaveChangesAsync();

            // 2. Send via SignalR
            // We use the UserId as the identifier for SignalR Hub
            await hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                id = notification.Id,
                title,
                message,
                type = type.ToString().ToLower(),
                data,
                timestamp = notification.CreatedAt
            });

            // Also send specific event for legacy compatibility if needed
            if (type == NotificationType.Appointment)
            {
                await hubContext.Clients.User(userId.ToString()).SendAsync("AppointmentUpdate", new
                {
                    message,
                    confirmed = false
                });
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending notification to user {UserId}", userId);
        }
    }
}
