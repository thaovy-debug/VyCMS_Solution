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

            // Kiểm tra xem CSDL có đang chứa sản phẩm công nghệ cũ (iPhone) hoặc sản phẩm Unsplash cũ cần cập nhật hoặc thiếu danh mục Khăn Choàng Cổ hay không
            if (context.Products.Any(p => p.Name.Contains("iPhone") || p.Name.Contains("Đầm Dạ Hội Phối Ren Quý Phái") || (p.ImageUrl != null && p.ImageUrl.Contains("/uploads/") && !p.ImageUrl.Contains("thieuhoa.com.vn"))) || !context.CategoriesProducts.Any(c => c.Name == "Khăn Choàng Cổ")) 
            {
                // Thực hiện xóa sạch các bảng cũ theo thứ tự ràng buộc khóa ngoại để nạp dữ liệu mới
                context.OrderDetails.RemoveRange(context.OrderDetails); // Xóa chi tiết đơn hàng cũ trước
                context.Orders.RemoveRange(context.Orders); // Xóa đơn hàng cũ tiếp theo
                context.Products.RemoveRange(context.Products); // Xóa sản phẩm cũ tiếp theo
                context.Customers.RemoveRange(context.Customers); // Xóa khách hàng cũ tiếp theo
                context.CategoriesProducts.RemoveRange(context.CategoriesProducts); // Xóa danh mục sản phẩm cũ
                context.Posts.RemoveRange(context.Posts); // Xóa bài viết cũ tiếp theo
                context.Categories.RemoveRange(context.Categories); // Xóa danh mục bài viết cũ
                context.SaveChanges(); // Lưu thay đổi xóa xuống SQL Server
            } // Kết thúc khối xóa dữ liệu cũ

            // 1. GIEO DỮ LIỆU DANH MỤC SẢN PHẨM THỰC TẾ CỦA THIỀU HOA (CategoriesProducts)
            if (!context.CategoriesProducts.Any()) // Kiểm tra nếu bảng danh mục sản phẩm đang trống
            {
                context.CategoriesProducts.AddRange( // Thêm các danh mục sản phẩm chuẩn của Thiều Hoa
                    new CategoryProduct { Name = "Đầm Trung Niên", Description = "Các mẫu đầm dự tiệc dáng xòe, đầm dáng suông lụa satin che khuyết điểm sang trọng" }, // Danh mục 1: Đầm trung niên
                    new CategoryProduct { Name = "Áo Kiểu Trung Niên", Description = "Áo sơ mi voan tơ thêu tay tinh tế, áo kiểu mặc đi làm lịch sự quý phái" }, // Danh mục 2: Áo kiểu trung niên
                    new CategoryProduct { Name = "Đồ Bộ Nữ", Description = "Các bộ quần áo gấm dệt hoa, bộ linen tơ xước mặc nhà thanh nhã thoáng mát" }, // Danh mục 3: Đồ bộ nữ
                    new CategoryProduct { Name = "Túi Xách & Phụ Kiện", Description = "Túi đeo vai da thật, túi hobo nhún miệng cao cấp mang thương hiệu Camie" }, // Danh mục 4: Túi xách
                    new CategoryProduct { Name = "Khăn Choàng Cổ", Description = "Khăn choàng cổ lụa tơ tằm cao cấp, khăn len mỏng phụ kiện giữ ấm và làm điểm nhấn quý phái" } // Danh mục 5: Khăn choàng cổ (chưa gieo sản phẩm mẫu)
                ); // Kết thúc hàm thêm danh mục
                context.SaveChanges(); // Lưu danh sách danh mục xuống SQL Server
            } // Kết thúc khối điều kiện thêm danh mục


            // 2. GIEO DỮ LIỆU SẢN PHẨM THỰC TẾ LẤY ẢNH GỐC TỪ THIỀU HOA (Products)
            if (!context.Products.Any()) // Kiểm tra nếu bảng sản phẩm đang trống hoàn toàn
            {
                // Truy vấn các danh mục sản phẩm vừa tạo từ cơ sở dữ liệu
                var damCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Đầm Trung Niên"); // Lấy ID danh mục Đầm
                var aoCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Áo Kiểu Trung Niên"); // Lấy ID danh mục Áo kiểu
                var boCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Đồ Bộ Nữ"); // Lấy ID danh mục Đồ bộ
                var tuiCat = context.CategoriesProducts.FirstOrDefault(c => c.Name == "Túi Xách & Phụ Kiện"); // Lấy ID danh mục Túi xách

                if (damCat != null && aoCat != null && boCat != null && tuiCat != null) // Đảm bảo cả bốn danh mục đều tồn tại
                {
                    context.Products.AddRange( // Thêm danh sách sản phẩm mẫu lấy từ website thieuhoa.com.vn vào DbSet Products
                        // Nhóm sản phẩm: Đầm Trung Niên
                        new Product 
                        { 
                            Name = "Đầm Dạ Hội Thiết Kế Peplum Phối Dập Ly", 
                            Price = 1380000, 
                            StockQuantity = 45, 
                            DiscountPercent = 20, // Giảm giá 20%
                            CategoryProductId = damCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp", 
                            Description = "Mẫu đầm dạ hội thiết kế peplum phối dập ly sang trọng, chất liệu crepe cao cấp mềm mại co giãn tốt, tôn lên vóc dáng quý phái của các quý cô." 
                        }, // Đầm peplum dập ly
                        new Product 
                        { 
                            Name = "Đầm Dự Tiệc Vai Dệt Cao Cấp Thêu Hoa Tinh Xảo", 
                            Price = 1450000, 
                            StockQuantity = 35, 
                            CategoryProductId = damCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/dam-du-tiec-trung-nien-vai-det-cao-cap-theu-hoa-tinh-xao-dd5x0616-5.webp", 
                            Description = "Đầm dự tiệc chất liệu vải dệt cao cấp thêu hoa tinh xảo nổi bật, phom dáng xòe che khuyết điểm hoàn hảo, sản phẩm độc quyền từ Thiều Hoa." 
                        }, // Đầm vai dệt thêu hoa
                        new Product 
                        { 
                            Name = "Đầm Dự Tiệc Cotton Lạnh Phối Hoa Thủ Công", 
                            Price = 980000, 
                            StockQuantity = 50, 
                            DiscountPercent = 30, // Giảm giá 30%
                            CategoryProductId = damCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/04/dam-trung-nien-du-tiec-cotton-lanh-phoi-hoa-thu-cong-sang-trong-dd5x0908-thuong-hieu-thieu-hoa-5.webp", 
                            Description = "Thiết kế đầm trung niên cotton lạnh mát mịn phối bông hoa cài ngực làm tay tỉ mỉ, thích hợp đi tiệc nhẹ hoặc dạo phố." 
                        }, // Đầm cotton lạnh phối hoa

                        // Nhóm sản phẩm: Áo Kiểu Trung Niên
                        new Product 
                        { 
                            Name = "Áo Kiểu Peplum Crepe Lụa Độc Quyền", 
                            Price = 490000, 
                            StockQuantity = 65, 
                            DiscountPercent = 15, // Giảm giá 15%
                            CategoryProductId = aoCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/05/ao-kieu-peplum-an5x1027-4.webp", 
                            Description = "Áo kiểu dáng peplum thắt nhẹ vòng eo che bụng tốt, chất liệu crepe lụa cao cấp mềm mát tôn da dáng quý phái." 
                        }, // Áo peplum lụa
                        new Product 
                        { 
                            Name = "Áo Kiểu Voan Tơ Hoa Nổi Cổ Tròn", 
                            Price = 390000, 
                            StockQuantity = 80, 
                            CategoryProductId = aoCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/imagecache/thumbnail-category/wp-content/uploads/2026/05/ao-kieu-voan-to-mem-an5x1010-thumb.webp", 
                            Description = "Áo kiểu chất liệu voan tơ thướt tha họa tiết hoa nổi dập tinh tế, có lót thun lụa cotton bên trong mát mịn." 
                        }, // Áo voan tơ hoa nổi

                        // Nhóm sản phẩm: Đồ Bộ Nữ
                        new Product 
                        { 
                            Name = "Đồ Bộ Trung Niên Gấm Hoa Sang Trọng", 
                            Price = 690000, 
                            StockQuantity = 40, 
                            CategoryProductId = boCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/do-bo-trung-nien-gam-hoa-cao-cap-sang-trong-thanh-lich-quy-phai-db5x0613-3.webp", 
                            Description = "Bộ quần áo gấm dệt hoa văn nổi cổ điển sang trọng, chất gấm mềm co giãn nhẹ, phù hợp mặc đi chơi hay mặc ở nhà tiếp khách lịch sự." 
                        }, // Bộ đồ gấm hoa
                        new Product 
                        { 
                            Name = "Đồ Bộ Linen Tơ Xước Cổ Điển Nhã Nhặn", 
                            Price = 590000, 
                            StockQuantity = 55, 
                            CategoryProductId = boCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2025/11/do-bo-trung-nien-to-xuoc-cao-cap-don-gian-thanh-thoat-db5x0629-thuong-hieu-thieu-hoa-8.webp", 
                            Description = "Chất liệu linen tơ xước cực kỳ thoáng mát, thêu họa tiết mộc mạc thanh nhã tôn lên nét đẹp đằm thắm tuổi trung niên." 
                        }, // Bộ đồ linen tơ xước

                        // Nhóm sản phẩm: Túi Xách & Phụ Kiện
                        new Product 
                        { 
                            Name = "Túi Xách Cổ Điển Da Thật Cỡ Lớn", 
                            Price = 850000, 
                            StockQuantity = 20, 
                            CategoryProductId = tuiCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/tui-xach-nu-co-dien-da-lon-sang-trong-tx5a0809-la-camie-3.webp", 
                            Description = "Dòng túi xách cao cấp thương hiệu La Camie làm từ chất liệu da bò thật mềm mịn, thiết kế khoang chứa rộng rãi đựng ipad, ví tiền thoải mái." 
                        }, // Túi da thật cổ điển
                        new Product 
                        { 
                            Name = "Túi Xách Da Kẹp Nách Sang Trọng Sành Điệu", 
                            Price = 650000, 
                            StockQuantity = 30, 
                            DiscountPercent = 25, // Giảm giá 25%
                            CategoryProductId = tuiCat.Id, 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/tui-xach-nu-da-cao-cap-kep-nach-sanh-dieu-tx5a0813-thuong-hieu-la-camie-1.webp", 
                            Description = "Túi đeo vai kẹp nách thời trang, khóa kéo mạ vàng 18k signature sáng loáng, tôn thêm nét sành điệu cho quý cô." 
                        } // Túi kẹp nách Camie
                    ); // Kết thúc hàm AddRange thêm sản phẩm
                    context.SaveChanges(); // Lưu tất cả sản phẩm thời trang thật xuống SQL Server
                } // Kết thúc khối điều kiện kiểm tra danh mục
            } // Kết thúc khối điều kiện thêm sản phẩm

            // 3. GIEO DỮ LIỆU DANH MỤC BÀI VIẾT TIN TỨC THỜI TRANG (Categories)
            if (!context.Categories.Any()) // Kiểm tra nếu bảng danh mục bài viết đang trống
            {
                context.Categories.AddRange( // Thêm các danh mục bài viết thời trang mới của Thiều Hoa vào DbSet
                    new Category { Name = "Xu Hướng Thời Trang", Description = "Tổng hợp các phong cách thiết kế đầm, áo trung niên thịnh hành nhất" }, // Danh mục Xu hướng
                    new Category { Name = "Bí Quyết Mặc Đẹp", Description = "Mẹo phối đồ, cách chọn đầm che khuyết điểm giúp quý cô luôn tự tin" } // Danh mục Bí quyết
                ); // Kết thúc hàm AddRange thêm danh mục bài viết
                context.SaveChanges(); // Lưu danh mục bài viết mới xuống SQL Server
            } // Kết thúc khối điều kiện thêm danh mục bài viết

            // 4. GIEO DỮ LIỆU BÀI VIẾT BLOG XU HƯỚNG LÀM ĐẸP (Posts)
            if (!context.Posts.Any()) // Kiểm tra nếu bảng bài viết đang trống
            {
                // Lấy các danh mục bài viết vừa tạo từ cơ sở dữ liệu
                var xuHuongCat = context.Categories.FirstOrDefault(c => c.Name == "Xu Hướng Thời Trang"); // Lấy danh mục Xu hướng
                var biQuyetCat = context.Categories.FirstOrDefault(c => c.Name == "Bí Quyết Mặc Đẹp"); // Lấy danh mục Bí quyết

                if (xuHuongCat != null && biQuyetCat != null) // Đảm bảo cả hai danh mục bài viết đều tồn tại
                {
                    context.Posts.AddRange( // Thêm danh sách bài viết thời trang mẫu vào DbSet Posts
                        new Post 
                        { 
                            Title = "Xu hướng đầm dạ hội peplum phối dập ly Hè Thu 2026", 
                            Content = "Mùa Hè Thu 2026, các thiết kế đầm dạ hội dáng peplum phối dập ly đang làm mưa làm gió trên sàn diễn thời trang trung niên. Sự kết hợp giữa chất liệu crepe cao cấp co giãn tốt với đường cắt may tinh tế giúp tôn vóc dáng quý phái, che khuyết điểm vòng eo hiệu quả. Các gam màu chủ đạo như đỏ đô, xanh navy và be vàng kem đang được các quý cô ưa chuộng nhất.", 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp", 
                            CreatedDate = DateTime.Now.AddDays(-7), 
                            CategoryId = xuHuongCat.Id 
                        }, // Bài viết xu hướng 1
                        new Post 
                        { 
                            Title = "Tông màu nâu đỏ trầm và vàng kem thống trị thời trang trung niên", 
                            Content = "Trong bảng màu thời trang trung niên mùa này, nâu đỏ trầm (burgundy) kết hợp với vàng kem sữa tạo nên sự hài hòa thanh lịch. Các quý cô có thể phối áo kiểu voan tơ màu kem cùng chân váy hoặc quần ống suông màu nâu đỏ, kết hợp túi xách da La Camie và khăn choàng cổ lụa tơ tằm để hoàn thiện set đồ sang trọng.", 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/dam-du-tiec-trung-nien-vai-det-cao-cap-theu-hoa-tinh-xao-dd5x0616-5.webp", 
                            CreatedDate = DateTime.Now.AddDays(-4), 
                            CategoryId = xuHuongCat.Id 
                        }, // Bài viết xu hướng 2
                        new Post 
                        { 
                            Title = "5 bí quyết chọn đầm dáng suông che khuyết điểm vòng hai hiệu quả", 
                            Content = "Đầm dáng suông luôn là lựa chọn số một cho phụ nữ trung niên muốn che khuyết điểm vùng bụng. Bí quyết nằm ở việc chọn chất liệu lụa satin có độ bay nhẹ, ưu tiên các mẫu có chi tiết xếp ly hoặc drapé ở vùng eo. Kết hợp thêm thắt lưng bản nhỏ ngay dưới ngực sẽ tạo hiệu ứng thon gọn tức thì. Nên chọn tông màu tối như xanh navy, đen hoặc nâu đỏ đô để tăng hiệu quả thon dáng.", 
                            ImageUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/04/dam-trung-nien-du-tiec-cotton-lanh-phoi-hoa-thu-cong-sang-trong-dd5x0908-thuong-hieu-thieu-hoa-5.webp", 
                            CreatedDate = DateTime.Now.AddDays(-1), 
                            CategoryId = biQuyetCat.Id 
                        } // Bài viết bí quyết 1
                    ); // Kết thúc hàm AddRange thêm bài viết
                    context.SaveChanges(); // Lưu danh sách bài viết thời trang mẫu xuống SQL Server
                } // Kết thúc khối điều kiện kiểm tra danh mục bài viết
            } // Kết thúc khối điều kiện thêm bài viết

            // 5. GIEO DỮ LIỆU DANH SÁCH KHÁCH HÀNG MẪU (Customers)
            if (!context.Customers.Any()) // Kiểm tra nếu bảng khách hàng đang hoàn toàn trống
            {
                context.Customers.AddRange( // Thêm danh sách khách hàng VIP mẫu mua đồ thời trang của Thiều Hoa vào DbSet Customers
                    new Customer { FullName = "Bà Trần Thị Hồng", Email = "hongtran@gmail.com", Phone = "0901234567", Address = "123 Đường 3/2, Quận 10, TP.HCM", Password = "123" }, // Khách hàng Hồng
                    new Customer { FullName = "Bà Nguyễn Thị Mai", Email = "mainguyen@gmail.com", Phone = "0912345678", Address = "456 Lê Lợi, Quận 1, TP.HCM", Password = "123" }, // Khách hàng Mai
                    new Customer { FullName = "Bà Lê Thu Cúc", Email = "cucle@gmail.com", Phone = "0987654321", Address = "789 Nguyễn Huệ, Quận 1, TP.HCM", Password = "123" } // Khách hàng Cúc
                ); // Kết thúc hàm AddRange thêm khách hàng mẫu
                context.SaveChanges(); // Lưu danh sách khách hàng mẫu xuống SQL Server
            } // Kết thúc khối điều kiện thêm khách hàng

            // 6. GIEO DỮ LIỆU ĐƠN HÀNG VÀ CHI TIẾT ĐƠN HÀNG (Orders & OrderDetails)
            if (!context.Orders.Any()) // Kiểm tra nếu bảng đơn hàng đang hoàn toàn trống
            {
                var customerHong = context.Customers.FirstOrDefault(c => c.Email == "hongtran@gmail.com"); // Tìm khách hàng Hồng qua email
                var customerMai = context.Customers.FirstOrDefault(c => c.Email == "mainguyen@gmail.com"); // Tìm khách hàng Mai qua email
                var productDamRen = context.Products.FirstOrDefault(p => p.Name.Contains("Dạ Hội")); // Tìm sản phẩm Đầm ren
                var productAoLua = context.Products.FirstOrDefault(p => p.Name.Contains("Peplum")); // Tìm sản phẩm Áo lụa
                var productTuiDa = context.Products.FirstOrDefault(p => p.Name.Contains("Túi Xách")); // Tìm sản phẩm Túi xách

                if (customerHong != null && customerMai != null && productDamRen != null && productAoLua != null && productTuiDa != null) // Đảm bảo khách hàng và sản phẩm đều tồn tại
                {
                    var order1 = new Order // Tạo mới đơn hàng thứ nhất của khách hàng Hồng
                    {
                        CustomerId = customerHong.Id, // Mã ID của bà Hồng
                        OrderDate = DateTime.Now.AddDays(-5), // Ngày đặt là 5 ngày trước
                        Status = 2, // Đặt trạng thái 2 (Đã hoàn thành giao hàng)
                        Notes = "Giao hàng giờ hành chính, đóng gói hộp quà tặng giúp tôi" // Ghi chú đơn hàng 1
                    }; // Kết thúc đơn hàng 1
                    context.Orders.Add(order1); // Thêm đơn hàng 1 vào DbSet Orders
                    context.SaveChanges(); // Lưu đơn hàng 1 xuống SQL Server để lấy mã tự tăng OrderId

                    context.OrderDetails.AddRange( // Thêm chi tiết đơn hàng mẫu cho đơn hàng 1
                        new OrderDetail { OrderId = order1.Id, ProductId = productDamRen.Id, Quantity = 1, UnitPrice = productDamRen.Price }, // Mua 1 đầm peplum
                        new OrderDetail { OrderId = order1.Id, ProductId = productTuiDa.Id, Quantity = 1, UnitPrice = productTuiDa.Price } // Mua 1 túi xách
                    ); // Kết thúc hàm AddRange thêm chi tiết đơn hàng 1

                    var order2 = new Order // Tạo mới đơn hàng thứ hai của khách hàng Mai
                    {
                        CustomerId = customerMai.Id, // Mã ID của bà Mai
                        OrderDate = DateTime.Now.AddDays(-2), // Ngày đặt là 2 ngày trước
                        Status = 0, // Đặt trạng thái 0 (Đang xử lý / Chờ duyệt)
                        Notes = "Vui lòng gọi trước khi giao 30 phút" // Ghi chú đơn hàng 2
                    }; // Kết thúc đơn hàng 2
                    context.Orders.Add(order2); // Thêm đơn hàng 2 vào DbSet Orders
                    context.SaveChanges(); // Lưu đơn hàng 2 xuống SQL Server để lấy mã tự tăng OrderId

                    context.OrderDetails.AddRange( // Thêm chi tiết đơn hàng mẫu cho đơn hàng 2
                        new OrderDetail { OrderId = order2.Id, ProductId = productAoLua.Id, Quantity = 1, UnitPrice = productAoLua.Price } // Mua 1 áo lụa peplum
                    ); // Kết thúc chi tiết đơn hàng 2

                    context.SaveChanges(); // Lưu tất cả chi tiết đơn hàng mẫu xuống SQL Server
                } // Kết thúc khối điều kiện kiểm tra tồn tại khách hàng và sản phẩm
            } // Kết thúc khối điều kiện thêm đơn hàng và chi tiết đơn hàng
        } // Kết thúc hàm SeedData
    } // Kết thúc lớp DbSeed
} // Kết thúc namespace CMS.Backend.Helpers
