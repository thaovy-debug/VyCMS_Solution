using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách thông báo của 1 user
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetNotifications(int customerId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.CustomerId == customerId)
                .OrderByDescending(n => n.CreatedDate)
                .ToListAsync();

            return Ok(notifications);
        }

        // Đánh dấu đã đọc
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }
        
        // Đánh dấu tất cả đã đọc
        [HttpPut("customer/{customerId}/readAll")]
        public async Task<IActionResult> MarkAllAsRead(int customerId)
        {
            var unread = await _context.Notifications
                .Where(n => n.CustomerId == customerId && !n.IsRead)
                .ToListAsync();
                
            foreach(var n in unread)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
