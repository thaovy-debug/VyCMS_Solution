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
        private readonly CMS.Backend.Services.IEmailService _emailService; // Dịch vụ gửi email
        private readonly Microsoft.Extensions.DependencyInjection.IServiceScopeFactory _scopeFactory;

        public OrderController(ApplicationDbContext context, CMS.Backend.Services.IEmailService emailService, Microsoft.Extensions.DependencyInjection.IServiceScopeFactory scopeFactory) // Phương thức khởi dựng
        {
            _context = context; // Gán đối tượng kết nối CSDL
            _emailService = emailService;
            _scopeFactory = scopeFactory;
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

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var order = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Include(o => o.OrderHistories)
                .FirstOrDefault(o => o.Id == id);
            
            if (order == null) return NotFound();
            
            return View(order);
        }

        [HttpPost] // Nhận HTTP POST
        public IActionResult Edit(Order model) // Hàm xử lý cập nhật trạng thái đơn hàng
        {
            var order = _context.Orders.Find(model.Id); // Tìm đơn hàng gốc trong CSDL
            if (order == null) return NotFound();

            if (order.Status != model.Status)
            {
                string statusName = model.Status == 1 ? "Đang xử lý/Giao hàng" : model.Status == 2 ? "Đã giao" : model.Status == 3 ? "Hoàn thành" : model.Status == 4 ? "Đã hủy" : "Chờ duyệt";
                _context.Notifications.Add(new Notification
                {
                    CustomerId = order.CustomerId,
                    Title = "Cập nhật đơn hàng",
                    Message = $"Đơn hàng #{order.Id} của bạn đã chuyển sang trạng thái: {statusName}.",
                    Type = "Order",
                    RelatedId = order.Id
                });
                if (model.Status == 1 || model.Status == 2)
                {
                    SendStatusEmailInBackground(order.Id, model.Status);
                }
            }

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

            if (order.Status != status)
            {
                string statusName = status == 1 ? "Đang xử lý/Giao hàng" : status == 2 ? "Đã giao" : status == 3 ? "Hoàn thành" : status == 4 ? "Đã hủy" : "Chờ duyệt";
                _context.Notifications.Add(new Notification
                {
                    CustomerId = order.CustomerId,
                    Title = "Cập nhật đơn hàng",
                    Message = $"Đơn hàng #{order.Id} của bạn đã chuyển sang trạng thái: {statusName}.",
                    Type = "Order",
                    RelatedId = order.Id
                });
                if (status == 1 || status == 2)
                {
                    SendStatusEmailInBackground(order.Id, status);
                }
            }

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

        [HttpPost]
        public async Task<IActionResult> SendMessage(int orderId, string message)
        {
            var order = _context.Orders.Include(o => o.Customer).Include(o => o.OrderDetails).ThenInclude(od => od.Product).FirstOrDefault(o => o.Id == orderId);
            if (order != null && order.Customer != null && !string.IsNullOrEmpty(message))
            {
                // Generate product list HTML for the email
                string productRowsHtml = "";
                decimal totalPrice = 0;
                foreach (var item in order.OrderDetails)
                {
                    string variantText = "";
                    if (!string.IsNullOrEmpty(item.Color) && !string.IsNullOrEmpty(item.Size)) {
                        variantText = $" (Màu: {item.Color}, Size: {item.Size})";
                    } else if (!string.IsNullOrEmpty(item.Color)) {
                        variantText = $" (Màu: {item.Color})";
                    } else if (!string.IsNullOrEmpty(item.Size)) {
                        variantText = $" (Size: {item.Size})";
                    }

                    productRowsHtml += $@"
                        <tr>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee;'>{item.Product?.Name}{variantText}</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: center;'>{item.Quantity}</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: right;'>{item.UnitPrice:N0} đ</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: right;'>{(item.UnitPrice * item.Quantity):N0} đ</td>
                        </tr>
                    ";
                    totalPrice += item.UnitPrice * item.Quantity;
                }

                // Send email
                string subject = $"ZEY CHÍC - Thông báo về đơn hàng #{order.Id}";
                string acceptUrl = $"https://localhost:7030/api/Orders/CustomerResponse?orderId={order.Id}&action=accept";
                string cancelUrl = $"https://localhost:7030/api/Orders/CustomerResponse?orderId={order.Id}&action=cancel";
                
                string body = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset=""UTF-8"">
                    </head>
                    <body style=""background-color: #f9f9f9; padding: 20px 0; margin: 0;"">
                        <div style=""max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #fff; padding: 30px; border-radius: 4px; border: 1px solid #eaeaea;"">
                            <div style=""text-align: center; margin-bottom: 20px;"">
                                <h2 style=""color: #800000; margin: 0; font-size: 24px;"">ZEY CHÍC</h2>
                            </div>
                            <div style=""border-bottom: 2px solid #800000; margin-bottom: 20px;""></div>

                            <p style=""font-size: 14px; color: #333;"">Kính chào <strong>{order.Customer.FullName}</strong>,</p>
                            <p style=""font-size: 14px; color: #333;"">Chúng tôi xin thông báo về đơn hàng <strong>#{order.Id}</strong> của bạn:</p>
                            
                            <div style=""background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;"">
                                <p style=""margin: 0; color: #E65100; font-weight: bold;"">Tin nhắn từ cửa hàng:</p>
                                <p style=""margin: 10px 0 0 0; color: #333; line-height: 1.5;"">{message}</p>
                            </div>
                            
                            <div style=""text-align: center; margin: 30px 0;"">
                                <a href=""{acceptUrl}"" style=""display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 15px;"">Chấp nhận yêu cầu</a>
                                <a href=""{cancelUrl}"" style=""display: inline-block; background-color: #F44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"">Hủy đơn</a>
                            </div>
                            
                            <h3 style=""font-size: 16px; margin-top: 25px; margin-bottom: 15px; color: #333;"">Chi tiết đơn hàng</h3>
                            <table style=""width: 100%; border-collapse: collapse; font-size: 13px; color: #333;"">
                                <thead>
                                    <tr>
                                        <th style=""text-align: left; padding-bottom: 10px; border-bottom: 1px solid #ddd;"">Sản phẩm</th>
                                        <th style=""text-align: center; padding-bottom: 10px; border-bottom: 1px solid #ddd;"">SL</th>
                                        <th style=""text-align: right; padding-bottom: 10px; border-bottom: 1px solid #ddd;"">Đơn giá</th>
                                        <th style=""text-align: right; padding-bottom: 10px; border-bottom: 1px solid #ddd;"">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productRowsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan=""3"" style=""text-align: right; padding-top: 15px; font-weight: bold;"">Tổng cộng:</td>
                                        <td style=""text-align: right; padding-top: 15px; font-weight: bold; color: #800000;"">{totalPrice:N0} đ</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </body>
                    </html>
                ";

                try {
                    await _emailService.SendEmailAsync(order.Customer.Email, subject, body);
                    // Add history
                    _context.OrderHistories.Add(new OrderHistory
                    {
                        OrderId = order.Id,
                        Action = "Gửi thông báo",
                        Description = $"Đã gửi email thông báo cho khách: {message}",
                        PerformedBy = User.Identity?.Name ?? "Admin"
                    });
                    _context.SaveChanges();
                } catch { }
            }
            return RedirectToAction("Details", new { id = orderId });
        }

        [HttpPost]
        public async Task<IActionResult> AcceptCancel(int orderId, string cancelReason)
        {
            var order = _context.Orders.Include(o => o.Customer).FirstOrDefault(o => o.Id == orderId);
            if (order != null && order.Customer != null)
            {
                order.Status = 4; // Đã hủy
                
                _context.OrderHistories.Add(new OrderHistory
                {
                    OrderId = order.Id,
                    Action = "Chấp nhận hủy đơn",
                    Description = $"Admin đã chấp nhận yêu cầu hủy đơn. Lý do: {cancelReason}",
                    PerformedBy = User.Identity?.Name ?? "Admin"
                });

                _context.Notifications.Add(new Notification
                {
                    CustomerId = order.CustomerId,
                    Title = "Đơn hàng đã được hủy",
                    Message = cancelReason,
                    Type = "Order",
                    RelatedId = order.Id
                });

                _context.SaveChanges();

                // Send cancellation email
                string subject = $"ZEY CHÍC - Chấp nhận hủy đơn hàng #{order.Id}";
                string body = $@"
                    <!DOCTYPE html>
                    <html>
                    <body style=""background-color: #f9f9f9; padding: 20px 0; margin: 0;"">
                        <div style=""max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #fff; padding: 30px; border-radius: 4px; border: 1px solid #eaeaea;"">
                            <h2 style=""color: #800000; text-align: center;"">ZEY CHÍC</h2>
                            <p>Kính chào <strong>{order.Customer.FullName}</strong>,</p>
                            <p>Yêu cầu hủy đơn hàng <strong>#{order.Id}</strong> của bạn đã được chấp nhận.</p>
                            <div style=""background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;"">
                                <p style=""margin: 0; color: #E65100; font-weight: bold;"">Lý do/Tin nhắn từ admin:</p>
                                <p style=""margin: 10px 0 0 0;"">{cancelReason}</p>
                            </div>
                            <p>Cảm ơn bạn đã quan tâm đến ZEY CHÍC!</p>
                        </div>
                    </body>
                    </html>
                ";

                try {
                    await _emailService.SendEmailAsync(order.Customer.Email, subject, body);
                } catch { }
            }
            return RedirectToAction("Details", new { id = orderId });
        }

        [HttpPost]
        public IActionResult EditDetail(int orderId, int detailId, int newQuantity)
        {
            var detail = _context.OrderDetails.Include(od => od.Order).Include(od => od.Product).FirstOrDefault(od => od.Id == detailId);
            if (detail != null && newQuantity > 0)
            {
                var oldQty = detail.Quantity;
                detail.Quantity = newQuantity;

                var lastMsg = _context.OrderHistories
                    .Where(h => h.OrderId == orderId && h.Action == "Gửi thông báo")
                    .OrderByDescending(h => h.Id)
                    .Select(h => h.Description)
                    .FirstOrDefault() ?? "";
                
                string originalReason = lastMsg.Replace("Đã gửi email thông báo cho khách: ", "");

                _context.Notifications.Add(new Notification
                {
                    CustomerId = detail.Order.CustomerId,
                    Title = "Cập nhật đơn hàng",
                    Message = $"Sản phẩm {detail.Product?.Name} đã được giảm số lượng từ {oldQty} xuống {newQuantity}. Lý do: {originalReason}",
                    Type = "Order",
                    RelatedId = orderId
                });

                _context.SaveChanges();
            }
            return RedirectToAction("Details", new { id = orderId });
        }

        [HttpPost]
        public IActionResult DeleteDetail(int orderId, int detailId)
        {
            var detail = _context.OrderDetails.Include(od => od.Order).Include(od => od.Product).FirstOrDefault(od => od.Id == detailId);
            if (detail != null)
            {
                var lastMsg = _context.OrderHistories
                    .Where(h => h.OrderId == orderId && h.Action == "Gửi thông báo")
                    .OrderByDescending(h => h.Id)
                    .Select(h => h.Description)
                    .FirstOrDefault() ?? "";
                
                string originalReason = lastMsg.Replace("Đã gửi email thông báo cho khách: ", "");

                _context.Notifications.Add(new Notification
                {
                    CustomerId = detail.Order.CustomerId,
                    Title = "Cập nhật đơn hàng",
                    Message = $"Sản phẩm {detail.Product?.Name} đã được loại bỏ khỏi đơn hàng. Lý do: {originalReason}",
                    Type = "Order",
                    RelatedId = orderId
                });

                _context.OrderDetails.Remove(detail);
                _context.SaveChanges();
            }
            return RedirectToAction("Details", new { id = orderId });
        }


        [HttpPost]
        public IActionResult ReportIssue([FromBody] IssueReportDto dto)
        {
            var detail = _context.OrderDetails.Include(d => d.Order).FirstOrDefault(d => d.Id == dto.DetailId);
            if (detail == null) return Json(new { success = false, message = "Không tìm thấy chi tiết đơn hàng." });

            detail.IssueStatus = "Pending";
            detail.IssueReason = dto.IssueReason;
            detail.IssueNote = dto.IssueNote;
            detail.DeliverableQuantity = dto.DeliverableQuantity;
            detail.DamagedQuantity = dto.DamagedQuantity;
            detail.MissingQuantity = dto.MissingQuantity;
            detail.ReportedDate = DateTime.Now;
            detail.ReporterName = User.Identity?.Name ?? "Admin";

            // Add history
            _context.OrderHistories.Add(new OrderHistory
            {
                OrderId = detail.OrderId,
                Action = "Phát hiện sự cố",
                Description = $"Phát hiện {dto.DamagedQuantity} sản phẩm bị hư, {dto.MissingQuantity} thiếu khi chuẩn bị hàng.",
                PerformedBy = detail.ReporterName
            });

            // Update order status to "WaitingForCustomerConfirmation" (let's say Status 5)
            detail.Order.Status = 5; 
            _context.OrderHistories.Add(new OrderHistory
            {
                OrderId = detail.OrderId,
                Action = "Đổi trạng thái",
                Description = "Đơn hàng chuyển từ Đang chuẩn bị hàng sang Chờ khách xác nhận.",
                PerformedBy = detail.ReporterName
            });

            _context.SaveChanges();
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult ResolveIssue([FromBody] IssueResolveDto dto)
        {
            var detail = _context.OrderDetails.Include(d => d.Order).FirstOrDefault(d => d.Id == dto.DetailId);
            if (detail == null) return Json(new { success = false, message = "Không tìm thấy chi tiết đơn hàng." });

            detail.IssueStatus = "Resolved";
            detail.CustomerDecision = dto.CustomerDecision;
            detail.CustomerAgreedQuantity = dto.CustomerAgreedQuantity;
            detail.CustomerContactMethod = dto.CustomerContactMethod;
            detail.CustomerFeedback = dto.CustomerFeedback;

            string performedBy = User.Identity?.Name ?? "Admin";

            _context.OrderHistories.Add(new OrderHistory
            {
                OrderId = detail.OrderId,
                Action = "Ghi nhận phương án",
                Description = $"Đã liên hệ khách hàng qua {dto.CustomerContactMethod}. Khách chọn: {dto.CustomerDecision}. Phản hồi: {dto.CustomerFeedback}",
                PerformedBy = performedBy
            });

            // Adjust order based on decision
            if (dto.CustomerDecision == "2" || dto.CustomerDecision == "1") // remove from order or accept partial
            {
                int newQty = dto.CustomerDecision == "2" ? 0 : (dto.CustomerAgreedQuantity ?? 0);
                detail.Quantity = newQty;
                _context.OrderHistories.Add(new OrderHistory
                {
                    OrderId = detail.OrderId,
                    Action = "Cập nhật sản phẩm",
                    Description = $"Sản phẩm đã được cập nhật số lượng thành {newQty}.",
                    PerformedBy = performedBy
                });
            }
            
            // Move back to preparing (1)
            detail.Order.Status = 1;
            _context.OrderHistories.Add(new OrderHistory
            {
                OrderId = detail.OrderId,
                Action = "Đổi trạng thái",
                Description = "Đơn hàng chuyển từ Chờ khách xác nhận sang Đang chuẩn bị hàng.",
                PerformedBy = performedBy
            });

            _context.SaveChanges();
            return Json(new { success = true });
        }
        // Helper method to send emails in the background
        // Thêm hàm hỗ trợ gửi email ngầm khi đổi trạng thái để không làm chậm thao tác admin
        private void SendStatusEmailInBackground(int orderId, int newStatus)
        {
            _ = System.Threading.Tasks.Task.Run(async () => {
                try {
                    using var scope = _scopeFactory.CreateScope();
                    var emailService = scope.ServiceProvider.GetRequiredService<CMS.Backend.Services.IEmailService>();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    var order = await context.Orders.Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == orderId);
                    if (order != null && order.Customer != null && !string.IsNullOrEmpty(order.Customer.Email))
                    {
                        string subject = newStatus == 1 ? $"ZEY CHÍC - Đơn hàng #{order.Id} đang được giao" : $"ZEY CHÍC - Đơn hàng #{order.Id} đã giao thành công";
                        string msg = newStatus == 1 ? "Đơn hàng của bạn đã được chúng tôi đóng gói và đang trên đường vận chuyển đến bạn." : "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã tin tưởng và mua sắm tại ZEY CHÍC!";
                        string body = $@"
                            <div style='font-family: Arial, sans-serif; padding: 20px;'>
                                <h2 style='color: #800000;'>ZEY CHÍC</h2>
                                <p>Kính chào {order.Customer.FullName},</p>
                                <p>{msg}</p>
                                <br/>
                                <p>Trân trọng,</p>
                                <p>Đội ngũ ZEY CHÍC</p>
                            </div>
                        ";
                        await emailService.SendEmailAsync(order.Customer.Email, subject, body);
                    }
                } catch {
                    // Ignore any error in background
                }
            });
        }
    }

    public class IssueReportDto
    {
        public int DetailId { get; set; }
        public int DeliverableQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public int MissingQuantity { get; set; }
        public string IssueType { get; set; }
        public string IssueReason { get; set; }
        public string IssueNote { get; set; }
    }

    public class IssueResolveDto
    {
        public int DetailId { get; set; }
        public string CustomerDecision { get; set; }
        public int? CustomerAgreedQuantity { get; set; }
        public string CustomerContactMethod { get; set; }
        public string CustomerFeedback { get; set; }
    }
}
