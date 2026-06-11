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
                // 1. Tạo bản ghi đơn hàng
                var newOrder = new Order
                {
                    OrderDate = DateTime.Now,
                    CustomerId = input.CustomerId,
                    Status = 0,
                    Notes = input.Notes
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

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
                        Size = item.Size // Lưu lại size khách chọn
                    };

                    _context.OrderDetails.Add(orderDetail);

                    // 3. Khấu trừ số lượng tồn kho
                    product.StockQuantity -= item.Quantity;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Gửi email xác nhận
                var customer = await _context.Customers.FindAsync(input.CustomerId);
                if (customer != null && !string.IsNullOrEmpty(customer.Email))
                {
                    string subject = $"Xác nhận đơn hàng #{newOrder.Id} từ ZEY CHÍC";
                    string body = $@"
                        <h3>Cảm ơn {customer.FullName} đã đặt hàng tại ZEY CHÍC!</h3>
                        <p>Đơn hàng <strong>#{newOrder.Id}</strong> của bạn đã được hệ thống ghi nhận thành công.</p>
                        <p>Chúng tôi sẽ sớm liên hệ để giao hàng.</p>
                        <p>Trân trọng,<br/>Đội ngũ ZEY CHÍC</p>
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
                        od.Quantity,
                        od.UnitPrice,
                        od.Size
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }
    }

    public class OrderInputDTO
    {
        public int CustomerId { get; set; }
        public string? Notes { get; set; }
        public List<CartItemDTO> CartItems { get; set; } = new List<CartItemDTO>();
    }

    public class CartItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Size { get; set; } // Thêm trường Size
    }
}
