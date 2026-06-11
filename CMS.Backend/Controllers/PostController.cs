/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý danh sách và chi tiết các bài viết, hỗ trợ lọc bài viết theo từng danh mục cụ thể (Đã thêm chức năng CRUD tạo mới, chỉnh sửa kèm upload ảnh đại diện và xóa bài viết, tích hợp xác thực [Authorize] cho bảo mật), 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu ApplicationDbContext
using CMS.Data.Entities; // Sử dụng các thực thể dữ liệu Post, Category...
using Microsoft.AspNetCore.Mvc; // Sử dụng các tính năng của MVC Controller, IActionResult
using Microsoft.AspNetCore.Mvc.Rendering; // Sử dụng SelectList cho DropdownList
using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho các truy vấn dữ liệu nâng cao (Include, AsNoTracking)
using System.Linq; // Hỗ trợ các phương thức mở rộng LINQ
using System.IO; // Hỗ trợ các thao tác xử lý tập tin và đường dẫn thư mục
using Microsoft.AspNetCore.Http; // Hỗ trợ kiểu IFormFile cho việc tải tập tin lên
using Microsoft.AspNetCore.Authorization; // Sử dụng thư viện bảo mật xác thực danh tính

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize] // Bắt buộc đăng nhập mới được truy cập các tính năng quản lý bài viết tin tức
    public class PostController : Controller // Định nghĩa lớp PostController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public PostController(ApplicationDbContext context) // Phương thức khởi dựng thực hiện tiêm dependency DbContext
        {
            _context = context; // Gán đối tượng kết nối CSDL được truyền vào
        }

        // Chấp nhận tham số id của danh mục (tùy chọn) để thực hiện lọc các bài viết thuộc danh mục đó
        public IActionResult Index(int? id) // Hàm xử lý hiển thị danh sách bài viết
        {
            if (id == null) // Kiểm tra nếu không truyền vào mã danh mục (id)
            {
                // Nếu không có id danh mục được chọn, trả về toàn bộ bài viết sắp xếp theo ngày tạo giảm dần
                var all = _context.Posts // Truy vấn bảng Posts
                    .Include(p => p.Category) // Tải kèm theo thông tin của danh mục liên quan (Category)
                    .OrderByDescending(p => p.CreatedDate) // Sắp xếp giảm dần theo ngày tạo (CreatedDate)
                    .ToList(); // Tải dữ liệu và chuyển đổi thành danh sách
                return View(all); // Trả về View Index hiển thị tất cả bài viết
            }

            // Nếu có truyền vào id danh mục, tiến hành lọc các bài viết thuộc danh mục đó
            var posts = _context.Posts // Truy vấn bảng Posts
                .Where(p => p.CategoryId == id) // Lọc những bài viết có CategoryId bằng với id truyền vào
                .Include(p => p.Category) // Tải kèm theo thông tin danh mục liên quan
                .OrderByDescending(p => p.CreatedDate) // Sắp xếp theo ngày tạo giảm dần
                .ToList(); // Chuyển đổi kết quả thành danh sách

            return View(posts); // Trả về View Index hiển thị các bài viết đã lọc theo danh mục
        }

        // GET: Post/Details/5
        public IActionResult Details(int id) // Hàm xử lý hiển thị chi tiết bài viết dựa trên id bài viết nhận được
        {
            // 1. Truy vấn bài viết theo ID
            // Sử dụng .Include(p => p.Category) để lấy kèm thông tin Danh mục (Join bảng)
            var post = _context.Posts // Truy vấn từ bảng Posts
                .Include(p => p.Category) // Nạp kèm theo thông tin danh mục bài viết
                .FirstOrDefault(p => p.Id == id); // Lấy bài viết đầu tiên trùng khớp với Id, nếu không có trả về null

            // 2. Kiểm tra nếu không tìm thấy bài viết (tránh lỗi màn hình trắng)
            if (post == null) // Nếu đối tượng post thu được bằng null (không tìm thấy bài viết)
            {
                return NotFound(); // Trả về trang báo lỗi không tìm thấy tài nguyên 404
            }

            // 3. Truyền dữ liệu sang View
            return View(post); // Trả về giao diện chi tiết và truyền đối tượng bài viết sang View
        }

        // GET: Hiển thị form tạo mới bài viết
        [HttpGet] // Chỉ nhận yêu cầu gửi qua phương thức HTTP GET
        public IActionResult Create() // Hàm hiển thị giao diện thêm bài viết mới
        {
            // Chúng ta lấy danh sách Category từ Database đổ vào ViewBag dưới dạng SelectList
            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name"); // Id làm Value, Name làm Text hiển thị
            return View(); // Trả về View tạo mới bài viết
        }

        // POST: Xử lý lưu bài viết mới và tải ảnh lên
        [HttpPost] // Chỉ nhận yêu cầu gửi qua phương thức HTTP POST
        public IActionResult Create(Post model, IFormFile? uploadImage) // Hàm xử lý tiếp nhận thông tin bài viết và file ảnh tải lên
        {
            if (uploadImage != null && uploadImage.Length > 0) // Kiểm tra nếu người dùng có chọn tệp hình ảnh để tải lên
            {
                // 1. Định nghĩa đường dẫn lưu file vật lý: wwwroot/uploads
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"); // Tạo đường dẫn tuyệt đối tới thư mục uploads

                // Tạo thư mục uploads nếu nó chưa tồn tại trên máy chủ
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder); // Tạo thư mục

                // 2. Tạo tên file duy nhất bằng Guid để không bị trùng tên/đè dữ liệu file cũ
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName); // Sinh tên file ngẫu nhiên kết hợp phần mở rộng file gốc
                string filePath = Path.Combine(folder, fileName); // Đường dẫn đầy đủ của file ảnh trên máy chủ

                // 3. Sao chép dữ liệu file ảnh vào thư mục vật lý vừa định vị
                using (var stream = new FileStream(filePath, FileMode.Create)) // Mở luồng ghi file mới
                {
                    uploadImage.CopyTo(stream); // Thực hiện sao chép file
                }

                // 4. Lưu đường dẫn tương đối của ảnh vào thuộc tính ImageUrl của Model để sau này hiển thị lên web
                model.ImageUrl = "/uploads/" + fileName; // Địa chỉ URL của ảnh
            }

            _context.Posts.Add(model); // Thêm bài viết mới vào tập hợp quản lý của DbContext
            _context.SaveChanges(); // Chốt lưu các thay đổi xuống cơ sở dữ liệu SQL Server
            return RedirectToAction("Index"); // Quay về trang danh sách bài viết quản trị sau khi đăng bài thành công
        }

        // GET: Hiển thị form chỉnh sửa bài viết cũ kèm dữ liệu cũ
        [HttpGet] // Chỉ nhận yêu cầu gửi qua phương thức HTTP GET
        public IActionResult Edit(int id) // Hàm hiển thị giao diện chỉnh sửa bài viết theo khóa chính Id
        {
            var post = _context.Posts.Find(id); // Tìm bài viết tương ứng trong cơ sở dữ liệu dựa trên Id truyền vào
            if (post == null) return NotFound(); // Nếu không tìm thấy bài viết, trả về trang lỗi 404

            // Chuẩn bị lại danh sách danh mục để người dùng có thể thay đổi danh mục liên kết, đồng thời chọn sẵn danh mục cũ của bài viết
            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", post.CategoryId); // Khởi tạo SelectList chọn sẵn CategoryId hiện tại
            return View(post); // Trả về giao diện chỉnh sửa kèm dữ liệu bài viết cũ
        }

        // POST: Thực hiện cập nhật thay đổi bài viết
        [HttpPost] // Chỉ nhận yêu cầu gửi qua phương thức HTTP POST
        public IActionResult Edit(Post model, IFormFile? uploadImage) // Hàm xử lý tiếp nhận cập nhật thông tin bài viết và ảnh thay đổi
        {
            // Bước 1: Kiểm tra xem người dùng có chọn file ảnh mới không
            if (uploadImage != null && uploadImage.Length > 0) // Nếu có tải ảnh mới lên
            {
                // Thực hiện quy trình upload giống như trang Create
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"); // Đường dẫn thư mục lưu ảnh
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder); // Tạo thư mục nếu chưa có

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName); // Tạo tên file ảnh duy nhất
                string filePath = Path.Combine(folder, fileName); // Đường dẫn đầy đủ của file ảnh

                using (var stream = new FileStream(filePath, FileMode.Create)) // Mở luồng tạo file
                {
                    uploadImage.CopyTo(stream); // Sao chép file lên máy chủ
                }

                // Cập nhật đường dẫn ảnh mới vào model
                model.ImageUrl = "/uploads/" + fileName; // Lưu URL ảnh mới vào thuộc tính ImageUrl của bài viết
            }
            else // Nếu người dùng không tải ảnh mới lên (giữ nguyên ảnh cũ)
            {
                // Bước quan trọng: Lấy lại giá trị ImageUrl cũ từ Database để tránh bị ghi đè thành giá trị rỗng hoặc null
                var oldPost = _context.Posts.AsNoTracking().FirstOrDefault(p => p.Id == model.Id); // Truy vấn bài viết gốc mà không theo dõi (AsNoTracking) để tránh xung đột
                if (oldPost != null && string.IsNullOrEmpty(model.ImageUrl)) // Nếu bài viết gốc tồn tại và Model gửi về không có ảnh
                {
                    model.ImageUrl = oldPost.ImageUrl; // Giữ lại đường dẫn ảnh cũ từ cơ sở dữ liệu
                }
            }

            _context.Posts.Update(model); // Cập nhật thông tin thực thể bài viết vào DbContext
            _context.SaveChanges(); // Lưu cập nhật thực sự xuống SQL Server
            return RedirectToAction("Index"); // Chuyển hướng quay về trang danh sách bài viết Index
        }

        // Action xử lý xóa bài viết trực tiếp theo Id
        public IActionResult Delete(int id) // Hàm xử lý xóa bài viết dựa trên Id nhận được
        {
            // 1. Tìm bài viết theo Id trong cơ sở dữ liệu
            var post = _context.Posts.Find(id); // Sử dụng phương thức Find tìm nhanh theo khóa chính

            if (post != null) // Nếu tìm thấy bài viết hợp lệ
            {
                // 2. Thực hiện xóa khỏi DbContext bộ nhớ tạm
                _context.Posts.Remove(post); // Xóa thực thể bài viết khỏi tập hợp quản lý
                
                // 3. Thực thi lưu thay đổi thực sự xuống SQL Server
                _context.SaveChanges(); // Lưu thay đổi
            }
            return RedirectToAction("Index"); // Quay về giao diện danh sách bài viết Index
        }
        // Action xử lý tải ảnh lên từ CKEditor
        [HttpPost]
        public IActionResult UploadImage(IFormFile upload)
        {
            if (upload != null && upload.Length > 0)
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(upload.FileName);
                string filePath = Path.Combine(folder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    upload.CopyTo(stream);
                }

                var url = "/uploads/" + fileName;
                // CKEditor mong đợi một JSON có thuộc tính "url"
                return Json(new { uploaded = true, url = url });
            }
            return Json(new { uploaded = false, error = new { message = "Lỗi tải ảnh lên" } });
        }
    }
}