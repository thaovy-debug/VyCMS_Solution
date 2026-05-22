/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện tự động tạo dữ liệu mẫu (Seed Data) cho các bảng sản phẩm, loại sản phẩm, khách hàng, đơn hàng và chi tiết đơn hàng nếu dữ liệu trống hoặc chứa ảnh cũ.
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các kiểu cơ bản
using System.Linq; // Sử dụng LINQ để kiểm tra dữ liệu
using CMS.Data; // Sử dụng DbContext chính
using CMS.Data.Entities; // Sử dụng thực thể của hệ thống

namespace CMS.Backend.Helpers // Định nghĩa namespace lưu trữ các helper
{
    public static class DbSeed // Lớp tĩnh thực hiện gieo dữ liệu
    {
        public static void SeedData(ApplicationDbContext context) // Hàm tĩnh thực hiện Seed dữ liệu
        {
            // Đảm bảo Database đã được khởi tạo
            context.Database.EnsureCreated(); // Kiểm tra và tạo database nếu chưa có

            // Nếu phát hiện dữ liệu mẫu cũ (chứa /uploads/), thực hiện xóa để gieo lại dữ liệu mới có link ảnh online
            if (context.Products.Any(p => p.ImageUrl != null && p.ImageUrl.Contains("/uploads/")))
            {
                context.OrderDetails.RemoveRange(context.OrderDetails);
                context.Orders.RemoveRange(context.Orders);
                context.Products.RemoveRange(context.Products);
                context.Customers.RemoveRange(context.Customers);
                context.CategoriesProducts.RemoveRange(context.CategoriesProducts);
                context.SaveChanges();
            }

            // 1. Gieo dữ liệu Loại sản phẩm (CategoryProduct)
            if (!context.CategoriesProducts.Any()) // Nếu bảng loại sản phẩm trống
            {
                context.CategoriesProducts.AddRange(
                    new CategoryProduct { Name = "Điện thoại & Máy tính bảng", Description = "Các sản phẩm điện thoại thông minh, ipad mới nhất" },
                    new CategoryProduct { Name = "Laptop & Thiết bị số", Description = "Laptop văn phòng, laptop gaming và phụ kiện máy tính" },
                    new CategoryProduct { Name = "Phụ kiện công nghệ", Description = "Tai nghe, cáp sạc, bàn phím cơ và chuột máy tính" }
                );
                context.SaveChanges(); // Lưu các loại sản phẩm mới
            }

            // 2. Gieo dữ liệu Sản phẩm (Product)
            if (!context.Products.Any()) // Nếu bảng sản phẩm trống
            {
                var phoneCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Điện thoại & Máy tính bảng");
                var laptopCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Laptop & Thiết bị số");
                var accessoryCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Phụ kiện công nghệ");

                if (phoneCat != null && laptopCat != null && accessoryCat != null)
                {
                    context.Products.AddRange(
                        new Product { Name = "iPhone 15 Pro Max 256GB", Price = 32000000, StockQuantity = 50, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop", Description = "Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A" },
                        new Product { Name = "Samsung Galaxy S24 Ultra", Price = 28500000, StockQuantity = 40, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop", Description = "Điện thoại AI đầu tiên của Samsung chính hãng" },
                        new Product { Name = "MacBook Air M3 13 inch", Price = 26900000, StockQuantity = 30, CategoryProductId = laptopCat.Id, ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop", Description = "Laptop Apple MacBook Air chip M3 siêu mỏng nhẹ" },
                        new Product { Name = "Laptop Asus ROG Strix G16", Price = 35900000, StockQuantity = 15, CategoryProductId = laptopCat.Id, ImageUrl = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop", Description = "Laptop chơi game cấu hình cao CPU Core i7 VGA RTX 4060" },
                        new Product { Name = "Tai nghe chụp tai Sony WH-1000XM5", Price = 6500000, StockQuantity = 25, CategoryProductId = accessoryCat.Id, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop", Description = "Tai nghe chống ồn chủ động không dây cao cấp nhất của Sony" },
                        new Product { Name = "iPad Pro 11 inch M4 Wi-Fi", Price = 28900000, StockQuantity = 20, CategoryProductId = phoneCat.Id, ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop", Description = "Máy tính bảng Apple iPad Pro M4 siêu mỏng hiệu năng cực đỉnh" }
                    );
                    context.SaveChanges(); // Lưu các sản phẩm mới
                }
            }

            // 3. Gieo dữ liệu Khách hàng (Customer)
            if (!context.Customers.Any()) // Nếu bảng khách hàng trống
            {
                context.Customers.AddRange(
                    new Customer { FullName = "Nguyễn Văn A", Email = "nguyenvana@gmail.com", Phone = "0901234567", Address = "123 Đường 3/2, Quận 10, TP.HCM", Password = "123" },
                    new Customer { FullName = "Trần Thị B", Email = "tranthib@gmail.com", Phone = "0912345678", Address = "456 Lê Lợi, Quận 1, TP.HCM", Password = "123" },
                    new Customer { FullName = "Lê Hoàng C", Email = "lehoangc@gmail.com", Phone = "0987654321", Address = "789 Nguyễn Huệ, Quận 1, TP.HCM", Password = "123" }
                );
                context.SaveChanges(); // Lưu danh sách khách hàng mới
            }

            // 4. Gieo dữ liệu Đơn hàng (Order) và Chi tiết đơn hàng (OrderDetail)
            if (!context.Orders.Any()) // Nếu bảng đơn hàng trống
            {
                var customerA = context.Customers.FirstOrDefault(c => c.Email == "nguyenvana@gmail.com");
                var customerB = context.Customers.FirstOrDefault(c => c.Email == "tranthib@gmail.com");
                var productIphone = context.Products.FirstOrDefault(p => p.Name.Contains("iPhone 15"));
                var productMacbook = context.Products.FirstOrDefault(p => p.Name.Contains("MacBook"));
                var productSony = context.Products.FirstOrDefault(p => p.Name.Contains("Sony"));

                if (customerA != null && customerB != null && productIphone != null && productMacbook != null && productSony != null)
                {
                    // Đơn hàng thứ nhất của khách hàng A
                    var order1 = new Order
                    {
                        CustomerId = customerA.Id,
                        OrderDate = DateTime.Now.AddDays(-5),
                        Status = 2, // Đã hoàn thành (Đã xong)
                        Notes = "Giao hàng giờ hành chính giúp tôi"
                    };
                    context.Orders.Add(order1);
                    context.SaveChanges(); // Lưu đơn hàng 1 để lấy ID tự tăng

                    context.OrderDetails.AddRange(
                        new OrderDetail { OrderId = order1.Id, ProductId = productIphone.Id, Quantity = 1, UnitPrice = productIphone.Price },
                        new OrderDetail { OrderId = order1.Id, ProductId = productSony.Id, Quantity = 2, UnitPrice = productSony.Price }
                    );

                    // Đơn hàng thứ hai của khách hàng B
                    var order2 = new Order
                    {
                        CustomerId = customerB.Id,
                        OrderDate = DateTime.Now.AddDays(-2),
                        Status = 0, // Chờ duyệt
                        Notes = "Gọi điện trước khi giao hàng 30 phút"
                    };
                    context.Orders.Add(order2);
                    context.SaveChanges(); // Lưu đơn hàng 2 để lấy ID tự tăng

                    context.OrderDetails.AddRange(
                        new OrderDetail { OrderId = order2.Id, ProductId = productMacbook.Id, Quantity = 1, UnitPrice = productMacbook.Price }
                    );

                    context.SaveChanges(); // Lưu chi tiết các đơn hàng
                }
            }
        }
    }
}
