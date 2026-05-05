using System.Security.Claims;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Helpers.Extensions;

public static class ClaimsPrincipalExtensions
{
    private static string? GetIdClaimValue(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? principal.FindFirst("sub")?.Value 
            ?? principal.FindFirst("uid")?.Value;
    }

    /// <summary>
    /// Fast synchronous lookup — only works when the JWT sub claim is already a Guid.
    /// Returns null when the claim is an Auth0 string like "auth0|...".
    /// Use GetUserIdAsync for a full lookup that falls back to the database.
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        var idClaim = principal.GetIdClaimValue();
        return Guid.TryParse(idClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Async lookup that tries the claim first, then falls back to an Auth0 ID database lookup.
    /// </summary>
    public static async Task<Guid?> GetUserIdAsync(this ClaimsPrincipal principal, ApplicationDbContext context)
    {
        // 1. Try Guid parsing (works when sub claim is already a Guid)
        var idClaim = principal.GetIdClaimValue();
        if (Guid.TryParse(idClaim, out var userId))
        {
            return userId;
        }

        // 2. Auth0 ID string → look up in DB
        if (!string.IsNullOrEmpty(idClaim))
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Auth0Id == idClaim);
            if (user != null)
            {
                return user.UserId;
            }
        }

        return null;
    }

    public static string? GetAuth0Id(this ClaimsPrincipal principal)
    {
        return principal.GetIdClaimValue();
    }
}
