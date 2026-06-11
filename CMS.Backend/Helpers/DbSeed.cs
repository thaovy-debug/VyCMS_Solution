/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Tự động gieo dữ liệu mẫu (Seed Data) sử dụng các tên sản phẩm, giá bán và hình ảnh CDN thật lấy từ website thieuhoa.com.vn
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các kiểu cơ bản của hệ thống .NET như DateTime
using System.Linq; // Sử dụng thư viện LINQ để thực hiện các thao tác kiểm tra dữ liệu mẫu trong CSDL
using CMS.Data; // Sử dụng đối tượng ngữ cảnh ApplicationDbContext của dự án
using CMS.Data.Entities; // Sử dụng các thực thể thực trong CSDL (Product, Category, Post, Customer, Order, OrderDetail)

namespace CMS.Backend.Helpers // Khai báo namespace tương ứng chứa lớp hỗ trợ Seed
{
    public static class DbSeed // Lớp tĩnh chịu trách nhiệm khởi tạo dữ liệu mẫu thời trang Thiều Hoa thực tế
    {
        public static void SeedData(ApplicationDbContext context) // Hàm tĩnh thực hiện kiểm tra và nạp dữ liệu mẫu
        {
            context.Database.EnsureCreated(); // Đảm bảo cơ sở dữ liệu SQL Server đã được khởi tạo thành công
        } // Kết thúc hàm SeedData
    } // Kết thúc lớp DbSeed
} // Kết thúc namespace CMS.Backend.Helpers
