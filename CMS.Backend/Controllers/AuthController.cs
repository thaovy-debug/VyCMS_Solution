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

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
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

            _context.Customers.Add(input);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { message = "Đăng ký thành công", customerId = input.Id });
        }

        [HttpPost("CustomerLogin")]
        public async Task<IActionResult> CustomerLogin([FromBody] LoginDTO loginInfo)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == loginInfo.Email && c.Password == loginInfo.Password);

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
    }

    public class LoginDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
