using BackendAPI.Source.Models.Dto;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Text;

namespace BackendAPI.Source.Services;

public interface IContactService
{
    Task<bool> SubmitContactFormAsync(ContactFormDto formData);
    Task<ContactInfoDto> GetContactInfoAsync();
}

public class ContactService : IContactService
{
    private readonly EmailService _emailService;
    private readonly ILogger<ContactService> _logger;
    private readonly IConfiguration _configuration;

    public ContactService(EmailService emailService, ILogger<ContactService> logger , IConfiguration configuration)
    {
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<bool> SubmitContactFormAsync(ContactFormDto formData)
    {
        try
        {
            var adminReceiver = GetRequiredEnvironmentVariable("MAIL_ADMIN_RECEIVER");
            var subject = $"Contact form submission from {formData.FirstName} {formData.LastName}";
            var bodyBuilder = new StringBuilder();

            bodyBuilder.AppendLine($"<p><strong>Name:</strong> {WebUtility.HtmlEncode(formData.FirstName)} {WebUtility.HtmlEncode(formData.LastName)}</p>");
            bodyBuilder.AppendLine($"<p><strong>Email:</strong> {WebUtility.HtmlEncode(formData.Email)}</p>");

            if (!string.IsNullOrWhiteSpace(formData.Phone))
            {
                bodyBuilder.AppendLine($"<p><strong>Phone:</strong> {WebUtility.HtmlEncode(formData.Phone)}</p>");
            }

            bodyBuilder.AppendLine("<p><strong>Message:</strong></p>");
            bodyBuilder.AppendLine($"<p>{WebUtility.HtmlEncode(formData.Message).Replace("\n", "<br />")}</p>");

            var body = bodyBuilder.ToString();

            _logger.LogInformation("Sending contact form email to {Receiver}", adminReceiver);
            await _emailService.SendEmail(adminReceiver, "MedConnect Admin", subject, body);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending contact form email");
            throw;
        }
    }

    private static string GetRequiredEnvironmentVariable(string name)
    {
        var value = Environment.GetEnvironmentVariable(name)?.Trim();
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"Environment variable '{name}' is not configured.");
        }

        return value;
    }

 public async Task<ContactInfoDto> GetContactInfoAsync()
    {
        try
        {
            // Get contact info from configuration
            var contactInfo = _configuration.GetSection("ContactInfo");
            
            if (contactInfo == null)
            {
                _logger.LogError("ContactInfo section not found in configuration");
                throw new InvalidOperationException("ContactInfo configuration section is missing");
            }

            var phone = contactInfo["Phone"];
            var email = contactInfo["Email"];
            var alternatePhone = contactInfo["AlternatePhone"];
            var alternateEmail = contactInfo["AlternateEmail"];

            if (string.IsNullOrEmpty(phone) || string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Some contact information is missing in configuration");
            }

            return new ContactInfoDto
            {
                Phone = phone ?? "+1 (555) 123-4567",
                Email = email ?? "contact@medconnect.com",
                AlternatePhone = alternatePhone ?? "+1 (555) 987-6543",
                AlternateEmail = alternateEmail ?? "support@medconnect.com"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact information");
            throw;
        }
    }
}