using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BackendAPI.Source.Helpers.Extensions;

public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var principal = connection.User;
        if (principal == null) 
        {
            Serilog.Log.Warning("[SignalR Debug] Principal is null for connection {ConnectionId}", connection.ConnectionId);
            return null;
        }

        // 1. Our custom "UserId" claim — injected by OnTokenValidated in Program.cs
        var dbUserId = principal.FindFirst("UserId")?.Value;
        if (!string.IsNullOrEmpty(dbUserId) && Guid.TryParse(dbUserId, out _))
        {
            Serilog.Log.Information("[SignalR Debug] Resolved UserId from claim: {UserId}", dbUserId);
            return dbUserId;
        }

        // 2. NameIdentifier
        var nameId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(nameId) && Guid.TryParse(nameId, out _))
        {
            Serilog.Log.Information("[SignalR Debug] Resolved UserId from NameIdentifier: {UserId}", nameId);
            return nameId;
        }

        // 3. "sub" claim directly
        var sub = principal.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out _))
        {
            Serilog.Log.Information("[SignalR Debug] Resolved UserId from sub: {UserId}", sub);
            return sub;
        }

        Serilog.Log.Warning("[SignalR Debug] Could not resolve a GUID UserId for connection {ConnectionId}. Sub: {Sub}", 
            connection.ConnectionId, sub ?? "null");
        return null;
    }
}
