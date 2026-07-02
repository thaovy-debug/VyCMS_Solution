/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa các API endpoint GET để truy xuất danh sách sản phẩm, lọc sản phẩm theo danh mục và xem chi tiết sản phẩm phục vụ trang mua sắm
Ngay thuc hien: 15/05/2026
*/

using Microsoft.AspNetCore.Mvc; // Import thư viện hỗ trợ thiết lập Web API Controller
using Microsoft.EntityFrameworkCore; // Import thư viện hỗ trợ các truy vấn bất đồng bộ của Entity Framework Core
using CMS.Data; // Import namespace chứa lớp ngữ cảnh cơ sở dữ liệu ApplicationDbContext
using System.Threading.Tasks; // Hỗ trợ định nghĩa các tác vụ bất đồng bộ Task
using System.Linq; // Hỗ trợ các cú pháp truy vấn LINQ

namespace CMS.Backend.Controllers // Khai báo không gian tên tương ứng với thư mục Controllers của dự án Backend
{
    [Route("api/[controller]")] // Định nghĩa đường dẫn định tuyến chính cho API là api/Products
    [ApiController] // Đánh dấu lớp này là một API Controller để tự động xử lý kiểm định dữ liệu đầu vào (Validation)
    public class ProductsController : ControllerBase // Kế thừa ControllerBase thay vì Controller của MVC để tối ưu hiệu năng API
    {
        private readonly ApplicationDbContext _context; // Biến cục bộ chỉ đọc lưu trữ ngữ cảnh cơ sở dữ liệu

        public ProductsController(ApplicationDbContext context) // Hàm khởi tạo nhận Dependency Injection cho ApplicationDbContext
        {
            _context = context; // Gán ngữ cảnh cơ sở dữ liệu được tiêm vào biến cục bộ để sử dụng trong các API
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string search = null,
            [FromQuery] double? minPrice = null,
            [FromQuery] double? maxPrice = null,
            [FromQuery] CategoryDropdown? categoryId = null,
            [FromQuery] SortByDropdown? sortBy = null,
            [FromQuery] FilterDropdown? filter = null,
            [FromQuery] int? take = null,
            [FromQuery] SizeDropdown? size = null,
            [FromQuery] string color = null)
        {
            var query = _context.Products.Where(p => p.IsVisible).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => (p.DiscountPercent > 0 ? p.Price * (1 - p.DiscountPercent / 100m) : p.Price) >= (decimal)minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => (p.DiscountPercent > 0 ? p.Price * (1 - p.DiscountPercent / 100m) : p.Price) <= (decimal)maxPrice.Value);
            }

            if (categoryId.HasValue && categoryId.Value != CategoryDropdown.TatCa)
            {
                query = query.Where(p => p.CategoryProductId == (int)categoryId.Value);
            }

            if (filter.HasValue)
            {
                if (filter.Value == FilterDropdown.New)
                    query = query.Where(p => p.IsNew);
                else if (filter.Value == FilterDropdown.Sale)
                    query = query.Where(p => p.DiscountPercent > 0);
                else if (filter.Value == FilterDropdown.Hot)
                    query = query.Where(p => p.IsHot);
            }

            if (size.HasValue)
            {
                query = query.Where(p => p.Sizes.Contains(size.Value.ToString()));
            }

            if (!string.IsNullOrEmpty(color))
            {
                query = query.Where(p => p.Colors.Contains(color));
            }

            if (sortBy.HasValue)
            {
                if (sortBy.Value == SortByDropdown.Price_Asc)
                    query = query.OrderBy(p => p.DiscountPercent > 0 ? p.Price * (1 - p.DiscountPercent / 100m) : p.Price);
                else if (sortBy.Value == SortByDropdown.Price_Desc)
                    query = query.OrderByDescending(p => p.DiscountPercent > 0 ? p.Price * (1 - p.DiscountPercent / 100m) : p.Price);
                else
                    query = query.OrderByDescending(p => p.Id);
            }
            else
            {
                query = query.OrderByDescending(p => p.Id);
            }

            if (take.HasValue && take.Value > 0)
            {
                query = query.Take(take.Value);
            }

            var products = await query.Select(p => new {
                p.Id,
                p.Name,
                p.Price,
                p.ImageUrl,
                p.StockQuantity,
                p.DiscountPercent,
                p.CategoryProductId,
                p.Sizes,
                p.Colors,
                p.VariantStocks,
                p.CreatedDate,
                p.IsNew,
                p.IsHot
            }).ToListAsync();

