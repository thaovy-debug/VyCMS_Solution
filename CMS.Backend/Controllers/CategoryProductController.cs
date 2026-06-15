/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý các chức năng CRUD cho danh mục loại sản phẩm, tích hợp bảo mật Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp DbContext chính
using CMS.Data.Entities; // Sử dụng thực thể CategoryProduct
using Microsoft.AspNetCore.Mvc; // Sử dụng các lớp điều hướng Controller và View
using Microsoft.AspNetCore.Authorization; // Sử dụng phân quyền và xác thực người dùng
using System.Linq; // Sử dụng LINQ
using Microsoft.AspNetCore.Http; // Hỗ trợ upload ảnh
using System.IO; // Hỗ trợ IO
using System; // Guid

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Bắt buộc đăng nhập trước khi truy cập quản trị loại sản phẩm
    public class CategoryProductController : Controller // Định nghĩa lớp CategoryProductController
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL

        public CategoryProductController(ApplicationDbContext context) // Phương thức khởi tạo thực hiện DI cho DbContext
        {
            _context = context; // Gán đối tượng kết nối CSDL
        }

        public IActionResult Index() // Hàm hiển thị danh sách các loại sản phẩm
        {
            var data = _context.CategoriesProducts.ToList(); // Lấy danh sách toàn bộ loại sản phẩm từ bảng CategoriesProducts
            return View(data); // Trả về giao diện Index kèm dữ liệu
        }

        [HttpGet] // Nhận yêu cầu HTTP GET
        public IActionResult Create() // Hàm hiển thị giao diện thêm loại sản phẩm mới
        {
            return View(); // Trả về View tạo mới
        }

        [HttpPost] // Nhận yêu cầu HTTP POST khi gửi form
        public IActionResult Create(CategoryProduct model, IFormFile? uploadImage) // Hàm xử lý lưu loại sản phẩm mới
        {
            if (ModelState.IsValid) // Kiểm tra dữ liệu đầu vào hợp lệ theo DataAnnotations
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create)) { uploadImage.CopyTo(stream); }
                    model.ImageUrl = "/uploads/" + fileName;
                }

                _context.CategoriesProducts.Add(model); // Thêm vào DbContext
                _context.SaveChanges(); // Lưu xuống CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách
            }
            return View(model); // Nếu không hợp lệ, trả lại View kèm thông báo lỗi
        }

        [HttpGet] // Nhận yêu cầu HTTP GET
        public IActionResult Edit(int id) // Hàm hiển thị giao diện sửa loại sản phẩm theo Id
        {
            var category = _context.CategoriesProducts.Find(id); // Tìm loại sản phẩm theo Id
            if (category == null) return NotFound(); // Nếu không tìm thấy, trả về 404
            return View(category); // Trả về View sửa kèm thông tin cũ
        }

        [HttpPost] // Nhận yêu cầu HTTP POST khi gửi form chỉnh sửa
        public IActionResult Edit(CategoryProduct model, IFormFile? uploadImage) // Hàm xử lý cập nhật thông tin loại sản phẩm
        {
            if (ModelState.IsValid) // Kiểm tra dữ liệu hợp lệ
            {
                var existingCategory = _context.CategoriesProducts.FirstOrDefault(c => c.Id == model.Id);
                if (existingCategory == null) return NotFound();

                existingCategory.Name = model.Name;
                existingCategory.Description = model.Description;

                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create)) { uploadImage.CopyTo(stream); }
                    existingCategory.ImageUrl = "/uploads/" + fileName;
                }

                _context.CategoriesProducts.Update(existingCategory); // Cập nhật thực thể
                _context.SaveChanges(); // Lưu xuống CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách
            }
            return View(model); // Trả lại View kèm lỗi nếu không hợp lệ
        }

        public IActionResult Delete(int id) // Hàm xử lý xóa loại sản phẩm theo Id
        {
            var category = _context.CategoriesProducts.Find(id); // Tìm loại sản phẩm theo Id
            if (category != null)
            {
                bool hasProducts = _context.Products.Any(p => p.CategoryProductId == id);
                if (hasProducts)
                {
                    TempData["ErrorMessage"] = "Không thể xóa loại sản phẩm này vì đang có sản phẩm thuộc danh mục!";
                    return RedirectToAction("Index");
                }

                _context.CategoriesProducts.Remove(category); // Xóa khỏi DbContext
                _context.SaveChanges(); // Lưu thay đổi xuống CSDL
            }
            return RedirectToAction("Index"); // Quay lại trang danh sách
        }
    }
}
