using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BackendAPI.Source.Helpers.Extensions;

public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var principal = connection.User;
        if (principal == null) return null;

        // 1. Our custom "UserId" claim — injected by OnTokenValidated in Program.cs
        //    This is the DB UserModel.UserId (a proper GUID)
        var dbUserId = principal.FindFirst("UserId")?.Value;
        if (!string.IsNullOrEmpty(dbUserId) && Guid.TryParse(dbUserId, out _))
            return dbUserId;

        // 2. NameIdentifier — could be a GUID (if sub was already a GUID) or Auth0 string
        var nameId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(nameId) && Guid.TryParse(nameId, out _))
            return nameId;

        // 3. "sub" claim directly
        var sub = principal.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out _))
            return sub;

        // Cannot resolve a DB GUID — connection will be aborted by OnConnectedAsync
        return null;
    }
}
