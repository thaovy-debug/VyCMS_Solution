/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý các chức năng CRUD cho khách hàng, tích hợp xác thực người dùng qua Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp DbContext chính
using CMS.Data.Entities; // Sử dụng thực thể Customer
using Microsoft.AspNetCore.Mvc; // Sử dụng các lớp điều hướng Controller và View
using Microsoft.AspNetCore.Authorization; // Sử dụng phân quyền và bảo mật
using System.Linq; // Sử dụng LINQ

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Yêu cầu đăng nhập trước khi truy cập
    public class CustomerController : Controller // Định nghĩa lớp CustomerController
    {
        private readonly ApplicationDbContext _context; // Biến kết nối CSDL

        public CustomerController(ApplicationDbContext context) // Phương thức khởi dựng
        {
            _context = context; // Gán đối tượng kết nối CSDL
        }

        public IActionResult Index() // Hàm hiển thị danh sách toàn bộ khách hàng
        {
            var data = _context.Customers.ToList(); // Truy vấn lấy danh sách khách hàng chuyển thành List
            return View(data); // Trả về View Index
        }

        [HttpGet] // Nhận HTTP GET
        public IActionResult Create() // Hàm hiển thị giao diện thêm khách hàng mới
        {
            return View(); // Trả về View thêm mới
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Create(Customer model) // Hàm xử lý lưu khách hàng mới
        {
            if (ModelState.IsValid) // Kiểm tra dữ liệu nhập từ form hợp lệ
            {
                _context.Customers.Add(model); // Thêm khách hàng vào DbContext
                _context.SaveChanges(); // Lưu vào CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách
            }
            return View(model); // Trả về View kèm thông báo lỗi
        }

        [HttpGet] // Nhận HTTP GET
        public IActionResult Edit(int id) // Hàm hiển thị giao diện chỉnh sửa khách hàng theo Id
        {
            var customer = _context.Customers.Find(id); // Tìm khách hàng theo Id
            if (customer == null) return NotFound(); // Trả về lỗi 404 nếu không thấy
            return View(customer); // Trả về View chỉnh sửa cùng dữ liệu cũ
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Edit(Customer model) // Hàm xử lý lưu cập nhật thông tin khách hàng
        {
            if (ModelState.IsValid) // Kiểm tra dữ liệu hợp lệ
            {
                _context.Customers.Update(model); // Cập nhật thực thể khách hàng
                _context.SaveChanges(); // Lưu thay đổi xuống CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách
            }
            return View(model); // Trả về View kèm lỗi nếu không hợp lệ
        }

        public IActionResult ToggleLock(int id) // Hàm xử lý khóa/mở khóa khách hàng dựa trên Id
        {
            var customer = _context.Customers.Find(id); // Tìm khách hàng theo Id
            if (customer != null)
            {
                customer.IsLocked = !customer.IsLocked; // Đảo ngược trạng thái khóa
                _context.SaveChanges(); // Lưu thay đổi xuống CSDL
            }
            return RedirectToAction("Index"); // Quay lại trang danh sách khách hàng
        }
    }
}
