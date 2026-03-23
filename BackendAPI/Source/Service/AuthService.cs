using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Services;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;

namespace BackendAPI.Source.Service
{
    public class AuthService(ApplicationDbContext appContext,
    EmailService emailService,
     RenderingService renderingService, 
     ILogger<AuthService> logger
     )
    {
        public async Task SendOtp(Guid userId)
        {
            try
            {
                // Generate OTP
                var otp = new Random().Next(100000, 999999);

                // Store OTP in database with expiration time
                UserModel? user = await appContext.Users.FindAsync(userId);

                logger.LogInformation($"--USER Name-{user?.FirstName}");

                if (user == null)
                {
                    logger.LogInformation($"--USER NOT FOUND-{userId}");
                    throw new Exception("User not found");
                }

                appContext.Entry(user).Property(u => u.Otp).CurrentValue = otp;

            // Generating Email template with appropriate model fields
            var emailBody = await renderingService.RenderRazorPage(
        "Source/Views/WelcomeEmail.cshtml",
        new WelcomeEmailModel()
        {
          Email = user.Email,
          Name = $"{user.FirstName} {user.LastName}",
          Otp = otp,
          SupportEmail = "MedConnect.support@gmail.com"
        });

        // Send OTt message to user's email

        await emailService.SendEmail(user.Email, $"{user.FirstName} {user.LastName}", "Your OTP for MedConnect", emailBody);

        await appContext.SaveChangesAsync();

            }
            catch (Exception ex)
            {

               logger.LogInformation($"--ERROR SENDING OTP TO USER-{userId}");

                throw new Exception("Internal Server Error in Otp", ex);
            }
        }
    }
}