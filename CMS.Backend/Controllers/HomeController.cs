/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Điều hướng trang chủ Backend, xử lý hiển thị bài viết mới nhất và thông tin lỗi ứng dụng, tích hợp xác thực [Authorize] cho trang quản trị chính, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Backend.Models; // Sử dụng các Model/ViewModel thuộc dự án CMS.Backend
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ MVC Controller và IActionResult
using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho các thao tác truy vấn CSDL nâng cao (như Include)
using System.Diagnostics; // Cung cấp các công cụ chuẩn đoán lỗi và giám sát hệ thống (Activity)
using CMS.Data; // Sử dụng đối tượng kết nối CSDL ApplicationDbContext
using Microsoft.AspNetCore.Authorization; // Sử dụng phân quyền và xác thực người dùng

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Bắt buộc đăng nhập để truy cập trang chủ quản trị Backend
    public class HomeController : Controller // Định nghĩa lớp HomeController kế thừa từ Controller cơ bản
    {
        private readonly ILogger<HomeController> _logger; // Đối tượng hỗ trợ ghi nhật ký log hoạt động
        private readonly ApplicationDbContext _context; // Đối tượng kết nối CSDL chính của ứng dụng

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context) // Phương thức khởi dựng nạp các Dependency Injection cần thiết
        {
            _logger = logger; // Gán đối tượng logger nhận được
            _context = context; // Gán đối tượng DbContext kết nối CSDL
        }

        public IActionResult Index() // Hàm xử lý hiển thị trang chủ của CMS Backend
        {
            var latestPosts = _context.Posts // Thực hiện truy vấn bảng Posts trong CSDL
                .Include(p => p.Category) // Lấy kèm theo thông tin của danh mục liên kết (CategoryId)
                .OrderByDescending(p => p.CreatedDate) // Sắp xếp theo ngày tạo giảm dần (bài mới nhất xếp đầu)
                .Take(3) // Chỉ lấy 3 bài viết đầu tiên
                .ToList(); // Chuyển đổi dữ liệu kết quả thành danh sách (List)
            return View(latestPosts); // Trả về giao diện Index và truyền danh sách bài viết mới thu được sang View
        }

        public IActionResult Privacy() // Hàm hiển thị trang thông tin chính sách bảo mật
        {
            return View(); // Trả về View Privacy mặc định
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)] // Cấu hình không lưu bộ nhớ đệm (Cache) cho trang lỗi này
        public IActionResult Error() // Hàm xử lý hiển thị giao diện báo lỗi khi có exception xảy ra
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier }); // Khởi tạo ErrorViewModel chứa mã định danh lỗi và truyền sang View Error
        }
    }
}
