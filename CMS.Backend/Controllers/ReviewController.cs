using System;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class ReviewController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Lấy danh sách sản phẩm và kèm theo số lượng đánh giá của từng sản phẩm
            var products = await _context.Products
                .Include(p => p.ProductReviews)
                .OrderByDescending(p => p.ProductReviews.Count)
                .ToListAsync();

            return View(products);
        }

        public async Task<IActionResult> Details(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductReviews)
                .ThenInclude(r => r.Customer)
                .Include(p => p.ProductReviews)
                .ThenInclude(r => r.Order)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            return View(product);
        }

        [HttpPost]
        public async Task<IActionResult> Reply(int reviewId, string replyMessage)
        {
            var review = await _context.ProductReviews
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == reviewId);
                
            if (review != null && !string.IsNullOrEmpty(replyMessage))
            {
                review.AdminReply = replyMessage;
                review.ReplyDate = DateTime.Now;

                // Gửi thông báo đến chuông của khách hàng
                _context.Notifications.Add(new Notification
                {
                    CustomerId = review.CustomerId,
                    Title = "Phản hồi đánh giá sản phẩm",
                    Message = $"Quản trị viên đã phản hồi đánh giá của bạn cho sản phẩm {review.Product?.Name}: \"{replyMessage}\"",
                    Type = "Review",
                    RelatedId = review.ProductId
                });

                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Details", new { id = review.ProductId });
        }
    }
}
