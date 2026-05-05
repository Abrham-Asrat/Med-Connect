using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendAPI.Source.Helpers.Extensions;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController(ApplicationDbContext context, ILogger<NotificationController> logger) : ControllerBase
    {
        private async Task<Guid> GetCurrentUserId()
        {
            // 1. Try Cookies
            if (Guid.TryParse(HttpContext.Request.Cookies[BackendAPI.Source.Helpers.Default.CookieDefaults.Profile.UserId]?.ToString(), out var userId))
            {
                return userId;
            }

            // 2. Try Jwt Claim via centralized extension (checks NameIdentifier, sub, and DB lookup)
            var id = await User.GetUserIdAsync(context);
            if (id.HasValue)
            {
                return id.Value;
            }

            // Log available claims for debugging if identification fails
            var claimsList = string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"));
            logger.LogWarning("Could not identify user. Available claims: {Claims}", claimsList);

            throw new UnauthorizedAccessException("Could not identify the user.");
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotifications()
        {
            try
            {
                var userId = await GetCurrentUserId();

                var notifications = await context.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return Ok(new { success = true, data = notifications });
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized attempt to access notifications.");
                return Unauthorized(new { success = false, message = ex.Message });
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
                var userId = await GetCurrentUserId();

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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to mark all notifications as read.");
                return StatusCode(500, new { success = false, message = "Failed to mark all notifications as read." });
            }
        }
    }
}
