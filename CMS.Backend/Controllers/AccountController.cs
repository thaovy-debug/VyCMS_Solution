/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Controller xử lý xác thực thành viên, thực hiện các chức năng đăng nhập, đăng xuất và trang từ chối truy cập cho hệ thống VyCMS, 
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Sử dụng các lớp cơ bản của ASP.NET MVC Controller và ActionResult
using Microsoft.AspNetCore.Authentication; // Hỗ trợ đăng ký đăng xuất phiên xác thực
using Microsoft.AspNetCore.Authentication.Cookies; // Sử dụng CookieAuthentication để xác thực qua Cookie
using System.Security.Claims; // Hỗ trợ lưu trữ danh tính và thông tin người dùng (Claims)
using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu chính ApplicationDbContext
using System.Collections.Generic; // Sử dụng kiểu dữ liệu danh sách List
using System.Linq; // Sử dụng LINQ truy vấn dữ liệu từ DB
using System.Threading.Tasks; // Sử dụng lập trình bất đồng bộ Task

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class AccountController : Controller // Lớp AccountController kế thừa từ Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến lưu trữ kết nối cơ sở dữ liệu chỉ đọc

        public AccountController(ApplicationDbContext context) // Phương thức khởi dựng tiêm DbContext
        {
            _context = context; // Gán đối tượng kết nối vào biến cục bộ
        }

        // GET: Hiển thị giao diện đăng nhập hệ thống
        [HttpGet] // Chỉ nhận yêu cầu qua giao diện hiển thị
        public IActionResult Login() // Action hiển thị trang đăng nhập
        {
            if (User.Identity?.IsAuthenticated == true) // Nếu người dùng đã đăng nhập từ trước
            {
                return RedirectToAction("Index", "Home"); // Chuyển hướng thẳng về trang chủ quản trị
            }
            return View(); // Trả về View đăng nhập độc lập (Login.cshtml)
        }

        // POST: Xử lý logic đăng nhập kiểm tra tài khoản
        [HttpPost] // Tiếp nhận yêu cầu gửi thông tin từ form biểu mẫu
        public async Task<IActionResult> Login(string username, string password) // Nhận tham số tên tài khoản và mật khẩu
        {
            // 1. Kiểm tra tài khoản và mật khẩu trực tiếp trong Database (Bảng Users)
            var user = _context.Users.FirstOrDefault(u => u.Username == username && u.PasswordHash == password); // Truy vấn đối soát dữ liệu

            if (user != null) // Nếu tìm thấy người dùng trùng khớp thông tin tài khoản và mật khẩu
            {
                // 2. Thiết lập danh tính chi tiết (Claims) của người dùng
                var claims = new List<Claim> // Tạo tập hợp danh sách các Claims thông tin
                {
                    new Claim(ClaimTypes.Name, user.Username), // Lưu trữ tên tài khoản Username trong Claim hệ thống
                    new Claim(ClaimTypes.Role, user.Role), // Lưu vai trò phân quyền quản trị (Admin hoặc Editor)
                    new Claim("FullName", user.FullName) // Lưu trữ Họ tên đầy đủ hiển thị trên giao diện
                };

                // Tạo đối tượng ClaimsIdentity đại diện cho "Chứng minh nhân dân" của người dùng
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme); // Gán scheme xác thực Cookie

                // 3. Tiến hành đăng nhập và ghi nhận Cookie xác thực vào trình duyệt web của client
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, 
                    new ClaimsPrincipal(claimsIdentity)); // Đăng ký phiên làm việc chính thức

                return RedirectToAction("Index", "Home"); // Chuyển hướng người dùng về trang chủ quản trị hệ thống
            }

            // Nếu thông tin đăng nhập không hợp lý
            ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không đúng!"; // Lưu thông báo lỗi vào ViewBag để hiển thị ngoài View
            return View(); // Trả về giao diện cùng thông báo lỗi tương ứng
        }

        // GET: Xử lý chức năng đăng xuất hệ thống
        public async Task<IActionResult> Logout() // Action đăng xuất phiên làm việc
        {
            // Tiến hành hủy bỏ và xóa sạch Cookie xác thực khỏi trình duyệt
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme); // Hủy phiên làm việc
            return RedirectToAction("Login"); // Quay về trang đăng nhập hệ thống sau khi đăng xuất thành công
        }

        // GET: Hiển thị giao diện thông báo khi người dùng không đủ quyền truy cập
        [HttpGet] // Nhận yêu cầu hiển thị trang từ chối truy cập
        public IActionResult AccessDenied() // Action hiển thị thông báo lỗi 403
        {
            return View(); // Trả về giao diện AccessDenied.cshtml báo lỗi không đủ thẩm quyền
        }
    }
}
