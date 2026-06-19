using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
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

            var bodyBuilder = new BodyBuilder { 
                HtmlBody = htmlMessage,
                TextBody = "Xin chào! Đây là email tự động từ hệ thống ZEY CHÍC. Vui lòng mở bằng trình duyệt hoặc ứng dụng hỗ trợ HTML để xem chi tiết." 
            };
            emailMessage.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                // Sử dụng StartTls thay vì false để tăng cường bảo mật và độ uy tín
                await client.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
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
