/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý sản phẩm, 
Ngay thuc hien: 15/05/2026
*/

using System.ComponentModel.DataAnnotations; // Sử dụng các Annotation ràng buộc kiểm tra hợp lệ dữ liệu
using System.ComponentModel.DataAnnotations.Schema; // Hỗ trợ định cấu hình cấu trúc bảng và khóa ngoại

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class Product // Định nghĩa lớp Product đại diện cho bảng sản phẩm
    {
        [Key] // Xác định thuộc tính tiếp theo làm khóa chính
        public int Id { get; set; } // Thuộc tính Id sản phẩm (tự tăng)

        [Required(ErrorMessage = "Tên sản phẩm không được để trống")] // Ràng buộc bắt buộc phải nhập và hiển thị thông báo lỗi
        public string Name { get; set; } = string.Empty; // Thuộc tính lưu tên sản phẩm, mặc định rỗng

        public string? Description { get; set; } // Thuộc tính lưu mô tả chi tiết của sản phẩm (cho phép null)

        public string? Sizes { get; set; } // Danh sách size sản phẩm, phân cách bằng dấu phẩy (vd: S,M,L,XL)

        public string? Colors { get; set; } // Danh sách màu sắc sản phẩm dạng JSON (vd: [{"name":"Đỏ","image":"url"}])

        public string? SizeGuideImageUrl { get; set; } // Ảnh mô tả thêm hoặc bảng size

        [Range(0, double.MaxValue)] // Ràng buộc giá trị nhập vào phải từ 0 trở lên
        [Column(TypeName = "decimal(18,2)")] // Xác định kiểu dữ liệu trong SQL Server là decimal(18,2)
        public decimal Price { get; set; } // Thuộc tính lưu đơn giá sản phẩm

        public int StockQuantity { get; set; } // Thuộc tính lưu số lượng sản phẩm hiện có trong kho

        public string? ImageUrl { get; set; } // Thuộc tính lưu đường dẫn ảnh đại diện sản phẩm (cho phép null)

        [Range(0, 100)] // Ràng buộc giá trị phần trăm giảm giá từ 0 đến 100
        public int DiscountPercent { get; set; } = 0; // Thuộc tính lưu phần trăm giảm giá (mặc định 0 = không giảm giá)

        public int CategoryProductId { get; set; } // Thuộc tính khóa ngoại liên kết tới bảng danh mục sản phẩm (CategoryProduct)

        [ForeignKey("CategoryProductId")] // Chỉ định CategoryProductId làm khóa ngoại liên kết đến bảng CategoryProduct
        public virtual CategoryProduct? CategoryProduct { get; set; } // Đối tượng tham chiếu đến danh mục sản phẩm liên quan
        
        public DateTime CreatedDate { get; set; } = DateTime.Now; // Thêm ngày tạo sản phẩm
        
        [Display(Name = "Là sản phẩm mới")]
        public bool IsNew { get; set; } = false; // Thuộc tính xác định sản phẩm là hàng mới về

        [Display(Name = "Là sản phẩm bán chạy")]
        public bool IsHot { get; set; } = false; // Thuộc tính tác động thủ công để đẩy sản phẩm lên mục Bán chạy

        [Display(Name = "Hiển thị sản phẩm")]
        public bool IsVisible { get; set; } = true; // Thuộc tính quyết định ẩn hiện sản phẩm
    }
}