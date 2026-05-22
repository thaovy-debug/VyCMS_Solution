/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện hiển thị danh sách đơn hàng kèm thông tin khách hàng và chi tiết các sản phẩm được đặt mua, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu ApplicationDbContext
using CMS.Data.Entities; // Sử dụng các lớp thực thể (Order, Product...)
using Microsoft.AspNetCore.Mvc; // Sử dụng các tính năng điều hướng Controller và View
using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho các phương thức nạp chồng liên kết Include

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class OrderController : Controller // Định nghĩa lớp OrderController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Khai báo đối tượng kết nối CSDL chỉ đọc

        public OrderController(ApplicationDbContext context) // Phương thức khởi dựng thực hiện tiêm dependency DbContext
        {
            _context = context; // Gán đối tượng kết nối CSDL vào biến _context
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách toàn bộ các đơn đặt hàng
        {
            var orders = _context.Orders // Truy vấn từ bảng Orders
                .Include(o => o.Customer) // Nạp kèm theo thông tin của khách hàng (Customer) đặt đơn
                .Include(o => o.OrderDetails) // Nạp kèm theo thông tin chi tiết đơn hàng (OrderDetails)
                .ThenInclude(od => od.Product) // Trong từng chi tiết đơn hàng, nạp tiếp thông tin của sản phẩm (Product) tương ứng
                .ToList(); // Thực thi truy vấn và chuyển đổi toàn bộ kết quả thành List

            return View(orders); // Trả về giao diện Index đồng thời truyền danh sách đơn hàng thu được sang View
        }
    }
}
