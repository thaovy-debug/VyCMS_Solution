/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Hiển thị danh sách sản phẩm trong hệ thống kèm theo tên danh mục sản phẩm tương ứng, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu chính ApplicationDbContext
using CMS.Data.Entities; // Sử dụng các lớp thực thể dữ liệu (Product, CategoryProduct...)
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và ActionResult
using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core hỗ trợ tải liên kết (Include)

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class ProductController : Controller // Định nghĩa lớp ProductController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public ProductController(ApplicationDbContext context) // Phương thức khởi dựng nạp đối tượng DbContext thông qua DI
        {
            _context = context; // Gán đối tượng kết nối vào biến cục bộ
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách sản phẩm
        {
            var products = _context.Products // Truy vấn bảng Products
                .Include(p => p.CategoryProduct) // Tải kèm thông tin danh mục sản phẩm liên kết (CategoryProduct)
                .ToList(); // Thực hiện tải dữ liệu và chuyển thành dạng List

            return View(products); // Trả về giao diện Index và truyền danh sách sản phẩm sang View
        }
    }
}
