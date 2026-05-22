/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý danh sách và chi tiết các bài viết, hỗ trợ lọc bài viết theo từng danh mục cụ thể, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu ApplicationDbContext
using CMS.Data.Entities; // Sử dụng các lớp thực thể (Post, Category...)
using Microsoft.AspNetCore.Mvc; // Sử dụng các tính năng của MVC Controller và IActionResult
using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho các truy vấn dữ liệu nâng cao (Include)
using System.Linq; // Hỗ trợ các phương thức mở rộng LINQ

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class PostController : Controller // Định nghĩa lớp PostController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public PostController(ApplicationDbContext context) // Phương thức khởi dựng thực hiện tiêm dependency DbContext
        {
            _context = context; // Gán đối tượng kết nối CSDL được truyền vào
        }

        // Chấp nhận tham số id của danh mục (tùy chọn) để thực hiện lọc các bài viết thuộc danh mục đó
        public IActionResult Index(int? id) // Hàm xử lý hiển thị danh sách bài viết
        {
            if (id == null) // Kiểm tra nếu không truyền vào mã danh mục (id)
            {
                // Nếu không có id danh mục được chọn, trả về toàn bộ bài viết sắp xếp theo ngày tạo giảm dần
                var all = _context.Posts // Truy vấn bảng Posts
                    .Include(p => p.Category) // Tải kèm theo thông tin của danh mục liên quan (Category)
                    .OrderByDescending(p => p.CreatedDate) // Sắp xếp giảm dần theo ngày tạo (CreatedDate)
                    .ToList(); // Tải dữ liệu và chuyển đổi thành danh sách
                return View(all); // Trả về View Index hiển thị tất cả bài viết
            }

            // Nếu có truyền vào id danh mục, tiến hành lọc các bài viết thuộc danh mục đó
            var posts = _context.Posts // Truy vấn bảng Posts
                .Where(p => p.CategoryId == id) // Lọc những bài viết có CategoryId bằng với id truyền vào
                .Include(p => p.Category) // Tải kèm theo thông tin danh mục liên quan
                .OrderByDescending(p => p.CreatedDate) // Sắp xếp theo ngày tạo giảm dần
                .ToList(); // Chuyển đổi kết quả thành danh sách

            return View(posts); // Trả về View Index hiển thị các bài viết đã lọc theo danh mục
        }

        // GET: Post/Details/5
        public IActionResult Details(int id) // Hàm xử lý hiển thị chi tiết bài viết dựa trên id bài viết nhận được
        {
            // 1. Truy vấn bài viết theo ID
            // Sử dụng .Include(p => p.Category) để lấy kèm thông tin Danh mục (Join bảng)
            var post = _context.Posts // Truy vấn từ bảng Posts
                .Include(p => p.Category) // Nạp kèm theo thông tin danh mục bài viết
                .FirstOrDefault(p => p.Id == id); // Lấy bài viết đầu tiên trùng khớp với Id, nếu không có trả về null

            // 2. Kiểm tra nếu không tìm thấy bài viết (tránh lỗi màn hình trắng)
            if (post == null) // Nếu đối tượng post thu được bằng null (không tìm thấy bài viết)
            {
                return NotFound(); // Trả về trang báo lỗi không tìm thấy tài nguyên 404
            }

            // 3. Truyền dữ liệu sang View
            return View(post); // Trả về giao diện chi tiết và truyền đối tượng bài viết sang View
        }
    }
}