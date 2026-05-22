/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Cấu hình và khởi chạy ứng dụng web ASP.NET Core, đăng ký dịch vụ và pipeline xử lý HTTP request, 
Ngay thuc hien: 15/05/2026
*/

using Microsoft.EntityFrameworkCore; // Sử dụng Entity Framework Core cho cấu hình CSDL
using CMS.Data; // Tham chiếu đến tầng dữ liệu (CMS.Data) chứa DbContext

var builder = WebApplication.CreateBuilder(args); // Khởi tạo trình xây dựng ứng dụng web builder

// Đăng ký kết nối Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Đăng ký DbContext với SQL Server dựa vào Connection String "DefaultConnection"

// Add services to the container.
builder.Services.AddControllersWithViews(); // Đăng ký dịch vụ cho các Controller hỗ trợ View (MVC)

var app = builder.Build(); // Xây dựng ứng dụng web từ trình cấu hình builder

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment()) // Kiểm tra nếu không phải môi trường phát triển (Production)
{
    app.UseExceptionHandler("/Home/Error"); // Chuyển hướng người dùng đến trang lỗi nếu phát sinh exception
    app.UseHsts(); // Sử dụng HTTP Strict Transport Security để tăng tính bảo mật cho HTTPS
}

app.UseHttpsRedirection(); // Tự động chuyển hướng các yêu cầu HTTP sang HTTPS
app.UseStaticFiles(); // Cho phép ứng dụng phục vụ các tệp tĩnh (CSS, JS, hình ảnh) từ thư mục wwwroot

app.UseRouting(); // Kích hoạt định tuyến để ánh xạ URL đến Controller tương ứng

app.UseAuthorization(); // Kích hoạt cơ chế xác thực phân quyền người dùng (Authorization)

app.MapControllerRoute( // Cấu hình định tuyến mặc định cho các Controller
    name: "default", // Tên của route mặc định
    pattern: "{controller=Home}/{action=Index}/{id?}"); // Định dạng URL mặc định: /Home/Index/{id} (id là tham số tùy chọn)

app.Run(); // Khởi chạy ứng dụng và bắt đầu lắng nghe các HTTP request gửi đến