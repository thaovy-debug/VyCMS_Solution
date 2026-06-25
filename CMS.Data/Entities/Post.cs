/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý bài viết, 
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các lớp cơ bản của hệ thống .NET
using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.Linq; // Hỗ trợ các thao tác truy vấn dữ liệu LINQ
using System.Text; // Hỗ trợ xử lý văn bản và mã hóa chuỗi
using System.Threading.Tasks; // Hỗ trợ lập trình bất đồng bộ Task

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class Post // Định nghĩa lớp Post đại diện cho bảng bài viết
    {
        public int Id { get; set; } // Thuộc tính Id bài viết (Khóa chính tự động tăng)
        public string Title { get; set; } // Thuộc tính Title - Tiêu đề bài viết
        public string Content { get; set; } // Thuộc tính Content - Nội dung chi tiết của bài viết
        public string ImageUrl { get; set; } // Thuộc tính ImageUrl - Đường dẫn hình ảnh đại diện của bài viết
        public DateTime CreatedDate { get; set; } = DateTime.Now; // Ngày tạo bài viết, mặc định lấy thời gian hiện tại

        // Khóa ngoại liên kết tới Category
        public int CategoryId { get; set; } // Thuộc tính CategoryId - Khóa ngoại liên kết đến danh mục bài viết
        public virtual Category Category { get; set; } // Khai báo đối tượng tham chiếu đến thực thể Category liên quan

        [System.ComponentModel.DataAnnotations.Display(Name = "Hiển thị bài viết")]
        public bool IsVisible { get; set; } = true; // Thuộc tính quyết định ẩn hiện bài viết

        public bool IsDeleted { get; set; } = false; // Thuộc tính cờ xóa mềm (soft delete)
    }
}
