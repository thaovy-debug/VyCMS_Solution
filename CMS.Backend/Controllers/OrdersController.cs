/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa các API endpoint POST để tạo đơn đặt hàng từ giỏ hàng gửi lên
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Import thư viện hỗ trợ thiết lập Web API Controller
using CMS.Data; // Import namespace chứa lớp ngữ cảnh cơ sở dữ liệu ApplicationDbContext
using CMS.Data.Entities; // Import namespace chứa thực thể Order và các thực thể khác
using System; // Import thư viện hệ thống cơ bản
using System.Threading.Tasks; // Hỗ trợ định nghĩa các tác vụ bất đồng bộ Task

namespace CMS.Backend.Controllers // Khai báo không gian tên tương ứng với thư mục Controllers của dự án Backend
{
    [Route("api/[controller]")] // Định nghĩa đường dẫn định tuyến chính cho API là api/Orders
    [ApiController] // Đánh dấu lớp này là một API Controller để tự động xử lý kiểm định dữ liệu đầu vào (Validation)
    public class OrdersController : ControllerBase // Kế thừa ControllerBase thay vì Controller của MVC để tối ưu hiệu năng API
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ chỉ đọc lưu trữ ngữ cảnh cơ sở dữ liệu

        public OrdersController(ApplicationDbContext context) // Hàm khởi tạo nhận Dependency Injection cho ApplicationDbContext
        {
            _context = context; // Gán ngữ cảnh cơ sở dữ liệu được tiêm vào biến cục bộ để sử dụng trong các API
        }

        [HttpPost] // API: Tiếp nhận đơn đặt hàng từ giỏ hàng FrontEnd gửi lên
        public async Task<IActionResult> CreateOrder([FromBody] OrderInputDTO input) // Định nghĩa hàm tạo đơn hàng bất đồng bộ
        {
            if (input == null) // Kiểm tra kịch bản lỗi bảo vệ: Nếu dữ liệu truyền lên trống rỗng
            {
                return BadRequest(new { message = "Dữ liệu đơn hàng không hợp lệ" }); // Trả về mã lỗi 400 Bad Request kèm thông báo JSON
            } // Kết thúc khối if kiểm tra null

            try // Sử dụng khối try để bắt các ngoại lệ phát sinh trong quá trình lưu trữ đơn hàng
            {
                var newOrder = new Order // Tự động khởi tạo cấu trúc thực thể Đơn hàng mới
                {
                    OrderDate = DateTime.Now, // Tự động lấy ngày giờ thực tế máy tính lúc mua hàng
                    CustomerId = input.CustomerId, // Gán mã khách hàng từ DTO gửi lên
                    Status = 0, // 0: Mặc định đơn hàng mới ở trạng thái "Chờ xử lý"
                    Notes = input.Notes // Gán ghi chú từ DTO gửi lên
                }; // Kết thúc khởi tạo thực thể Order

                _context.Orders.Add(newOrder); // Thêm đơn hàng mới vào DbSet Orders của ngữ cảnh cơ sở dữ liệu
                await _context.SaveChangesAsync(); // Chốt lưu xuống SQL Server để tự động phát sinh mã ID tăng dần

                return StatusCode(201, new { // Trả về mã thành công 201 Created cho Client
                    message = "Đặt hàng thành công!", // Thông điệp đặt hàng thành công
                    orderId = newOrder.Id // Gửi ngược lại mã ID đơn hàng vừa tạo cho FrontEnd sử dụng
                }); // Kết thúc phản hồi thành công
            } // Kết thúc khối try
            catch (Exception ex) // Bắt lỗi nếu có ngoại lệ phát sinh trong quá trình xử lý lưu đơn hàng
            {
                return StatusCode(500, new { message = "Lỗi xử lý tạo đơn hàng ngầm", detail = ex.Message }); // Trả về lỗi 500 kèm thông điệp báo lỗi chi tiết
            } // Kết thúc khối catch
        } // Kết thúc hàm CreateOrder
    } // Kết thúc lớp OrdersController

    public class OrderInputDTO // LỚP DTO TRUNG GIAN ĐỂ HỨNG DỮ LIỆU TỪ FRONTEND TRUYỀN LÊN
    {
        public int CustomerId { get; set; } // Thuộc tính lưu trữ mã số ID của Khách hàng mua
        public string? Notes { get; set; } // Thuộc tính lưu trữ thông tin ghi chú đặt hàng
    } // Kết thúc lớp OrderInputDTO
} // Kết thúc namespace CMS.Backend.Controllers
