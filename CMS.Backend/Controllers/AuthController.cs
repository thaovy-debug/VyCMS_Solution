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

            // Tạo mật khẩu mới ngẫu nhiên (6 ký tự)
            string newPassword = new Random().Next(100000, 999999).ToString();
            
            // Cập nhật Database
            customer.Password = HashPassword(newPassword);
            await _context.SaveChangesAsync();

            // Gửi qua Email
            string subject = "Khôi phục mật khẩu tài khoản ZEY CHÍC";
            string body = $@"
                <h3>Xin chào {customer.FullName},</h3>
                <p>Hệ thống đã nhận được yêu cầu khôi phục mật khẩu của bạn.</p>
                <p>Mật khẩu mới của bạn là: <strong style='font-size:1.5rem; color: #d9534f;'>{newPassword}</strong></p>
                <p>Vui lòng đăng nhập bằng mật khẩu này và nên thay đổi lại mật khẩu sau khi đăng nhập thành công.</p>
                <p>Trân trọng,<br/>Đội ngũ ZEY CHÍC</p>
            ";

            try
            {
                await _emailService.SendEmailAsync(customer.Email, subject, body);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi email khôi phục.", detail = ex.Message });
            }

            return Ok(new { message = "Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi mật khẩu mới đến email đó." });
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
}
