using MailKit.Net.Smtp;
using MimeKit;

namespace BackendAPI.Source.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger)
{
  private readonly IConfiguration _configuration = configuration;
  private readonly ILogger<EmailService> _logger = logger;

  /// <summary>
  /// Function used to send email to people.
  /// </summary>
  /// <param name="toEmail"></param>
  /// <param name="toName"></param>
  /// <param name="subject"></param>
  /// <param name="body"></param>
  /// <returns></returns>
  /// <exception cref="Exception"></exception>
  public async Task SendEmail(string toEmail, string toName, string subject, string body)
  {
    var smtpHost = _configuration["MAIL_HOST"]?.Trim();
    var smtpPortValue = _configuration["MAIL_PORT"]?.Trim();
    var fromEmail = _configuration["MAIL_SENDER_EMAIL"]?.Trim();
    var fromPassword = _configuration["MAIL_SENDER_PASSWORD"]?.Trim();

    if (string.IsNullOrWhiteSpace(smtpHost) || smtpHost.Contains("example.com", StringComparison.OrdinalIgnoreCase))
    {
      smtpHost = "smtp.gmail.com";
    }

    if (string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(fromPassword))
    {
      throw new InvalidOperationException("Mail sender credentials are not configured.");
    }

    if (!int.TryParse(smtpPortValue, out var smtpPort))
    {
      smtpPort = 587;
    }

    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("MedConnect Inc.", fromEmail));
    message.To.Add(new MailboxAddress(toName, toEmail));
    message.Subject = subject;
    message.Body = new TextPart("html") { Text = body };

    _logger.LogInformation("Sending email to {Recipient} via {Host}:{Port}", toEmail, smtpHost, smtpPort);

    try
    {
      await SendViaSmtp(smtpHost, smtpPort, fromEmail, fromPassword, message);
    }
    catch (Exception ex) when (smtpHost.Contains("gmail.com", StringComparison.OrdinalIgnoreCase) && smtpPort == 587)
    {
      _logger.LogWarning(ex, "Port 587 failed for Gmail SMTP, retrying using port 465.");
      await SendViaSmtp(smtpHost, 465, fromEmail, fromPassword, message, MailKit.Security.SecureSocketOptions.SslOnConnect);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error sending email to {Recipient} via SMTP.", toEmail);
      throw new Exception("Error sending email", ex);
    }
  }

  private async Task SendViaSmtp(
    string host,
    int port,
    string fromEmail,
    string fromPassword,
    MimeMessage message,
    MailKit.Security.SecureSocketOptions secureSocketOptions = MailKit.Security.SecureSocketOptions.StartTls)
  {
    using var client = new SmtpClient();
    await client.ConnectAsync(host, port, secureSocketOptions);
    await client.AuthenticateAsync(fromEmail, fromPassword);
    await client.SendAsync(message);
    await client.DisconnectAsync(true);
  }
}
