/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Kết nối cơ sở dữ liệu và khai báo các bảng dữ liệu bằng Entity Framework Core, 
Ngay thuc hien: 15/05/2026
*/

using CMS.Data.Entities; // Tham chiếu đến namespace chứa các định nghĩa thực thể dữ liệu (Entities)
using Microsoft.EntityFrameworkCore; // Sử dụng thư viện Entity Framework Core cho các thao tác với CSDL
using System.Collections.Generic; // Hỗ trợ làm việc với các kiểu tập hợp chung

namespace CMS.Data // Định nghĩa không gian tên chứa lớp cấu hình DbContext chính
{
    public class ApplicationDbContext : DbContext // Định nghĩa lớp ApplicationDbContext kế thừa từ DbContext của EF Core
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { } // Phương thức khởi dựng nhận cấu hình tùy chọn kết nối (Connection String) chuyển tiếp lên lớp cha

        // Khai báo các bảng dữ liệu (DbSet) tương ứng với các lớp thực thể trong database
        public DbSet<Category> Categories { get; set; } // Khai báo bảng Categories (Danh mục bài viết)
        public DbSet<Post> Posts { get; set; } // Khai báo bảng Posts (Bài viết)
        public DbSet<User> Users { get; set; } // Khai báo bảng Users (Người dùng hệ thống)
        public DbSet<CategoryProduct> CategoriesProducts { get; set; } // Khai báo bảng CategoriesProducts (Danh mục sản phẩm)
        public DbSet<Product> Products { get; set; } // Khai báo bảng Products (Sản phẩm)
        public DbSet<Customer> Customers { get; set; } // Khai báo bảng Customers (Khách hàng)
        public DbSet<Order> Orders { get; set; } // Khai báo bảng Orders (Đơn hàng)
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderHistory> OrderHistories { get; set; } // Khai báo bảng OrderDetails (Chi tiết đơn hàng)
        public DbSet<Banner> Banners { get; set; } // Khai báo bảng Banners (Quản lý Banner)
        public DbSet<Menu> Menus { get; set; } // Khai báo bảng Menus (Quản lý Menu)
        public DbSet<ProductReview> ProductReviews { get; set; } // Khai báo bảng ProductReviews (Đánh giá sản phẩm)
        public DbSet<Notification> Notifications { get; set; } // Khai báo bảng Notifications (Thông báo)
    }
}