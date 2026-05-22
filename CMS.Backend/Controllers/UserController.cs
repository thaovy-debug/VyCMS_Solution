/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Hiển thị danh sách người dùng hệ thống quản trị, bảo mật bằng cách ẩn chuỗi băm mật khẩu, 
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và ActionResult
using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu chính ApplicationDbContext
using CMS.Data.Entities; // Sử dụng lớp thực thể User từ namespace CMS.Data.Entities
using System.Linq; // Sử dụng các phương thức mở rộng LINQ để xử lý dữ liệu

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class UserController : Controller // Định nghĩa lớp UserController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public UserController(ApplicationDbContext context) // Phương thức khởi dựng nạp đối tượng DbContext thông qua DI
        {
            _context = context; // Gán đối tượng kết nối vào biến cục bộ
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách người dùng hệ thống
        {
            // Thực hiện tải danh sách người dùng và ẩn chuỗi băm mật khẩu (PasswordHash) để bảo mật thông tin
            var users = _context.Users // Truy vấn từ bảng Users trong CSDL
                .Select(u => new User // Chiếu (Map) dữ liệu thực thể sang một đối tượng User mới
                {
                    Id = u.Id, // Gán Id người dùng tương ứng
                    Username = u.Username, // Gán tài khoản đăng nhập tương ứng
                    FullName = u.FullName, // Gán tên đầy đủ người dùng tương ứng
                    Role = u.Role // Gán vai trò/quyền hạn tương ứng
                    // Chú ý: Bỏ qua thuộc tính PasswordHash để bảo mật khi truyền ra giao diện
                })
                .ToList(); // Tải dữ liệu từ database và lưu vào danh sách (List)

            return View(users); // Trả về giao diện Index và truyền danh sách người dùng sang View
        }
    }
}