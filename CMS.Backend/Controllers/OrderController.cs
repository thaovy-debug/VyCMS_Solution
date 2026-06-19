/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý các chức năng xem chi tiết đơn hàng, cập nhật trạng thái đơn hàng (Chờ duyệt, Đang giao, Đã xong), xóa đơn hàng, bảo mật Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng DbContext kết nối CSDL
using CMS.Data.Entities; // Sử dụng thực thể Order, OrderDetail...
using Microsoft.AspNetCore.Mvc; // Sử dụng các lớp điều hướng Controller và View
using Microsoft.AspNetCore.Authorization; // Sử dụng bảo mật hệ thống
using Microsoft.EntityFrameworkCore; // Sử dụng các phương thức nạp chồng Include
using System.Linq; // Sử dụng LINQ

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Yêu cầu đăng nhập trước khi truy cập
    public class OrderController : Controller // Định nghĩa lớp OrderController
    {
        private readonly ApplicationDbContext _context; // Biến kết nối CSDL

        public OrderController(ApplicationDbContext context) // Phương thức khởi dựng
        {
            _context = context; // Gán đối tượng kết nối CSDL
        }

        public IActionResult Index() // Hàm hiển thị danh sách toàn bộ các đơn hàng
        {
            var orders = _context.Orders // Lấy dữ liệu từ bảng Orders
                .Include(o => o.Customer) // Nạp kèm khách hàng
                .Include(o => o.OrderDetails) // Nạp kèm chi tiết đơn hàng
                .ThenInclude(od => od.Product) // Nạp thông tin sản phẩm
                .ToList();
            return View(orders); // Trả về View danh sách đơn hàng
        }

        public IActionResult Details(int id) // Hàm hiển thị chi tiết các sản phẩm trong đơn hàng
        {
            var order = _context.Orders // Truy vấn đơn hàng theo Id
                .Include(o => o.Customer) // Nạp thông tin khách hàng
                .Include(o => o.OrderDetails) // Nạp chi tiết đơn hàng
                .ThenInclude(od => od.Product) // Nạp thông tin sản phẩm trong chi tiết
                .FirstOrDefault(o => o.Id == id); // Tìm bản ghi khớp Id

            if (order == null) return NotFound(); // Nếu không thấy đơn hàng, trả về 404
            return View(order); // Trả về View chi tiết
        }

        [HttpGet] // Nhận HTTP GET
        public IActionResult Edit(int id) // Hàm hiển thị giao diện cập nhật trạng thái đơn hàng
        {
            var order = _context.Orders.Find(id); // Tìm đơn hàng theo Id
            if (order == null) return NotFound(); // Trả về 404 nếu không thấy
            return View(order); // Trả về View chỉnh sửa trạng thái
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Edit(Order model) // Hàm xử lý cập nhật trạng thái đơn hàng
        {
            var order = _context.Orders.Find(model.Id); // Tìm đơn hàng gốc trong CSDL
            if (order == null) return NotFound();

            order.Status = model.Status; // Cập nhật trạng thái đơn hàng
            order.Notes = model.Notes; // Cập nhật ghi chú

            _context.SaveChanges(); // Lưu thay đổi xuống CSDL
            return RedirectToAction("Index"); // Quay lại trang danh sách đơn hàng
        }

        [HttpPost]
        public IActionResult UpdateStatus(int id, int status)
        {
            var order = _context.Orders.Find(id);
            if (order == null) return Json(new { success = false, message = "Không tìm thấy đơn hàng" });

            order.Status = status;
            _context.SaveChanges();
            return Json(new { success = true });
        }

        public IActionResult Delete(int id) // Hàm xử lý xóa đơn hàng theo Id
        {
            var order = _context.Orders // Tìm đơn hàng kèm chi tiết
                .Include(o => o.OrderDetails)
                .FirstOrDefault(o => o.Id == id);

            if (order != null)
            {
                if (order.OrderDetails != null)
                {
                    _context.OrderDetails.RemoveRange(order.OrderDetails); // Xóa toàn bộ chi tiết đơn hàng trước để tránh lỗi ràng buộc khóa ngoại
                }
                _context.Orders.Remove(order); // Xóa đơn hàng chính
                _context.SaveChanges(); // Lưu các thay đổi xuống CSDL
            }
            return RedirectToAction("Index"); // Quay lại trang danh sách
        }
    }
}
