
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source;
using BackendAPI.Source.Data;
using BackendAPI.Source.Services;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.ViewModel;

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
          UserModel? user = await appContext.Users.FindAsync(userId);
          
          logger.LogInformation($"FIRSTNAME : {user?.FirstName}");

          if (user == null)
          {
            logger.LogError("User with that id is not found!");
            throw new ArgumentException("User with that id is not found!");
         }
           appContext.Entry(user).Property(u => u.Otp).CurrentValue = otp;
           
           // Generate the Email Template with appropriate model fields
           
           var emailBody = await renderingService.RenderRazorPage("Source/Views/WelcomeEmail.cshtml", new WelcomeEmailModel(){Email = user.Email,Name = $"{user.FirstName} {user.LastName}", Otp = otp, SupportEmail = "healthhub.support@gmail.com" });

           // Send an OTP message to the users email
           await emailService.SendEmail(user.Email, $"{user.FirstName} {user.LastName}", "Verify Registration", emailBody );

         await appContext.SaveChangesAsync();
        }
       catch (Exception ex)
        {
          logger.LogError(ex, "Failed to send OTP");
         throw new Exception("Internal Error", ex);
        }
     }
 }
}