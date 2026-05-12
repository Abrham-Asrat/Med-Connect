using System.Security.Cryptography;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.ViewModel;
using BackendAPI.Source.Services;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Service
{
    /// <summary>
    /// Handles the full email-verification token lifecycle:
    ///   1. Generate a secure random token and persist it.
    ///   2. Send a verification link to the user's email.
    ///   3. Validate the token and mark the user as verified.
    /// </summary>
    public class EmailVerificationService(
        ApplicationDbContext appContext,
        EmailService emailService,
        RenderingService renderingService,
        IConfiguration configuration,
        ILogger<EmailVerificationService> logger)
    {
        private const int TokenExpiryHours = 24;

        // ------------------------------------------------------------------ //
        //  Public API
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Generates a verification token for <paramref name="userId"/>, persists it,
        /// and sends the verification link to the user's email address.
        /// </summary>
        public async Task SendVerificationEmailAsync(Guid userId)
        {
            var user = await appContext.Users.FindAsync(userId)
                ?? throw new ArgumentException($"User {userId} not found.");

            // Remove any existing (possibly expired) tokens for this user so
            // there is always at most one active token per user.
            var existing = await appContext.EmailVerificationTokens
                .Where(t => t.UserId == userId)
                .ToListAsync();

            if (existing.Count > 0)
            {
                appContext.EmailVerificationTokens.RemoveRange(existing);
            }

            // Generate a cryptographically secure URL-safe token.
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            var tokenEntity = new EmailVerificationToken
            {
                UserId = userId,
                Token = rawToken,
                ExpiresAt = DateTime.UtcNow.AddHours(TokenExpiryHours)
            };

            await appContext.EmailVerificationTokens.AddAsync(tokenEntity);

            // Build the verification URL.
            // FRONTEND_URL is the base URL of the frontend app (e.g. https://myapp.com).
            // The frontend should call GET /api/auth/verify-email?token=XYZ when the user lands there.
            var frontendUrl = configuration["FRONTEND_URL"]?.TrimEnd('/') ?? string.Empty;
            var verificationLink = $"{frontendUrl}/verify-email?token={rawToken}";

            // Render the HTML email body.
            var viewPath = "Source/Views/VerifyEmail.cshtml";
            var model = new VerifyEmailModel
            {
                Name = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                VerificationLink = verificationLink,
                SupportEmail = configuration["MAIL_ADMIN_RECEIVER"] ?? "support@medconnect.com"
            };

            var emailBody = await renderingService.RenderRazorPage(viewPath, model);

            // Send the email first; only save the token if the send succeeds.
            await emailService.SendEmail(
                user.Email,
                $"{user.FirstName} {user.LastName}",
                "Verify Your MedConnect Account",
                emailBody
            );

            await appContext.SaveChangesAsync();

            logger.LogInformation(
                "Verification email sent to {Email} (userId={UserId})", user.Email, userId);
        }

        /// <summary>
        /// Validates <paramref name="token"/>, marks the owning user as verified,
        /// and deletes the token so it cannot be reused.
        /// </summary>
        /// <returns>The verified <see cref="UserModel"/>.</returns>
        /// <exception cref="ArgumentException">Token is invalid or expired.</exception>
        public async Task<UserModel> VerifyEmailTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Token must not be empty.");

            var tokenEntity = await appContext.EmailVerificationTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (tokenEntity == null)
                throw new ArgumentException("Invalid verification token.");

            if (tokenEntity.ExpiresAt < DateTime.UtcNow)
            {
                // Clean up the expired token.
                appContext.EmailVerificationTokens.Remove(tokenEntity);
                await appContext.SaveChangesAsync();
                throw new ArgumentException("Verification token has expired. Please request a new one.");
            }

            var user = tokenEntity.User
                ?? await appContext.Users.FindAsync(tokenEntity.UserId)
                ?? throw new InvalidOperationException("User associated with token not found.");

            user.IsEmailVerified = true;

            // Delete the token — it is single-use.
            appContext.EmailVerificationTokens.Remove(tokenEntity);

            await appContext.SaveChangesAsync();

            logger.LogInformation(
                "Email verified for user {Email} (userId={UserId})", user.Email, user.UserId);

            return user;
        }
    }
}
