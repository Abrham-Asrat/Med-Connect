using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BackendAPI.Source.Helpers.Extensions;

public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Try searching for our custom "UserId" claim first
        var dbUserId = connection.User?.FindFirst("UserId")?.Value;
        if (!string.IsNullOrEmpty(dbUserId))
        {
            return dbUserId;
        }

        // Fallback to standard name identifier (Auth0 ID)
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
