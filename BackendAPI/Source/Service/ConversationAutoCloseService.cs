using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Service;

/// <summary>
/// Background service that runs once per hour and automatically closes any conversation
/// whose AutoCloseAt timestamp has passed and is still in an active or follow_up state.
/// This ensures consultations are closed 7 days after the appointment date even if the
/// doctor never clicks "Mark as Resolved".
/// </summary>
public class ConversationAutoCloseService(
    IServiceScopeFactory scopeFactory,
    ILogger<ConversationAutoCloseService> logger
) : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("ConversationAutoCloseService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CloseExpiredConversationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in ConversationAutoCloseService while closing expired conversations.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        logger.LogInformation("ConversationAutoCloseService stopped.");
    }

    private async Task CloseExpiredConversationsAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var now = DateTime.UtcNow;

        // Find all conversations that have passed their auto-close deadline
        // and are still open (active or follow_up)
        var expired = await db.Conversations
            .Where(c =>
                c.AutoCloseAt.HasValue &&
                c.AutoCloseAt.Value <= now &&
                (c.Status == AppointmentStatus.active || c.Status == AppointmentStatus.follow_up))
            .ToListAsync(ct);

        if (expired.Count == 0)
            return;

        logger.LogInformation(
            "Auto-closing {Count} expired conversation(s) at {Now}.",
            expired.Count, now);

        foreach (var conv in expired)
        {
            conv.Status = AppointmentStatus.closed;

            // Append a system message so both participants see why the chat closed
            var closeMsg = new BackendAPI.Source.Models.Entities.Message
            {
                MessageId      = Guid.NewGuid(),
                ConversationId = conv.ConversationId,
                SenderId       = Guid.Empty,
                MessageText    = "⏰ This consultation has been automatically closed 7 days after the appointment date. " +
                                 "If you need further assistance, please book a new appointment.",
                Type           = MessageType.system
            };

            await db.Messages.AddAsync(closeMsg, ct);
            conv.LastMessageAt = closeMsg.CreatedAt;
        }

        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "Successfully auto-closed {Count} conversation(s).",
            expired.Count);
    }
}
