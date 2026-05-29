/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Cấu hình và khởi chạy ứng dụng web ASP.NET Core, đăng ký dịch vụ (bao gồm Swagger, CORS và Database), cơ chế xác thực Cookie, và HTTP request pipeline hỗ trợ cả MVC và Web API
Ngay thuc hien: 15/05/2026
*/

using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho cấu hình CSDL
using CMS.Data; // Tham chiếu đến tầng dữ liệu (CMS.Data) chứa DbContext
using Microsoft.AspNetCore.Authentication.Cookies; // Sử dụng xác thực bằng Cookie

var builder = WebApplication.CreateBuilder(args); // Khởi tạo trình xây dựng ứng dụng web builder

// Đăng ký kết nối Database với SQL Server dựa vào Connection String "DefaultConnection"
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Cấu hình nhà cung cấp cơ sở dữ liệu SQL Server

// Đăng ký dịch vụ cho các Controller hỗ trợ View (MVC) và Web API
builder.Services.AddControllersWithViews(); // Đăng ký các controller và view cho luồng MVC

// Đăng ký chính sách CORS cho phép ReactJS truy cập (phục vụ kết nối FrontEnd ReactJS)
builder.Services.AddCors(options => { // Đăng ký dịch vụ CORS vào DI container
    options.AddPolicy("AllowReactApp", policy => { // Thiết lập chính sách CORS mang tên AllowReactApp
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175") // Cho phép ReactJS ở cổng 3000, 5173, 5174 hoặc 5175 gọi tới
              .AllowAnyHeader() // Cho phép mọi loại Header (Content-Type, Authorization...)
              .AllowAnyMethod() // Cho phép mọi phương thức HTTP (GET, POST, PUT, DELETE)
              .AllowCredentials(); // Hỗ trợ truyền Cookie/Session nếu cần sau này
    }); // Kết thúc thiết lập chính sách AllowReactApp
}); // Kết thúc đăng ký CORS

// Đăng ký dịch vụ lõi giúp hệ thống tự động bóc tách thông tin Endpoint phục vụ Swagger
builder.Services.AddEndpointsApiExplorer(); // Kích hoạt bộ thăm dò API endpoints

// Đăng ký bộ sinh tài liệu API Swagger
builder.Services.AddSwaggerGen(); // Đăng ký dịch vụ sinh tài liệu Swagger UI

// Đăng ký dịch vụ xác thực Cookie cho hệ thống VyCMS
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme) // Cấu hình phương thức xác thực mặc định là Cookie
    .AddCookie(options => // Cấu hình chi tiết các tùy chọn Cookie
    {
        options.LoginPath = "/Account/Login"; // Đường dẫn chuyển hướng nếu người dùng chưa đăng nhập
        options.AccessDeniedPath = "/Account/AccessDenied"; // Đường dẫn chuyển hướng nếu truy cập trang bị cấm
    });

var app = builder.Build(); // Xây dựng ứng dụng web từ trình cấu hình builder

// Tự động gieo dữ liệu mẫu khi ứng dụng khởi chạy
using (var scope = app.Services.CreateScope()) // Tạo phạm vi dịch vụ (Scope) để lấy DbContext giải phóng sau khi dùng
{
    var services = scope.ServiceProvider; // Lấy bộ cung cấp dịch vụ trong scope
    var context = services.GetRequiredService<ApplicationDbContext>(); // Lấy thực thể DbContext được đăng ký
    CMS.Backend.Helpers.DbSeed.SeedData(context); // Gọi hàm SeedData để tự động tạo dữ liệu mẫu nếu trống hoặc chứa ảnh cũ
}

// Cấu hình HTTP request pipeline (các Middleware xử lý yêu cầu)
if (!app.Environment.IsDevelopment()) // Kiểm tra nếu không phải môi trường phát triển (Production)
{
    app.UseExceptionHandler("/Home/Error"); // Chuyển hướng người dùng đến trang lỗi nếu phát sinh lỗi nghiêm trọng
    app.UseHsts(); // Sử dụng HTTP Strict Transport Security để bắt buộc kết nối HTTPS bảo mật
}

// app.UseHttpsRedirection(); // Tạm thời tắt chuyển hướng HTTPS ở local để tránh lỗi CORS khi gọi API từ HTTP ReactJS và tránh lỗi chứng chỉ SSL tự ký
app.UseStaticFiles(); // Cho phép ứng dụng phục vụ các tệp tĩnh (CSS, JS, hình ảnh) từ thư mục wwwroot

// Kích hoạt sinh tài liệu và giao diện Swagger UI
app.UseSwagger(); // Bật Middleware sinh tài liệu JSON Swagger
app.UseSwaggerUI(c => // Cấu hình giao diện Swagger UI để kiểm thử trực quan
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ThaiCMS Web API v1"); // Định nghĩa endpoint tài liệu API v1
    c.RoutePrefix = "swagger"; // Thiết lập đường dẫn truy cập tài liệu Swagger mặc định là /swagger
});

app.UseRouting(); // Kích hoạt định tuyến để ánh xạ URL đến Endpoint tương ứng

// [VỊ TRÍ ĐẶT CORS]: Phải nằm ngay giữa UseRouting và UseAuthentication / UseAuthorization
app.UseCors("AllowReactApp"); // Áp dụng chính sách CORS "AllowReactApp" cho mọi HTTP request đi qua pipeline

app.UseAuthentication(); // Kích hoạt cơ chế xác thực danh tính người dùng (Authentication) - Kiểm tra "Bạn là ai?"
app.UseAuthorization(); // Kích hoạt cơ chế phân quyền (Authorization) - Kiểm tra "Bạn được làm gì?"

// Phân luồng A: Ánh xạ các Endpoint API tuân thủ theo cấu trúc [Route("api/[controller]")]
app.MapControllers(); // Định tuyến động cho các API controller không cần định nghĩa Route mặc định trong Map

// Phân luồng B: Giữ lại bản đồ định tuyến mặc định cho trang giao diện Web MVC cũ
app.MapControllerRoute( // Cấu hình định tuyến mặc định cho các Controller MVC
    name: "default", // Tên của route mặc định
    pattern: "{controller=Home}/{action=Index}/{id?}"); // Định dạng URL mặc định: /Home/Index/{id} (id là tham số tùy chọn)

app.Run(); // Khởi chạy ứng dụng và bắt đầu lắng nghe các HTTP request gửi đến