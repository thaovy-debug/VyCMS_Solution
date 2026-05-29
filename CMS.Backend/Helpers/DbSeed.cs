/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện tự động tạo dữ liệu mẫu (Seed Data) cho các bảng sản phẩm, loại sản phẩm, khách hàng, đơn hàng và chi tiết đơn hàng nếu dữ liệu trống hoặc chứa ảnh cũ.
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các kiểu cơ bản của hệ thống .NET
using System.Linq; // Sử dụng thư viện LINQ để thực hiện các truy vấn trên tập dữ liệu
using CMS.Data; // Sử dụng đối tượng ngữ cảnh ApplicationDbContext của dự án
using CMS.Data.Entities; // Sử dụng các thực thể dữ liệu (Entities) như Product, Customer, v.v.

namespace CMS.Backend.Helpers // Định nghĩa namespace lưu trữ các trợ giúp (helpers) cho Backend
{
    public static class DbSeed // Lớp tĩnh chịu trách nhiệm gieo dữ liệu mẫu vào cơ sở dữ liệu
    {
        public static void SeedData(ApplicationDbContext context) // Hàm tĩnh thực hiện kiểm tra và gieo dữ liệu mẫu
        {
            context.Database.EnsureCreated(); // Đảm bảo cơ sở dữ liệu đã được khởi tạo thành công

            if (context.Products.Any(p => p.ImageUrl != null && p.ImageUrl.Contains("/uploads/"))) // Kiểm tra xem cơ sở dữ liệu có chứa ảnh cũ uploads hay không
            {
                context.OrderDetails.RemoveRange(context.OrderDetails); // Xóa sạch dữ liệu trong bảng Chi tiết đơn hàng (OrderDetails)
                context.Orders.RemoveRange(context.Orders); // Xóa sạch dữ liệu trong bảng Đơn hàng (Orders)
                context.Products.RemoveRange(context.Products); // Xóa sạch dữ liệu trong bảng Sản phẩm (Products)
                context.Customers.RemoveRange(context.Customers); // Xóa sạch dữ liệu trong bảng Khách hàng (Customers)
                context.CategoriesProducts.RemoveRange(context.CategoriesProducts); // Xóa sạch dữ liệu trong bảng Danh mục sản phẩm (CategoriesProducts)
                context.SaveChanges(); // Lưu tất cả các thay đổi xóa dữ liệu xuống SQL Server
            } // Kết thúc khối điều kiện xóa dữ liệu cũ

            if (!context.CategoriesProducts.Any()) // Kiểm tra nếu bảng danh mục sản phẩm đang hoàn toàn trống
            {
                context.CategoriesProducts.AddRange( // Thêm một loạt các danh mục sản phẩm mẫu mới vào DbSet
                    new CategoryProduct { Name = "Điện thoại & Máy tính bảng", Description = "Các sản phẩm điện thoại thông minh, ipad mới nhất" }, // Thêm danh mục Điện thoại
                    new CategoryProduct { Name = "Laptop & Thiết bị số", Description = "Laptop văn phòng, laptop gaming và phụ kiện máy tính" }, // Thêm danh mục Laptop
                    new CategoryProduct { Name = "Phụ kiện công nghệ", Description = "Tai nghe, cáp sạc, bàn phím cơ và chuột máy tính" } // Thêm danh mục Phụ kiện
                ); // Kết thúc hàm AddRange thêm danh mục sản phẩm
                context.SaveChanges(); // Lưu danh sách các danh mục sản phẩm mẫu mới xuống SQL Server
            } // Kết thúc khối điều kiện thêm danh mục sản phẩm

            if (!context.Products.Any()) // Kiểm tra nếu bảng sản phẩm đang hoàn toàn trống
            {
                var phoneCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Điện thoại & Máy tính bảng"); // Tìm danh mục Điện thoại trong CSDL
                var laptopCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Laptop & Thiết bị số"); // Tìm danh mục Laptop trong CSDL
                var accessoryCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Phụ kiện công nghệ"); // Tìm danh mục Phụ kiện trong CSDL

                if (phoneCat != null && laptopCat != null && accessoryCat != null) // Đảm bảo cả ba danh mục sản phẩm đều tồn tại
                {
                    context.Products.AddRange( // Thêm danh sách các sản phẩm mẫu vào DbSet Products
                        new Product { Name = "iPhone 15 Pro Max 256GB", Price = 32000000, StockQuantity = 50, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop", Description = "Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A" }, // Thêm iPhone 15
                        new Product { Name = "Samsung Galaxy S24 Ultra", Price = 28500000, StockQuantity = 40, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop", Description = "Điện thoại AI đầu tiên của Samsung chính hãng" }, // Thêm S24 Ultra
                        new Product { Name = "MacBook Air M3 13 inch", Price = 26900000, StockQuantity = 30, CategoryProductId = laptopCat.Id, ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop", Description = "Laptop Apple MacBook Air chip M3 siêu mỏng nhẹ" }, // Thêm Macbook Air
                        new Product { Name = "Laptop Asus ROG Strix G16", Price = 35900000, StockQuantity = 15, CategoryProductId = laptopCat.Id, ImageUrl = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop", Description = "Laptop chơi game cấu hình cao CPU Core i7 VGA RTX 4060" }, // Thêm Asus ROG
                        new Product { Name = "Tai nghe chụp tai Sony WH-1000XM5", Price = 6500000, StockQuantity = 25, CategoryProductId = accessoryCat.Id, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop", Description = "Tai nghe chống ồn chủ động không dây cao cấp nhất của Sony" }, // Thêm tai nghe Sony
                        new Product { Name = "iPad Pro 11 inch M4 Wi-Fi", Price = 28900000, StockQuantity = 20, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop", Description = "Máy tính bảng Apple iPad Pro M4 siêu mỏng hiệu năng cực đỉnh" } // Thêm iPad Pro
                    ); // Kết thúc hàm AddRange thêm sản phẩm mẫu
                    context.SaveChanges(); // Lưu danh sách sản phẩm mẫu mới xuống SQL Server
                } // Kết thúc khối điều kiện kiểm tra danh mục
            } // Kết thúc khối điều kiện thêm sản phẩm

            if (!context.Customers.Any()) // Kiểm tra nếu bảng khách hàng đang hoàn toàn trống
            {
                context.Customers.AddRange( // Thêm danh sách khách hàng mẫu vào DbSet Customers
                    new Customer { FullName = "Nguyễn Văn A", Email = "nguyenvana@gmail.com", Phone = "0901234567", Address = "123 Đường 3/2, Quận 10, TP.HCM", Password = "123" }, // Thêm khách hàng A
                    new Customer { FullName = "Trần Thị B", Email = "tranthib@gmail.com", Phone = "0912345678", Address = "456 Lê Lợi, Quận 1, TP.HCM", Password = "123" }, // Thêm khách hàng B
                    new Customer { FullName = "Lê Hoàng C", Email = "lehoangc@gmail.com", Phone = "0987654321", Address = "789 Nguyễn Huệ, Quận 1, TP.HCM", Password = "123" } // Thêm khách hàng C
                ); // Kết thúc hàm AddRange thêm khách hàng mẫu
                context.SaveChanges(); // Lưu danh sách khách hàng mẫu xuống SQL Server
            } // Kết thúc khối điều kiện thêm khách hàng

            if (!context.Orders.Any()) // Kiểm tra nếu bảng đơn hàng đang hoàn toàn trống
            {
                var customerA = context.Customers.FirstOrDefault(c => c.Email == "nguyenvana@gmail.com"); // Tìm khách hàng A qua email
                var customerB = context.Customers.FirstOrDefault(c => c.Email == "tranthib@gmail.com"); // Tìm khách hàng B qua email
                var productIphone = context.Products.FirstOrDefault(p => p.Name.Contains("iPhone 15")); // Tìm sản phẩm iPhone 15
                var productMacbook = context.Products.FirstOrDefault(p => p.Name.Contains("MacBook")); // Tìm sản phẩm MacBook
                var productSony = context.Products.FirstOrDefault(p => p.Name.Contains("Sony")); // Tìm sản phẩm tai nghe Sony

                if (customerA != null && customerB != null && productIphone != null && productMacbook != null && productSony != null) // Đảm bảo khách hàng và sản phẩm tồn tại
                {
                    var order1 = new Order // Tạo mới thực thể đơn hàng thứ nhất của khách hàng A
                    {
                        CustomerId = customerA.Id, // Liên kết tới mã ID khách hàng A
                        OrderDate = DateTime.Now.AddDays(-5), // Lấy thời gian đặt hàng là 5 ngày trước
                        Status = 2, // Đặt trạng thái là 2 (Đã hoàn thành)
                        Notes = "Giao hàng giờ hành chính giúp tôi" // Ghi chú đơn hàng 1
                    }; // Kết thúc khởi tạo đơn hàng 1
                    context.Orders.Add(order1); // Thêm đơn hàng 1 vào DbSet Orders
                    context.SaveChanges(); // Lưu đơn hàng 1 xuống SQL Server để phát sinh mã ID đơn hàng tự động tăng

                    context.OrderDetails.AddRange( // Thêm chi tiết đơn hàng mẫu cho đơn hàng 1
                        new OrderDetail { OrderId = order1.Id, ProductId = productIphone.Id, Quantity = 1, UnitPrice = productIphone.Price }, // Mua 1 iPhone 15
                        new OrderDetail { OrderId = order1.Id, ProductId = productSony.Id, Quantity = 2, UnitPrice = productSony.Price } // Mua 2 tai nghe Sony
                    ); // Kết thúc hàm AddRange thêm chi tiết đơn hàng 1

                    var order2 = new Order // Tạo mới thực thể đơn hàng thứ hai của khách hàng B
                    {
                        CustomerId = customerB.Id, // Liên kết tới mã ID khách hàng B
                        OrderDate = DateTime.Now.AddDays(-2), // Lấy thời gian đặt hàng là 2 ngày trước
                        Status = 0, // Đặt trạng thái là 0 (Chờ duyệt)
                        Notes = "Gọi điện trước khi giao hàng 30 phút" // Ghi chú đơn hàng 2
                    }; // Kết thúc khởi tạo đơn hàng 2
                    context.Orders.Add(order2); // Thêm đơn hàng 2 vào DbSet Orders
                    context.SaveChanges(); // Lưu đơn hàng 2 xuống SQL Server để phát sinh mã ID đơn hàng tự động tăng

                    context.OrderDetails.AddRange( // Thêm chi tiết đơn hàng mẫu cho đơn hàng 2
                        new OrderDetail { OrderId = order2.Id, ProductId = productMacbook.Id, Quantity = 1, UnitPrice = productMacbook.Price } // Mua 1 MacBook
                    ); // Kết thúc hàm AddRange thêm chi tiết đơn hàng 2

                    context.SaveChanges(); // Lưu tất cả chi tiết đơn hàng mẫu xuống SQL Server
                } // Kết thúc khối điều kiện kiểm tra tồn tại khách hàng và sản phẩm
            } // Kết thúc khối điều kiện thêm đơn hàng và chi tiết đơn hàng
        } // Kết thúc hàm SeedData
    } // Kết thúc lớp DbSeed
} // Kết thúc namespace CMS.Backend.Helpers
