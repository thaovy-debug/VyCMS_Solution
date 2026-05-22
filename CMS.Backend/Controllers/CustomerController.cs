/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý danh sách khách hàng trong hệ thống CMS Backend, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng DbContext kết nối CSDL từ project CMS.Data
using CMS.Data.Entities; // Sử dụng các lớp thực thể (Customer...) từ namespace CMS.Data.Entities
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và ActionResult
using Microsoft.EntityFrameworkCore; // Sử dụng thư viện Entity Framework Core cho các thao tác CSDL

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class CustomerController : Controller // Định nghĩa lớp CustomerController kế thừa từ Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Khai báo biến cục bộ lưu đối tượng DbContext kết nối CSDL

        public CustomerController(ApplicationDbContext context) // Phương thức khởi dựng nạp đối tượng kết nối CSDL qua DI
        {
            _context = context; // Gán đối tượng kết nối CSDL nhận được vào biến thành viên _context
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách tất cả các khách hàng
        {
            var customers = _context.Customers.ToList(); // Truy xuất danh sách toàn bộ khách hàng từ CSDL
            return View(customers); // Trả về giao diện Index và truyền danh sách khách hàng thu được sang View
        }
    }
}
