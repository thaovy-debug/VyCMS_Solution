/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa các API endpoint GET để truy xuất danh sách bài viết thời trang, lọc bài viết theo danh mục, và xem chi tiết một bài viết cụ thể
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Import thư viện hỗ trợ thiết lập Web API Controller
using Microsoft.EntityFrameworkCore; // Import thư viện hỗ trợ các truy vấn bất đồng bộ của Entity Framework Core
using CMS.Data; // Import namespace chứa lớp ngữ cảnh cơ sở dữ liệu ApplicationDbContext

namespace CMS.Backend.Controllers // Khai báo không gian tên tương ứng với thư mục Controllers của dự án Backend
{
    [Route("api/[controller]")] // Định nghĩa đường dẫn định tuyến chính cho API là api/Posts
    [ApiController] // Đánh dấu lớp này là một API Controller để tự động xử lý kiểm định dữ liệu đầu vào (Validation)
    public class PostsController : ControllerBase // Kế thừa ControllerBase thay vì Controller của MVC để tối ưu hiệu năng API
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ chỉ đọc lưu trữ ngữ cảnh cơ sở dữ liệu

        public PostsController(ApplicationDbContext context) // Hàm khởi tạo nhận Dependency Injection cho ApplicationDbContext
        {
            _context = context; // Gán ngữ cảnh cơ sở dữ liệu được tiêm vào biến cục bộ để sử dụng trong các API
        }

        [HttpGet] // Khai báo phương thức GET để tải toàn bộ danh sách bài viết
        public async Task<IActionResult> GetAll() // Định nghĩa hàm bất đồng bộ trả về kết quả dưới dạng IActionResult
        {
            var posts = await _context.Posts // Truy vấn bảng Posts trong cơ sở dữ liệu
                .OrderByDescending(p => p.Id) // Sắp xếp các bài viết giảm dần theo ID để tin mới nhất lên đầu
                .Select(p => new { // Áp dụng kỹ thuật gọt tỉa dữ liệu để giảm bớt băng thông truyền tải JSON
                    p.Id, // Chỉ lấy mã định danh bài viết
                    p.Title, // Lấy tiêu đề bài viết
                    p.ImageUrl, // Lấy đường dẫn hình ảnh đại diện
                    p.CreatedDate, // Lấy ngày tạo bài viết
                    CategoryName = p.Category.Name // Lấy trực tiếp tên của danh mục liên kết qua khóa ngoại CategoryId
                }) // Kết thúc phép chiếu Select
                .ToListAsync(); // Chuyển đổi bất đồng bộ kết quả truy vấn thành danh sách List

            return Ok(posts); // Trả về kết quả kèm mã trạng thái HTTP 200 OK
        }

        [HttpGet("category/{categoryId}")] // Khai báo phương thức GET nhận tham số động categoryId trên URL
        public async Task<IActionResult> GetByCategory(int categoryId) // Định nghĩa hàm lọc bài viết theo mã chuyên mục
        {
            var posts = await _context.Posts // Truy vấn bảng Posts trong cơ sở dữ liệu
                .Where(p => p.CategoryId == categoryId) // Lọc các bản ghi có CategoryId khớp với tham số truyền vào
                .Select(p => new { // Gọt tỉa các trường dữ liệu để chỉ trả về thông tin cần thiết
                    p.Id, // Lấy mã bài viết
                    p.Title, // Lấy tiêu đề bài viết
                    p.ImageUrl, // Lấy đường dẫn ảnh
                    p.CreatedDate // Lấy ngày tạo bài viết
                }) // Kết thúc biểu thức Select
                .ToListAsync(); // Chuyển kết quả sang danh sách bất đồng bộ

            return Ok(posts); // Trả về danh sách bài viết đã lọc kèm mã trạng thái HTTP 200 OK
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest()
        {
            var posts = await _context.Posts
                .OrderByDescending(p => p.CreatedDate)
                .Take(4)
                .Select(p => new {
                    p.Id,
                    p.Title,
                    p.ImageUrl,
                    p.CreatedDate,
                    CategoryName = p.Category.Name
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpGet("{id}")] // Khai báo phương thức GET nhận tham số khóa chính id của bài viết cần xem chi tiết
        public async Task<IActionResult> GetDetail(int id) // Định nghĩa hàm lấy chi tiết một bài viết cụ thể
        {
            var post = await _context.Posts // Truy vấn bảng Posts từ cơ sở dữ liệu
                .FirstOrDefaultAsync(p => p.Id == id); // Tìm bài viết đầu tiên khớp ID, hoặc null nếu không tồn tại

            if (post == null) // Kiểm tra nếu không tìm thấy bài viết nào trong CSDL
            {
                return NotFound(new { message = "Không tìm thấy bài viết này trong hệ thống" }); // Trả về lỗi 404 kèm thông báo lỗi JSON
            }

            return Ok(post); // Trả về toàn bộ thực thể bài viết (bao gồm cột Content chứa HTML) kèm mã HTTP 200 OK
        }
    }
}
