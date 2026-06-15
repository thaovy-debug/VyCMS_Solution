/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa API endpoint GET để lấy danh sách các danh mục sản phẩm thời trang phục vụ bộ lọc sản phẩm trên giao diện Client
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Import thư viện hỗ trợ thiết lập Web API Controller
using Microsoft.EntityFrameworkCore; // Import thư viện hỗ trợ các truy vấn bất đồng bộ của Entity Framework Core
using CMS.Data; // Import namespace chứa lớp ngữ cảnh cơ sở dữ liệu ApplicationDbContext
using System.Threading.Tasks; // Hỗ trợ định nghĩa các tác vụ bất đồng bộ Task
using System.Linq; // Hỗ trợ các cú pháp truy vấn LINQ

namespace CMS.Backend.Controllers // Khai báo không gian tên tương ứng với thư mục Controllers của dự án Backend
{
    [Route("api/[controller]")] // Cấu hình đường dẫn API chính: api/CategoriesProducts
    [ApiController] // Kích hoạt tính năng tự động kiểm tra lỗi dữ liệu đầu vào (Validation)
    public class CategoriesProductsController : ControllerBase // Kế thừa ControllerBase để tối ưu bộ nhớ cho API thuần dữ liệu JSON
    {
        private readonly ApplicationDbContext _context; // Khai báo đối tượng kết nối cơ sở dữ liệu

        public CategoriesProductsController(ApplicationDbContext context) // Hàm khởi tạo nhận Dependency Injection cho ApplicationDbContext
        {
            _context = context; // Gán đối tượng DbContext nhận được vào biến cục bộ chỉ đọc
        }

        [HttpGet] // API lấy toàn bộ danh mục sản phẩm thời trang (Giao thức GET)
        public async Task<IActionResult> GetAll() // Định nghĩa hàm GetAll bất đồng bộ trả về danh sách danh mục
        {
            try // Sử dụng khối try để bắt lỗi ngoại lệ khi truy cập cơ sở dữ liệu
            {
                var categories = await _context.CategoriesProducts // Quét bảng dữ liệu CategoriesProducts dưới SQL Server lên
                    .OrderBy(c => c.Id) // Sắp xếp danh mục theo khóa chính Id tăng dần
                    .Select(c => new { // Áp dụng kỹ thuật gọt tỉa (Projection) chỉ lấy các trường cần thiết ra FrontEnd
                        c.Id, // Lấy trường mã ID của danh mục sản phẩm
                        c.Name, // Lấy trường tên của danh mục sản phẩm
                        c.Description, // Lấy trường mô tả của danh mục sản phẩm
                        c.ImageUrl // Lấy trường hình ảnh danh mục sản phẩm
                    }) // Kết thúc biểu thức Select gọt tỉa
                    .ToListAsync(); // Chuyển đổi bất đồng bộ sang dạng danh sách mảng dữ liệu

                return Ok(categories); // Trả về mã thành công HTTP 200 OK đính kèm chuỗi chữ JSON sạch
            } // Kết thúc khối try
            catch (System.Exception ex) // Bắt lỗi nếu có ngoại lệ phát sinh trong quá trình truy vấn
            {
                return StatusCode(500, new { // Trả về mã lỗi 500 kèm thông điệp báo lỗi chi tiết
                    message = "Lỗi kết nối cơ sở dữ liệu hệ thống", // Thông điệp báo lỗi chung cho Client
                    detail = ex.Message // Chi tiết thông báo lỗi từ hệ thống
                }); // Kết thúc trả về lỗi
            } // Kết thúc khối catch
        } // Kết thúc hàm GetAll
    } // Kết thúc lớp CategoriesProductsController
} // Kết thúc namespace CMS.Backend.Controllers
