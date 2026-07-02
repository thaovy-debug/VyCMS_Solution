using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ReviewsApiController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // Lấy danh sách đánh giá của 1 sản phẩm
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _context.ProductReviews
                .Include(r => r.Customer)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    r.Id,
                    r.ProductId,
                    r.CustomerId,
                    CustomerName = r.Customer.FullName,
                    CustomerAvatar = r.Customer.AvatarUrl,
                    r.Rating,
                    r.Comment,
                    r.ImageUrl,
                    r.CreatedDate,
                    r.AdminReply,
                    r.ReplyDate,
                    Variant = _context.OrderDetails
                        .Where(od => od.OrderId == r.OrderId && od.ProductId == r.ProductId)
                        .Select(od => new { od.Size, od.Color })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // Lấy danh sách đánh giá thuộc về 1 đơn hàng (để giao diện biết sản phẩm nào đã đánh giá)
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetOrderReviews(int orderId)
        {
            var reviews = await _context.ProductReviews
                .Where(r => r.OrderId == orderId)
                .ToListAsync();

            return Ok(reviews);
        }

        // Thêm đánh giá mới (Hỗ trợ upload ảnh bằng FormData)
        [HttpPost]
        public async Task<IActionResult> AddReview([FromForm] ReviewInputModel model)
        {
            if (model.ProductId <= 0 || model.CustomerId <= 0 || model.OrderId <= 0 || model.Rating < 1 || model.Rating > 5)
            {
                return BadRequest("Dữ liệu đánh giá không hợp lệ");
            }

            // Kiểm tra xem đã đánh giá chưa (1 sản phẩm trong 1 đơn hàng chỉ đánh giá 1 lần)
            var existingReview = await _context.ProductReviews
                .FirstOrDefaultAsync(r => r.OrderId == model.OrderId && r.ProductId == model.ProductId);

            if (existingReview != null)
            {
                return BadRequest("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.");
            }

            string imageUrl = null;

            // Xử lý upload ảnh nếu có
            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(model.ImageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImageFile.CopyToAsync(fileStream);
                }

                imageUrl = "/uploads/" + uniqueFileName;
            }

            var review = new ProductReview
            {
                ProductId = model.ProductId,
                CustomerId = model.CustomerId,
                OrderId = model.OrderId,
                Rating = model.Rating,
                Comment = model.Comment,
                ImageUrl = imageUrl,
                CreatedDate = DateTime.Now
            };

            _context.ProductReviews.Add(review);

            // Add notification for admin
            _context.Notifications.Add(new Notification
            {
                CustomerId = 0, // Admin notification
                Title = "Đánh giá sản phẩm mới",
                Message = $"Sản phẩm ID {model.ProductId} vừa nhận được đánh giá {model.Rating} sao từ khách hàng.",
                Type = "NewReview",
                RelatedId = model.ProductId
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đánh giá thành công!", review });
        }
    }

    public class ReviewInputModel
    {
        public int ProductId { get; set; }
        public int CustomerId { get; set; }
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