            return Ok(products);
        }

        [HttpGet("category/{categoryProductId}")] // Định nghĩa đường dẫn nhận tham số categoryProductId trên URL
        public async Task<IActionResult> GetByCategoryProduct(int categoryProductId) // Định nghĩa hàm lọc sản phẩm theo danh mục
        {
            var products = await _context.Products // Truy vấn bảng Products từ cơ sở dữ liệu
                .Where(p => p.CategoryProductId == categoryProductId && p.IsVisible) // Lọc các sản phẩm có CategoryProductId trùng khớp và được phép hiển thị
                .Select(p => new { // Gọt tỉa các trường dữ liệu để chỉ trả về thông tin cần thiết
                    p.Id, // Lấy mã ID của sản phẩm
                    p.Name, // Lấy tên sản phẩm
                    p.Price, // Lấy đơn giá sản phẩm
                    p.ImageUrl, // Lấy đường dẫn hình ảnh của sản phẩm
                    p.StockQuantity, // Lấy số lượng hàng còn trong kho
                    p.DiscountPercent, // Lấy phần trăm giảm giá của sản phẩm (0 = không giảm)
                    p.CategoryProductId, // Lấy mã danh mục sản phẩm liên kết
                    p.Sizes, // Thêm danh sách size
                    p.Colors, // Thêm danh sách màu sắc
                    p.VariantStocks, // Thêm dữ liệu tồn kho phân loại
                    p.CreatedDate, // Thêm ngày tạo
                    p.IsNew, // Thêm trạng thái sản phẩm mới
                    p.IsHot
                }) // Kết thúc biểu thức Select gọt tỉa
                .ToListAsync(); // Chuyển kết quả sang danh sách bất đồng bộ

            return Ok(products); // Trả về danh sách sản phẩm đã lọc kèm mã trạng thái HTTP 200 OK
        }

        [HttpGet("new")]
        public async Task<IActionResult> GetNew()
        {
            var products = await _context.Products
                .Where(p => p.IsNew && p.IsVisible)
                .OrderByDescending(p => p.CreatedDate)
                .Take(4)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    p.DiscountPercent,
                    p.CategoryProductId,
                    p.Sizes,
                    p.Colors,
                    p.VariantStocks,
                    p.CreatedDate,
                    p.IsNew,
                    p.IsHot
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("sale")]
        public async Task<IActionResult> GetSale()
        {
            var products = await _context.Products
                .Where(p => p.DiscountPercent > 0 && p.IsVisible)
                .OrderByDescending(p => p.Id)
                .Take(4)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    p.DiscountPercent,
                    p.CategoryProductId,
                    p.Sizes,
                    p.Colors,
                    p.VariantStocks,
                    p.CreatedDate,
                    p.IsNew,
                    p.IsHot
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("hot")]
        public async Task<IActionResult> GetHot()
        {
            var products = await _context.Products
                .Where(p => p.IsHot && p.IsVisible)
                .OrderByDescending(p => p.Id)
                .Take(4)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    p.DiscountPercent,
                    p.CategoryProductId,
                    p.Sizes,
                    p.Colors,
                    p.VariantStocks,
                    p.CreatedDate,
                    p.IsNew,
                    p.IsHot
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")] // Định nghĩa đường dẫn nhận ID trực tiếp để xem chi tiết sản phẩm
        public async Task<IActionResult> GetDetail(int id) // Định nghĩa hàm lấy chi tiết một sản phẩm cụ thể
        {
            var product = await _context.Products // Truy vấn bảng Products từ cơ sở dữ liệu
                .FirstOrDefaultAsync(p => p.Id == id && p.IsVisible); // Tìm sản phẩm đầu tiên khớp ID và được phép hiển thị, hoặc null nếu không tồn tại

            if (product == null) // Kiểm tra nếu không tìm thấy sản phẩm nào trong CSDL
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm này trong hệ thống" }); // Trả về lỗi 404 kèm thông báo lỗi JSON
            }

            return Ok(product); // Trả về toàn bộ đối tượng sản phẩm (bao gồm cả trường Description) kèm mã HTTP 200 OK
        }
    }

    [System.Text.Json.Serialization.JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))]
    public enum CategoryDropdown
    {
        TatCa = 0,
        Quan = 11,
        Dam = 12,
        Ao = 13,
        PhuKien = 14,
        ChanVay = 16,
        AoKhoac = 17,
        SaleOff = 18
    }

    [System.Text.Json.Serialization.JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))]
    public enum FilterDropdown
    {
        New,
        Sale,
        Hot
    }

    [System.Text.Json.Serialization.JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))]
    public enum SortByDropdown
    {
        Price_Asc,
        Price_Desc
    }

    [System.Text.Json.Serialization.JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))]
    public enum SizeDropdown
    {
        S,
        M,
        L,
        XL,
        XXL,
        Freesize
    }
}
