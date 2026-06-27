const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'CMS.Backend/Controllers/ProductsController.cs');
let content = fs.readFileSync(filePath, 'utf8');

const oldGetAll = `        [HttpGet] // Chỉ định phương thức GET dùng để kéo toàn bộ danh sách sản phẩm
        public async Task<IActionResult> GetAll() // Định nghĩa hàm bất đồng bộ trả về kết quả dưới dạng IActionResult
        {
            var products = await _context.Products // Truy vấn bảng Products từ cơ sở dữ liệu
                .Where(p => p.IsVisible) // Chỉ lấy các sản phẩm được phép hiển thị
                .OrderByDescending(p => p.Id) // Sắp xếp sản phẩm giảm dần theo ID để sản phẩm mới nhất lên đầu
                .Select(p => new { // Áp dụng kỹ thuật gọt tỉa dữ liệu để giảm bớt băng thông truyền tải JSON
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
                    p.IsHot // Thêm trạng thái bán chạy
                }) // Kết thúc biểu thức Select gọt tỉa
                .ToListAsync(); // Chuyển đổi bất đồng bộ kết quả truy vấn thành danh sách List

            return Ok(products); // Trả về kết quả cho Frontend kèm mã trạng thái HTTP 200 OK
        }`;

const newGetAll = `        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string search = null,
            [FromQuery] double? minPrice = null,
            [FromQuery] double? maxPrice = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string sortBy = null,
            [FromQuery] string filter = null,
            [FromQuery] int? take = null)
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

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryProductId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(filter))
            {
                if (filter.ToLower() == "new")
                    query = query.Where(p => p.IsNew);
                else if (filter.ToLower() == "sale")
                    query = query.Where(p => p.DiscountPercent > 0);
                else if (filter.ToLower() == "hot")
                    query = query.Where(p => p.IsHot);
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortBy.ToLower() == "price_asc")
                    query = query.OrderBy(p => p.DiscountPercent > 0 ? p.Price * (1 - p.DiscountPercent / 100m) : p.Price);
                else if (sortBy.ToLower() == "price_desc")
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
        }`;

if (content.includes(oldGetAll)) {
    content = content.replace(oldGetAll, newGetAll);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("ProductsController.cs updated successfully.");
} else {
    console.error("Could not find the GetAll method block to replace.");
}
