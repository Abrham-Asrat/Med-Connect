using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController(ApplicationDbContext context, ILogger<NotificationController> logger) : ControllerBase
    {
        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotifications()
        {
            try
            {
                bool validGuid = Guid.TryParse(HttpContext.Request.Cookies[BackendAPI.Source.Helpers.Default.CookieDefaults.Profile.UserId]?.ToString(), out var userId);
                if (!validGuid)
                {
                    var idClaimExtract = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(idClaimExtract, out userId))
                        throw new UnauthorizedAccessException("Could not identify the user.");
                }

                var notifications = await context.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return Ok(new { success = true, data = notifications });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve notifications.");
                return StatusCode(500, new { success = false, message = "Failed to retrieve notifications." });
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var notification = await context.Notifications.FindAsync(id);
                if (notification == null) return NotFound();

                notification.IsRead = true;
                await context.SaveChangesAsync();

                return Ok(new { success = true, message = "Notification marked as read." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to mark notification as read.");
                return StatusCode(500, new { success = false, message = "Failed to mark notification as read." });
            }
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                bool validGuid = Guid.TryParse(HttpContext.Request.Cookies[BackendAPI.Source.Helpers.Default.CookieDefaults.Profile.UserId]?.ToString(), out var userId);
                if (!validGuid)
                {
                    var idClaimExtract = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(idClaimExtract, out userId))
                        throw new UnauthorizedAccessException("Could not identify the user.");
                }

                var unreadNotifications = await context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notif in unreadNotifications)
                {
                    notif.IsRead = true;
                }

                await context.SaveChangesAsync();

                return Ok(new { success = true, message = "All notifications marked as read." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to mark all notifications as read.");
                return StatusCode(500, new { success = false, message = "Failed to mark all notifications as read." });
            }
        }
    }
}
