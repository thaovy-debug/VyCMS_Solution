/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: API xác thực khách hàng (Đăng ký, Đăng nhập) phục vụ FrontEnd
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using System;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CMS.Backend.Services.IEmailService _emailService;

        public AuthController(ApplicationDbContext context, CMS.Backend.Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }

        [HttpPost("CustomerRegister")]
        public async Task<IActionResult> CustomerRegister([FromBody] Customer input)
        {
            if (string.IsNullOrEmpty(input.FullName) || string.IsNullOrEmpty(input.Email) || string.IsNullOrEmpty(input.Password))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu" });
            }

            // Kiểm tra email tồn tại
            var existingCustomer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == input.Email);
            if (existingCustomer != null)
            {
                return BadRequest(new { message = "Email này đã được sử dụng" });
            }

            // Kiểm tra số điện thoại tồn tại
            if (!string.IsNullOrEmpty(input.Phone))
            {
                var existingPhone = await _context.Customers.FirstOrDefaultAsync(c => c.Phone == input.Phone);
                if (existingPhone != null)
                {
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng" });
                }
            }

            // Mã hóa mật khẩu trước khi lưu
            input.Password = HashPassword(input.Password);

            _context.Customers.Add(input);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { message = "Đăng ký thành công", customerId = input.Id });
        }

        [HttpPost("CustomerLogin")]
        public async Task<IActionResult> CustomerLogin([FromBody] LoginDTO loginInfo)
        {
            var hashedPassword = HashPassword(loginInfo.Password);
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == loginInfo.Email && c.Password == hashedPassword);

            if (customer == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
            }

            return Ok(new {
                message = "Đăng nhập thành công",
                customer = new {
                    customer.Id,
                    customer.FullName,
                    customer.Email,
                    customer.Phone,
                    customer.Address
                }
            });
        }

        [HttpPost("CustomerForgotPassword")]
        public async Task<IActionResult> CustomerForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Vui lòng nhập Email." });
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
            if (customer == null)
            {
                // Để bảo mật, không trả về lỗi "không tồn tại"
                return Ok(new { message = "Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi mật khẩu mới đến email đó." });
            }

            // Tạo OTP ngẫu nhiên (6 ký tự)
            string otp = new Random().Next(100000, 999999).ToString();
            
            // Cập nhật Database
            customer.ResetOtp = otp;
            customer.ResetOtpExpiry = DateTime.Now.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Gửi qua Email
            string subject = "Khôi phục mật khẩu tài khoản ZEY CHÍC";
            string body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset=""UTF-8"">
                    <title>Khôi phục mật khẩu</title>
                </head>
                <body style=""background-color: #f9f9f9; padding: 20px 0; margin: 0;"">
                    <div style=""max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #fff; padding: 30px; border-radius: 4px; border: 1px solid #eaeaea;"">
                        <div style=""text-align: center; margin-bottom: 20px;"">
                            <h2 style=""color: #800000; margin: 0; font-size: 24px;"">ZEY CHÍC</h2>
                            <p style=""color: #888; font-size: 13px; margin-top: 5px;"">Yêu cầu khôi phục mật khẩu</p>
                        </div>
                        <div style=""border-bottom: 2px solid #800000; margin-bottom: 20px;""></div>

                        <p style=""font-size: 14px; color: #333;"">Kính chào <strong>{customer.FullName}</strong>,</p>
                        <p style=""font-size: 14px; color: #333;"">Hệ thống đã nhận được yêu cầu khôi phục mật khẩu tài khoản của bạn.</p>
                        
                        <div style=""text-align: center; margin: 30px 0; padding: 20px; background-color: #fcfcfc; border: 1px dashed #ccc; border-radius: 4px;"">
                            <p style=""font-size: 14px; color: #555; margin-bottom: 10px;"">Mã OTP xác thực của bạn là:</p>
                            <h1 style=""font-size: 32px; color: #800000; margin: 0; letter-spacing: 5px;"">{otp}</h1>
                        </div>
                        
                        <p style=""font-size: 13px; color: #555;"">Mã OTP này có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng nhập mã này trên website để tạo mật khẩu mới.</p>
                        <p style=""font-size: 13px; color: #555;"">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
                        
                        <div style=""text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;"">
                            <p style=""font-size: 12px; color: #888;"">Cảm ơn bạn đã tin tưởng và đồng hành cùng ZEY CHÍC.</p>
                            <p style=""font-size: 11px; color: #aaa;"">&copy; {DateTime.Now.Year} ZEY CHÍC. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            try
            {
                await _emailService.SendEmailAsync(customer.Email, subject, body);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi email khôi phục.", detail = ex.Message });
            }

            return Ok(new { message = "Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi mã OTP khôi phục đến email đó." });
        }

        [HttpPost("CustomerResetPassword")]
        public async Task<IActionResult> CustomerResetPassword([FromBody] ResetPasswordDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin" });
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
            if (customer == null)
            {
                return BadRequest(new { message = "Email không hợp lệ" });
            }

            if (customer.ResetOtp != request.Otp)
            {
                return BadRequest(new { message = "Mã OTP không chính xác" });
            }

            if (customer.ResetOtpExpiry < DateTime.Now)
            {
                return BadRequest(new { message = "Mã OTP đã hết hạn" });
            }

            // Cập nhật mật khẩu mới
            customer.Password = HashPassword(request.NewPassword);
            // Xóa OTP
            customer.ResetOtp = null;
            customer.ResetOtpExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật mật khẩu thành công" });
        }

        [HttpPut("CustomerUpdate/{id}")]
        public async Task<IActionResult> CustomerUpdate(int id, [FromBody] CustomerUpdateDTO input)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Không tìm thấy khách hàng" });

            if (!string.IsNullOrEmpty(input.FullName)) customer.FullName = input.FullName;
            if (!string.IsNullOrEmpty(input.Phone)) customer.Phone = input.Phone;
            if (input.Address != null) customer.Address = input.Address; // Allow empty string to clear address if needed, or just update JSON
            if (input.AvatarUrl != null) customer.AvatarUrl = input.AvatarUrl;
            if (input.AddressBook != null) customer.AddressBook = input.AddressBook;
            if (!string.IsNullOrEmpty(input.Password)) 
            {
                if (string.IsNullOrEmpty(input.OldPassword)) 
                {
                    return BadRequest(new { message = "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu" });
                }
                var hashedOldPassword = HashPassword(input.OldPassword);
                if (customer.Password != hashedOldPassword) 
                {
                    return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });
                }
                customer.Password = HashPassword(input.Password);
            }

            await _context.SaveChangesAsync();

            return Ok(new {
                message = "Cập nhật thông tin thành công",
                customer = new {
                    customer.Id,
                    customer.FullName,
                    customer.Email,
                    customer.Phone,
                    customer.Address,
                    customer.AvatarUrl,
                    customer.AddressBook
                }
            });
        }
    }

    public class LoginDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ForgotPasswordDTO
    {
        public string Email { get; set; } = string.Empty;
    }

    public class CustomerUpdateDTO
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public string? AddressBook { get; set; }
        public string? OldPassword { get; set; }
        public string? Password { get; set; }
    }

    public class ResetPasswordDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
