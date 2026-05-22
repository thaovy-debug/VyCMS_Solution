/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Quản lý danh sách thành viên hệ thống, hỗ trợ thêm mới, cập nhật thông tin (với xử lý đổi mật khẩu thông minh) và xóa thành viên, chỉ cho phép vai trò Admin [Authorize(Roles = "Admin")], 
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Sử dụng các thành phần hỗ trợ ASP.NET MVC Controller và ActionResult
using CMS.Data; // Sử dụng lớp kết nối cơ sở dữ liệu chính ApplicationDbContext
using CMS.Data.Entities; // Sử dụng lớp thực thể User từ namespace CMS.Data.Entities
using Microsoft.EntityFrameworkCore; // Hỗ trợ AsNoTracking và các thao tác nâng cao
using System.Linq; // Sử dụng các phương thức mở rộng LINQ để xử lý dữ liệu
using Microsoft.AspNetCore.Authorization; // Sử dụng phân quyền và xác thực người dùng

namespace CMS.Backend.Controllers // Định nghĩa không gian tên chứa các Controller phục vụ Backend
{
    [Authorize(Roles = "Admin")] // Chỉ tài khoản có vai trò là "Admin" mới được phép vào quản trị thành viên
    public class UserController : Controller // Định nghĩa lớp UserController kế thừa từ lớp Controller cơ bản
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ lưu trữ kết nối CSDL chỉ đọc

        public UserController(ApplicationDbContext context) // Phương thức khởi dựng nạp đối tượng DbContext thông qua DI
        {
            _context = context; // Gán đối tượng kết nối vào biến cục bộ
        }

        public IActionResult Index() // Hàm xử lý hiển thị danh sách người dùng hệ thống
        {
            // Thực hiện tải danh sách người dùng và ẩn chuỗi băm mật khẩu (PasswordHash) để bảo mật thông tin
            var users = _context.Users // Truy vấn từ bảng Users trong CSDL
                .Select(u => new User // Chiếu (Map) dữ liệu thực thể sang một đối tượng User mới
                {
                    Id = u.Id, // Gán Id người dùng tương ứng
                    Username = u.Username, // Gán tài khoản đăng nhập tương ứng
                    FullName = u.FullName, // Gán tên đầy đủ người dùng tương ứng
                    Role = u.Role // Gán vai trò/quyền hạn tương ứng
                    // Chú ý: Bỏ qua thuộc tính PasswordHash để bảo mật khi truyền ra giao diện
                })
                .ToList(); // Tải dữ liệu từ database và lưu vào danh sách (List)

            return View(users); // Trả về giao diện Index và truyền danh sách người dùng sang View
        }

        // GET: Hiển thị form thêm mới thành viên
        [HttpGet] // Chỉ nhận yêu cầu qua giao diện
        public IActionResult Create() // Hàm hiển thị giao diện thêm thành viên mới
        {
            return View(); // Trả về View tạo mới
        }

        // POST: Xử lý thêm mới thành viên vào hệ thống
        [HttpPost] // Tiếp nhận yêu cầu dạng gửi dữ liệu lên máy chủ
        public IActionResult Create(User model) // Nhận đối tượng User từ biểu mẫu nhập liệu
        {
            // 1. Kiểm tra xem tên đăng nhập (Username) đã tồn tại hay chưa
            var checkExist = _context.Users.Any(u => u.Username == model.Username); // Thực hiện kiểm tra nhanh sự tồn tại
            if (checkExist) // Nếu tên đăng nhập đã được sử dụng
            {
                // Thêm thông tin báo lỗi trùng tên đăng nhập vào ModelState để hiển thị lên giao diện
                ModelState.AddModelError("Username", "Tên đăng nhập này đã có người dùng!"); // Đăng ký lỗi
                return View(model); // Trả về giao diện cùng thông tin đã điền và thông báo lỗi tương ứng
            }

            // 2. Lưu thành viên mới vào Cơ sở dữ liệu SQL Server
            _context.Users.Add(model); // Thêm User mới vào DbContext ở trạng thái chờ
            _context.SaveChanges(); // Lưu các thay đổi thực sự xuống CSDL

            return RedirectToAction("Index"); // Quay về trang danh sách thành viên sau khi lưu thành công
        }

        // GET: Hiển thị form cập nhật thông tin thành viên kèm dữ liệu cũ
        [HttpGet] // Nhận yêu cầu hiển thị
        public IActionResult Edit(int id) // Hàm hiển thị giao diện chỉnh sửa tài khoản theo Id
        {
            var user = _context.Users.Find(id); // Tìm kiếm người dùng tương ứng trong CSDL
            if (user == null) return NotFound(); // Trả về lỗi 404 nếu không tìm thấy người dùng
            
            return View(user); // Truyền đối tượng người dùng cũ sang View Edit
        }

        // POST: Thực hiện lưu thay đổi thông tin thành viên
        [HttpPost] // Nhận yêu cầu submit từ giao diện
        public IActionResult Edit(User model, string? NewPassword) // model nhận thông tin cơ bản, NewPassword nhận mật khẩu mới
        {
            // 1. Tìm User gốc trong Database bằng AsNoTracking để lấy mật khẩu cũ mà không theo dõi thực thể
            var existingUser = _context.Users.AsNoTracking().FirstOrDefault(u => u.Id == model.Id); // Tìm thực thể cũ
            
            if (existingUser == null) return NotFound(); // Trả về 404 nếu tài khoản không tồn tại

            // 2. Xử lý mật khẩu: Nếu người dùng nhập mật khẩu mới thì gán, ngược lại giữ nguyên mật khẩu cũ
            if (!string.IsNullOrEmpty(NewPassword)) // Nếu ô mật khẩu mới không trống
            {
                model.PasswordHash = NewPassword; // Gán mật khẩu mới cho tài khoản (ở buổi 5 sẽ học mã hóa băm)
            }
            else // Nếu để trống ô mật khẩu mới
            {
                model.PasswordHash = existingUser.PasswordHash; // Giữ lại mật khẩu cũ từ tài khoản gốc
            }

            // 3. Cập nhật các thay đổi vào Cơ sở dữ liệu SQL Server
            _context.Users.Update(model); // Cập nhật thực thể
            _context.SaveChanges(); // Lưu thực sự xuống CSDL

            return RedirectToAction("Index"); // Quay về trang hiển thị danh sách thành viên Index
        }

        // Action xử lý xóa thành viên hệ thống
        public IActionResult Delete(int id) // Nhận Id của người dùng cần xóa
        {
            var user = _context.Users.Find(id); // Tìm người dùng trong CSDL bằng Id khóa chính
            if (user != null) // Nếu tồn tại người dùng tương ứng
            {
                _context.Users.Remove(user); // Tiến hành xóa thực thể khỏi tập hợp quản lý
                _context.SaveChanges(); // Chốt lưu các thay đổi thực sự xuống SQL Server
            }
            return RedirectToAction("Index"); // Quay lại trang Index hiển thị danh sách
        }
    }
}