/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Điều hướng trang chủ Backend, hiển thị Dashboard thống kê doanh thu, đơn hàng, sản phẩm bán chạy, khách hàng mới
Ngay thuc hien: 15/05/2026
*/

using CMS.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using CMS.Data;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
        {
            // Tổng sản phẩm
            ViewBag.TotalProducts = _context.Products.Count(p => !p.IsDeleted);

            // Tổng đơn hàng
            ViewBag.TotalOrders = _context.Orders.Count();

            // Tổng khách hàng
            ViewBag.TotalCustomers = _context.Customers.Count();

            // Tổng doanh thu (đơn đã giao - status 3)
            ViewBag.TotalRevenue = _context.Orders
                .Where(o => o.Status == 3)
                .SelectMany(o => o.OrderDetails)
                .Sum(od => (decimal?)(od.UnitPrice * od.Quantity)) ?? 0;

            // Đơn hàng theo trạng thái
            ViewBag.OrdersPending = _context.Orders.Count(o => o.Status == 0);
            ViewBag.OrdersProcessing = _context.Orders.Count(o => o.Status == 1);
            ViewBag.OrdersShipping = _context.Orders.Count(o => o.Status == 2);
            ViewBag.OrdersDelivered = _context.Orders.Count(o => o.Status == 3);
            ViewBag.OrdersCancelled = _context.Orders.Count(o => o.Status == 4 || o.Status == 7);

            // Sản phẩm bán chạy (top 5)
            ViewBag.TopProducts = _context.OrderDetails
                .Include(od => od.Product)
                .Where(od => od.Product != null && !od.Product.IsDeleted)
                .GroupBy(od => new { od.ProductId, od.Product.Name, od.Product.ImageUrl })
                .Select(g => new {
                    Name = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    TotalOrdered = g.Sum(x => x.Quantity),
                    TotalDelivered = g.Where(x => x.Order.Status == 3).Sum(x => x.Quantity)
                })
                .OrderByDescending(x => x.TotalOrdered)
                .Take(5)
                .ToList();

            // Khách hàng mới nhất (top 5)
            ViewBag.NewCustomers = _context.Customers
                .OrderByDescending(c => c.Id)
                .Take(5)
                .Select(c => new { c.FullName, c.Email, c.AvatarUrl })
                .ToList();

            // Doanh thu 12 tháng gần nhất
            var now = DateTime.Now;
            var monthlyRevenue = new List<object>();
            for (int i = 11; i >= 0; i--)
            {
                var month = now.AddMonths(-i);
                var revenue = _context.Orders
                    .Where(o => o.Status == 3 && o.OrderDate.Month == month.Month && o.OrderDate.Year == month.Year)
                    .SelectMany(o => o.OrderDetails)
                    .Sum(od => (decimal?)(od.UnitPrice * od.Quantity)) ?? 0;
                monthlyRevenue.Add(new { Label = $"T{month.Month}", Value = revenue });
            }
            ViewBag.MonthlyRevenue = monthlyRevenue;

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
