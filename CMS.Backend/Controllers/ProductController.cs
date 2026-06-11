/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý các chức năng CRUD cho sản phẩm, hỗ trợ upload ảnh trực tiếp từ máy tính lên thư mục wwwroot/uploads, tích hợp xác thực Cookie [Authorize], 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp DbContext chính
using CMS.Data.Entities; // Sử dụng thực thể Product, CategoryProduct
using Microsoft.AspNetCore.Mvc; // Sử dụng các lớp điều hướng Controller và View
using Microsoft.AspNetCore.Authorization; // Sử dụng phân quyền và xác thực người dùng
using Microsoft.EntityFrameworkCore; // Sử dụng nạp chồng liên kết Include
using Microsoft.AspNetCore.Http; // Sử dụng IFormFile hỗ trợ upload ảnh
using System; // Sử dụng lớp Guid
using System.IO; // Sử dụng các thao tác File, Path, Directory
using System.Linq; // Sử dụng LINQ

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Yêu cầu người dùng đăng nhập trước khi thao tác
    public class ProductController : Controller // Lớp ProductController kế thừa từ Controller
    {
        private readonly ApplicationDbContext _context; // Biến kết nối CSDL

        public ProductController(ApplicationDbContext context) // Phương thức khởi dựng
        {
            _context = context; // Gán DbContext
        }

        public IActionResult Index(int page = 1) // Hàm hiển thị danh sách toàn bộ sản phẩm có phân trang
        {
            int pageSize = 5; // Số sản phẩm trên mỗi trang
            var totalItems = _context.Products.Count();
            
            var products = _context.Products // Lấy dữ liệu từ bảng Products
                .Include(p => p.CategoryProduct) // Nạp kèm danh mục sản phẩm liên kết
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
                
            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            
            return View(products); // Trả về View Index
        }

        [HttpGet] // Nhận HTTP GET
        public IActionResult Create() // Hàm hiển thị giao diện thêm sản phẩm mới
        {
            ViewBag.CategoriesProducts = _context.CategoriesProducts.ToList(); // Truyền danh sách loại sản phẩm sang View dạng ViewBag
            return View(); // Trả về View tạo mới
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Create(Product model, List<IFormFile> uploadImages, IFormFile? uploadSizeGuide) // Hàm xử lý lưu thông tin sản phẩm mới kèm ảnh upload
        {
            if (ModelState.IsValid) // Kiểm tra tính hợp lệ của dữ liệu form
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"); // Định nghĩa thư mục lưu ảnh
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder); // Tạo thư mục nếu chưa tồn tại

                if (uploadImages != null && uploadImages.Count > 0) // Nếu người dùng tải nhiều file lên
                {
                    List<string> filePaths = new List<string>();
                    foreach (var uploadImage in uploadImages)
                    {
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName); // Tạo tên file ảnh ngẫu nhiên duy nhất
                        string filePath = Path.Combine(folder, fileName); // Đường dẫn lưu vật lý
                        using (var stream = new FileStream(filePath, FileMode.Create)) { uploadImage.CopyTo(stream); }
                        filePaths.Add("/uploads/" + fileName);
                    }
                    model.ImageUrl = string.Join(",", filePaths); // Gán chuỗi đường dẫn tương đối của các ảnh ngăn cách bằng dấu phẩy
                }

                if (uploadSizeGuide != null && uploadSizeGuide.Length > 0)
                {
                    string sizeFileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadSizeGuide.FileName);
                    string sizeFilePath = Path.Combine(folder, sizeFileName);
                    using (var stream = new FileStream(sizeFilePath, FileMode.Create)) { uploadSizeGuide.CopyTo(stream); }
                    model.SizeGuideImageUrl = "/uploads/" + sizeFileName;
                }

                _context.Products.Add(model); // Thêm sản phẩm vào DbContext
                _context.SaveChanges(); // Lưu vào CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách
            }
            ViewBag.CategoriesProducts = _context.CategoriesProducts.ToList(); // Nạp lại danh sách nếu có lỗi
            return View(model); // Trả lại View cùng thông báo lỗi
        }

        [HttpGet] // Nhận HTTP GET
        public IActionResult Edit(int id) // Hàm hiển thị giao diện sửa sản phẩm theo Id
        {
            var product = _context.Products.Find(id); // Tìm sản phẩm theo Id
            if (product == null) return NotFound(); // Trả về 404 nếu không thấy
            ViewBag.CategoriesProducts = _context.CategoriesProducts.ToList(); // Truyền danh sách loại sản phẩm sang View
            return View(product); // Trả về View chỉnh sửa
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Edit(Product model, List<IFormFile> uploadImages, IFormFile? uploadSizeGuide) // Hàm xử lý cập nhật thay đổi sản phẩm kèm ảnh mới
        {
            if (ModelState.IsValid) // Kiểm tra tính hợp lệ
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"); // Thư mục lưu ảnh
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder); // Tạo nếu chưa có
                
                var existingProduct = _context.Products.FirstOrDefault(p => p.Id == model.Id);
                if (existingProduct == null) return NotFound();

                // Cập nhật các trường từ form
                existingProduct.Name = model.Name;
                existingProduct.Description = model.Description;
                existingProduct.Price = model.Price;
                existingProduct.StockQuantity = model.StockQuantity;
                existingProduct.CategoryProductId = model.CategoryProductId;
                existingProduct.Sizes = model.Sizes; // Cập nhật Sizes

                if (uploadImages != null && uploadImages.Count > 0) // Nếu người dùng có chọn file ảnh mới
                {
                    List<string> filePaths = new List<string>();
                    foreach (var uploadImage in uploadImages)
                    {
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName); // Tạo tên file duy nhất
                        string filePath = Path.Combine(folder, fileName); // Đường dẫn vật lý
                        using (var stream = new FileStream(filePath, FileMode.Create)) { uploadImage.CopyTo(stream); }
                        filePaths.Add("/uploads/" + fileName);
                    }
                    existingProduct.ImageUrl = string.Join(",", filePaths); // Lưu chuỗi đường dẫn các ảnh mới
                }

                if (uploadSizeGuide != null && uploadSizeGuide.Length > 0)
                {
                    string sizeFileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadSizeGuide.FileName);
                    string sizeFilePath = Path.Combine(folder, sizeFileName);
                    using (var stream = new FileStream(sizeFilePath, FileMode.Create)) { uploadSizeGuide.CopyTo(stream); }
                    existingProduct.SizeGuideImageUrl = "/uploads/" + sizeFileName;
                }

                _context.Products.Update(existingProduct); // Cập nhật thông tin sản phẩm
                _context.SaveChanges(); // Lưu thay đổi vào CSDL
                return RedirectToAction("Index"); // Quay lại trang danh sách sản phẩm
            }
            ViewBag.CategoriesProducts = _context.CategoriesProducts.ToList(); // Nạp lại nếu lỗi
            return View(model); // Trả về View cùng thông báo lỗi
        }

        public IActionResult Delete(int id) // Hàm xử lý xóa sản phẩm theo Id
        {
            var product = _context.Products.Find(id); // Tìm sản phẩm theo Id
            if (product != null)
            {
                bool hasOrders = _context.OrderDetails.Any(od => od.ProductId == id);
                if (hasOrders)
                {
                    TempData["ErrorMessage"] = "Không thể xóa sản phẩm này vì đang có đơn hàng liên quan!";
                    return RedirectToAction("Index");
                }

                _context.Products.Remove(product); // Xóa sản phẩm khỏi DbContext
                _context.SaveChanges(); // Lưu thay đổi xuống CSDL
            }
            return RedirectToAction("Index"); // Quay lại trang danh sách sản phẩm
        }
    }
}
