/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý các chức năng CRUD cho danh mục bài viết, tích hợp xác thực người dùng qua Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp DbContext từ project CMS.Data
using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và ActionResult
using Microsoft.AspNetCore.Authorization; // Sử dụng thư viện bảo mật và phân quyền

[Authorize] // Bắt buộc thành viên phải đăng nhập (Authentication) mới được phép truy cập các chức năng quản lý danh mục
public class CategoryController : Controller // Định nghĩa lớp CategoryController kế thừa từ lớp Controller cơ bản
{
    private readonly ApplicationDbContext _context; // Biến cục bộ chỉ đọc lưu đối tượng kết nối CSDL

    public CategoryController(ApplicationDbContext context) // Phương thức khởi tạo thực hiện Dependency Injection cho DbContext
    {
        _context = context; // Gán đối tượng DbContext được truyền vào cho biến cục bộ
    }

    public IActionResult Index() // Hàm xử lý hiển thị danh sách tất cả danh mục bài viết
    {
        var data = _context.Categories.ToList(); // Truy vấn lấy toàn bộ dữ liệu trong bảng Categories chuyển thành List
        return View(data); // Trả về View Index cùng với danh sách dữ liệu danh mục thu được
    }

    [HttpGet] // Chỉ nhận yêu cầu gửi qua phương thức HTTP GET
    public IActionResult Create() // Hàm hiển thị giao diện thêm danh mục bài viết mới
    {
        return View(); // Trả về View giao diện tạo mới danh mục
    }

    [HttpPost] // Chỉ nhận yêu cầu gửi qua phương thức HTTP POST
    public IActionResult Create(CMS.Data.Entities.Category model) // Hàm xử lý tiếp nhận thông tin lưu danh mục bài viết mới
    {
        _context.Categories.Add(model); // Thêm đối tượng thực thể Category mới nhận từ form vào DbContext
        _context.SaveChanges(); // Lưu các thay đổi này xuống cơ sở dữ liệu vật lý
        return RedirectToAction("Index"); // Chuyển hướng người dùng quay lại trang danh sách (Index)
    }

    public IActionResult Delete(int id) // Hàm xử lý xóa danh mục bài viết dựa trên khóa chính Id
    {
        var category = _context.Categories.Find(id); // Tìm kiếm danh mục tương ứng trong database theo Id
        if (category != null) // Nếu tìm thấy danh mục hợp lệ
        {
            _context.Categories.Remove(category); // Thực hiện xóa danh mục đó khỏi DbContext
            _context.SaveChanges(); // Lưu các thay đổi này xuống cơ sở dữ liệu vật lý
        }
        return RedirectToAction("Index"); // Chuyển hướng người dùng quay lại trang danh sách (Index)
    }

    [HttpGet] // Chỉ nhận yêu cầu gửi qua phương thức HTTP GET
    public IActionResult Edit(int id) // Hàm hiển thị giao diện chỉnh sửa thông tin danh mục bài viết theo Id
    {
        var category = _context.Categories.Find(id); // Tìm danh mục trong cơ sở dữ liệu dựa trên Id truyền vào
        if (category == null) return NotFound(); // Nếu không tìm thấy danh mục, trả về trang lỗi 404
        return View(category); // Nếu tìm thấy, trả về View giao diện chỉnh sửa cùng dữ liệu thực thể danh mục đó
    }

    [HttpPost] // Chỉ nhận yêu cầu gửi qua phương thức HTTP POST
    public IActionResult Edit(CMS.Data.Entities.Category model) // Hàm xử lý cập nhật thay đổi thông tin danh mục bài viết
    {
        _context.Categories.Update(model); // Cập nhật thông tin thực thể Category nhận từ giao diện chỉnh sửa vào DbContext
        _context.SaveChanges(); // Thực hiện lưu các thay đổi này xuống cơ sở dữ liệu vật lý
        return RedirectToAction("Index"); // Chuyển hướng người dùng quay lại trang danh sách danh mục (Index)
    }
}