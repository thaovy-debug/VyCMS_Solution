/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý hiển thị danh sách chi tiết đơn hàng (các dòng sản phẩm đã mua) và thực hiện chức năng xóa dòng đặt hàng, bảo mật Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng DbContext kết nối CSDL
using CMS.Data.Entities; // Sử dụng thực thể OrderDetail
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và View
using Microsoft.AspNetCore.Authorization; // Sử dụng bảo mật hệ thống
using Microsoft.EntityFrameworkCore; // Sử dụng nạp chồng liên kết dữ liệu Include
using System.Linq; // Sử dụng LINQ

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Yêu cầu đăng nhập trước khi truy cập
    public class OrderDetailController : Controller // Định nghĩa lớp OrderDetailController
    {
        private readonly ApplicationDbContext _context; // Biến kết nối CSDL

        public OrderDetailController(ApplicationDbContext context) // Phương thức khởi dựng
        {
            _context = context; // Gán đối tượng kết nối CSDL
        }

        public IActionResult Index() // Hàm hiển thị danh sách toàn bộ chi tiết đơn hàng
        {
            var details = _context.OrderDetails // Lấy dữ liệu từ bảng OrderDetails
                .Include(od => od.Order) // Nạp kèm đơn hàng tương ứng
                .ThenInclude(o => o.Customer) // Nạp tiếp khách hàng của đơn hàng đó để hiển thị
                .Include(od => od.Product) // Nạp kèm sản phẩm liên kết
                .ToList();
            return View(details); // Trả về View danh sách
        }

        public IActionResult Delete(int id) // Hàm xử lý xóa chi tiết đơn hàng theo Id
        {
            var detail = _context.OrderDetails.Find(id); // Tìm chi tiết đơn hàng theo Id
            if (detail != null)
            {
                _context.OrderDetails.Remove(detail); // Xóa khỏi DbContext
                _context.SaveChanges(); // Lưu thay đổi xuống CSDL
            }
            return RedirectToAction("Index"); // Quay lại trang danh sách
        }
    }
}
