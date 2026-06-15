/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý danh mục sản phẩm, 
Ngay thuc hien: 15/05/2026
*/

using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.ComponentModel.DataAnnotations; // Cung cấp các thuộc tính để ràng buộc dữ liệu (Validation)

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class CategoryProduct // Định nghĩa lớp CategoryProduct đại diện cho bảng danh mục sản phẩm
    {
        [Key] // Khai báo thuộc tính tiếp theo là Khóa chính (Primary Key)
        public int Id { get; set; } // Thuộc tính lưu trữ Id danh mục sản phẩm (tự tăng)

        [Required(ErrorMessage = "Tên danh mục không được để trống")] // Ràng buộc bắt buộc phải nhập và hiển thị thông báo nếu trống
        [StringLength(100)] // Ràng buộc độ dài chuỗi tối đa là 100 ký tự
        public string Name { get; set; } = string.Empty; // Thuộc tính tên danh mục sản phẩm, khởi tạo mặc định chuỗi rỗng

        public string? Description { get; set; } // Thuộc tính mô tả danh mục sản phẩm (cho phép null)

        [StringLength(255)]
        public string? ImageUrl { get; set; } // Đường dẫn ảnh đại diện danh mục

        // Quan hệ một - nhiều: Một danh mục sản phẩm sẽ có liên kết với một tập hợp nhiều sản phẩm
        public virtual ICollection<Product>? Products { get; set; }
    }
}