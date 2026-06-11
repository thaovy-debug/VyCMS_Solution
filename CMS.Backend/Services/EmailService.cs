using MimeKit;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace CMS.Backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var emailMessage = new MimeMessage();
            // Lấy thông tin cấu hình từ appsettings.json
            var senderEmail = _config["EmailSettings:SenderEmail"] ?? "no-reply@vycms.com";
            var senderName = _config["EmailSettings:SenderName"] ?? "VyCMS System";
            var smtpServer = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
            var password = _config["EmailSettings:Password"] ?? "";

            emailMessage.From.Add(new MailboxAddress(senderName, senderEmail));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlMessage };
            emailMessage.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                // Connect với cấu hình SSL/TLS tương ứng (587 thường dùng STARTTLS, false ở tham số 3)
                await client.ConnectAsync(smtpServer, port, false);
                await client.AuthenticateAsync(senderEmail, password);
                await client.SendAsync(emailMessage);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
