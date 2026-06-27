/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa các API endpoint POST để tạo đơn đặt hàng từ giỏ hàng gửi lên, và tra cứu lịch sử
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CMS.Backend.Services.IEmailService _emailService;

        public OrdersController(ApplicationDbContext context, CMS.Backend.Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderInputDTO input)
        {
            if (input == null || input.CartItems == null || !input.CartItems.Any())
            {
                return BadRequest(new { message = "Dữ liệu đơn hàng hoặc giỏ hàng không hợp lệ" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Lắp ráp địa chỉ, sđt vào Notes vì DB không có cột riêng
                var fullNotes = $"Giao đến: {input.ShippingAddress} | ĐT: {input.Phone}";
                if (!string.IsNullOrEmpty(input.Notes))
                {
                    fullNotes += $" | Ghi chú: {input.Notes}";
                }

                // 1. Tạo bản ghi đơn hàng
                var newOrder = new Order
                {
                    OrderDate = DateTime.Now,
                    CustomerId = input.CustomerId,
                    Status = 0,
                    Notes = fullNotes
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                string productRowsHtml = "";
                decimal totalPrice = 0;

                // 2. Chạy vòng lặp qua danh sách giỏ hàng
                foreach (var item in input.CartItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm với ID {item.ProductId} không tồn tại" });
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ số lượng trong kho" });
                    }

                    var orderDetail = new OrderDetail
                    {
                        OrderId = newOrder.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price, // Đề bài yêu cầu lấy đúng giá Price
                        Size = item.Size, // Lưu lại size khách chọn
                        Color = item.Color // Lưu lại màu sắc khách chọn
                    };

                    _context.OrderDetails.Add(orderDetail);

                    // 3. Khấu trừ số lượng tồn kho
                    product.StockQuantity -= item.Quantity;

                    // Cập nhật VariantStocks
                    if (!string.IsNullOrEmpty(product.VariantStocks))
                    {
                        try
                        {
                            var variantStocks = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, int>>(product.VariantStocks);
                            string key = $"{item.Color ?? ""}-{item.Size ?? ""}";
                            
                            if (variantStocks != null && variantStocks.ContainsKey(key))
                            {
                                variantStocks[key] -= item.Quantity;
                                if (variantStocks[key] < 0) variantStocks[key] = 0;
                                product.VariantStocks = System.Text.Json.JsonSerializer.Serialize(variantStocks);
                            }
                        }
                        catch
                        {
                            // ignore json parse errors
                        }
                    }

                    // 4. Tạo HTML cho email
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
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee;'>{product.Name}{variantText}</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: center;'>{item.Quantity}</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: right;'>{product.Price:N0} đ</td>
                            <td style='padding: 10px 0; border-bottom: 1px dashed #eee; text-align: right;'>{(product.Price * item.Quantity):N0} đ</td>
                        </tr>
                    ";
                    totalPrice += product.Price * item.Quantity;
                }

                var notification = new Notification
                {
                    CustomerId = input.CustomerId,
                    Title = "Đặt hàng thành công",
                    Message = $"Đơn hàng #{newOrder.Id} của bạn đã được đặt thành công và đang chờ xử lý.",
                    Type = "Order",
                    RelatedId = newOrder.Id
                };
                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Gửi email xác nhận
                var customer = await _context.Customers.FindAsync(input.CustomerId);
                if (customer != null && !string.IsNullOrEmpty(customer.Email))
                {
                    string subject = $"ZEY CHÍC - Xác nhận đơn hàng #{newOrder.Id}";
                    string body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset=""UTF-8"">
                            <title>Xác nhận đơn hàng</title>
                        </head>
                        <body style=""background-color: #f9f9f9; padding: 20px 0; margin: 0;"">
                            <div style=""max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #fff; padding: 30px; border-radius: 4px; border: 1px solid #eaeaea;"">
                                <div style=""text-align: center; margin-bottom: 20px;"">
                                    <h2 style=""color: #800000; margin: 0; font-size: 24px;"">ZEY CHÍC</h2>
                                    <p style=""color: #888; font-size: 13px; margin-top: 5px;"">Cảm ơn bạn đã đặt hàng tại ZEY CHÍC!</p>
                                </div>
                                <div style=""border-bottom: 2px solid #800000; margin-bottom: 20px;""></div>

                                <p style=""font-size: 14px; color: #333;"">Kính chào <strong>{customer.FullName}</strong>,</p>
                                <p style=""font-size: 14px; color: #333;"">Yêu cầu đặt hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
                                
                                <h3 style=""font-size: 16px; margin-top: 25px; margin-bottom: 15px; color: #333;"">Thông tin đơn hàng #{newOrder.Id}</h3>
                                <div style=""border-bottom: 1px solid #eee; margin-bottom: 15px;""></div>
                                
                                <p style=""font-size: 13px; color: #555; margin: 5px 0;""><strong>Ngày đặt:</strong> {newOrder.OrderDate:dd/MM/yyyy HH:mm}</p>
                                <p style=""font-size: 13px; color: #555; margin: 5px 0;""><strong>Người nhận:</strong> {customer.FullName} - <strong>SĐT:</strong> {input.Phone ?? customer.Phone}</p>
                                <p style=""font-size: 13px; color: #555; margin: 5px 0;""><strong>Địa chỉ giao hàng:</strong> {input.ShippingAddress ?? customer.Address ?? ""}</p>
                                {(string.IsNullOrEmpty(input.Notes) ? "" : $"<p style='font-size: 13px; color: #555; margin: 5px 0;'><strong>Ghi chú:</strong> {input.Notes}</p>")}
                                
                                <h3 style=""font-size: 16px; margin-top: 25px; margin-bottom: 15px; color: #333;"">Chi tiết sản phẩm</h3>
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

                                <div style=""text-align: center; margin-top: 40px;"">
                                    <p style=""font-size: 12px; color: #888;"">Cảm ơn bạn đã tin tưởng và lựa chọn ZEY CHÍC.</p>
                                    <p style=""font-size: 11px; color: #aaa;"">&copy; {DateTime.Now.Year} ZEY CHÍC. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ";
                    try {
                        await _emailService.SendEmailAsync(customer.Email, subject, body);
                    } catch {
                        // Log lỗi gửi mail nhưng không làm lỗi đơn hàng
                    }
                }

                return StatusCode(201, new {
                    message = "Đặt hàng thành công!",
                    orderId = newOrder.Id
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi xử lý tạo đơn hàng ngầm", detail = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerOrders(int customerId)
        {
            var orders = await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new {
                    o.Id,
                    o.OrderDate,
                    o.Status,
                    o.Notes,
                    TotalAmount = o.OrderDetails.Sum(od => od.Quantity * od.UnitPrice),
                    Details = o.OrderDetails.Select(od => new {
                        od.ProductId,
                        ProductName = od.Product.Name,
                        ImageUrl = od.Product.ImageUrl,
                        od.Quantity,
                        od.UnitPrice,
                        od.Size,
                        od.Color
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("CustomerResponse")]
        public async Task<IActionResult> CustomerResponse(int orderId, string action)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return Content("<h2>Không tìm thấy đơn hàng.</h2>", "text/html; charset=utf-8");
            }

            if (action == "accept")
            {
                order.Status = 6; // Khách hàng chấp nhận sửa đơn
                _context.OrderHistories.Add(new OrderHistory
                {
                    OrderId = order.Id,
                    Action = "Khách phản hồi",
                    Description = "Khách hàng đã chấp nhận yêu cầu (đồng ý sửa đơn).",
                    PerformedBy = "Customer"
                });
                await _context.SaveChangesAsync();
                return Content(@"
                    <div style='text-align:center; padding: 50px; font-family: Arial, sans-serif;'>
                        <h2 style='color: #4CAF50;'>Cảm ơn bạn!</h2>
                        <p>Bạn đã đồng ý với yêu cầu từ cửa hàng.</p>
                        <p>Chúng tôi sẽ sớm cập nhật lại đơn hàng của bạn.</p>
                        <a href='http://localhost:5173/profile' style='display:inline-block; margin-top:20px; padding: 10px 20px; background: #800000; color: #fff; text-decoration: none; border-radius: 4px;'>Quay lại trang cá nhân</a>
                    </div>
                ", "text/html; charset=utf-8");
            }
            else if (action == "cancel")
            {
                order.Status = 7; // Khách hàng yêu cầu hủy đơn
                _context.OrderHistories.Add(new OrderHistory
                {
                    OrderId = order.Id,
                    Action = "Khách phản hồi",
                    Description = "Khách hàng đã yêu cầu hủy đơn.",
                    PerformedBy = "Customer"
                });
                await _context.SaveChangesAsync();
                return Content(@"
                    <div style='text-align:center; padding: 50px; font-family: Arial, sans-serif;'>
                        <h2 style='color: #F44336;'>Yêu cầu đã được gửi</h2>
                        <p>Yêu cầu hủy đơn hàng của bạn đã được gửi đến bộ phận quản lý.</p>
                        <p>Chúng tôi sẽ xác nhận và gửi email thông báo lại cho bạn.</p>
                        <a href='http://localhost:5173/profile' style='display:inline-block; margin-top:20px; padding: 10px 20px; background: #800000; color: #fff; text-decoration: none; border-radius: 4px;'>Quay lại trang cá nhân</a>
                    </div>
                ", "text/html; charset=utf-8");
            }

            return BadRequest("Thao tác không hợp lệ.");
        }
    }

    public class OrderInputDTO
    {
        public int CustomerId { get; set; }
        public string? ShippingAddress { get; set; }
        public string? Phone { get; set; }
        public string? Notes { get; set; }
        public List<CartItemDTO> CartItems { get; set; } = new List<CartItemDTO>();
    }

    public class CartItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Size { get; set; } // Thêm trường Size
        public string? Color { get; set; } // Thêm trường Color
    }
}
