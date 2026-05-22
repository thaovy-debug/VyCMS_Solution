/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Hiển thị danh sách chi tiết đơn hàng (các mặt hàng cụ thể đã mua trong mỗi đơn), 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu chính ApplicationDbContext
using CMS.Data.Entities; // Tham chiếu đến các định nghĩa thực thể (OrderDetail, Order, Product...)
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ MVC Controller
using Microsoft.EntityFrameworkCore; // Sử dụng thư viện Entity Framework Core hỗ trợ nạp liên kết dữ liệu (Include)

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    public class OrderDetailController : Controller // Định nghĩa lớp OrderDetailController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public OrderDetailController(ApplicationDbContext context) // Phương thức khởi dựng nạp đối tượng DbContext thông qua DI
        {
            _context = context; // Gán đối tượng kết nối vào biến cục bộ
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách chi tiết các đơn hàng
        {
            var details = _context.OrderDetails // Truy vấn bảng OrderDetails
                .Include(od => od.Order) // Nạp kèm theo thông tin đơn hàng liên kết (Order)
                .Include(od => od.Product) // Nạp kèm theo thông tin sản phẩm (Product) được chọn mua
                .ToList(); // Thực hiện tải dữ liệu và chuyển đổi sang dạng List

            return View(details); // Trả về giao diện Index và truyền danh sách chi tiết đơn hàng sang View
        }
    }
}
