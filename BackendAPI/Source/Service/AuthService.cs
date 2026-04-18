using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Data;
using BackendAPI.Source.Services;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Service
{
    public class AuthService
    {
        private readonly ApplicationDbContext _appContext;
        private readonly EmailService _emailService;
        private readonly RenderingService _renderingService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext appContext,
            EmailService emailService,
            RenderingService renderingService,
            ILogger<AuthService> logger)
        {
            _appContext = appContext;
            _emailService = emailService;
            _renderingService = renderingService;
            _logger = logger;
        }

        public async Task SendOtp(Guid userId)
        {
            try
            {
                // 1. Fetch the user from the database
                var user = await _appContext.Users.FindAsync(userId);

                if (user == null)
                {
                    _logger.LogError($"User with ID {userId} not found!");
                    throw new ArgumentException("User not found.");
                }

                // 2. Generate a 6-digit random OTP
                var otp = new Random().Next(100000, 999999);
                
                // 3. Update the user entity directly
                user.Otp = otp;
                
                // Use the Entry API to ensure only the Otp column is marked as modified
                _appContext.Entry(user).Property(u => u.Otp).IsModified = true;

                // 4. Render the HTML Email Template
                // Ensure the path matches your project structure exactly
                var viewPath = "Source/Views/WelcomeEmail.cshtml";
                var model = new WelcomeEmailModel()
                {
                    Email = user.Email,
                    Name = $"{user.FirstName} {user.LastName}",
                    Otp = otp,
                    SupportEmail = "medconnect271@gmail.com"
                };

                var emailBody = await _renderingService.RenderRazorPage(viewPath, model);

                // 5. Send the email via EmailService
                // This uses the SMTP settings we configured in your .env
                await _emailService.SendEmail(
                    user.Email, 
                    $"{user.FirstName} {user.LastName}", 
                    "Verify Your MedConnect Account", 
                    emailBody
                );

                // 6. Save changes to the database ONLY if the email was sent successfully
                await _appContext.SaveChangesAsync();
                
                _logger.LogInformation($"OTP successfully sent and saved for user: {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AuthService Error: Failed to process OTP request.");
                throw new Exception("Internal server error during OTP generation.", ex);
            }
        }
    }
}