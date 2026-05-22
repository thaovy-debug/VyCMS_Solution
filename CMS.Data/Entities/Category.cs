/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: thuc hien quan ly danh muc, 
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các lớp cơ bản của hệ thống .NET
using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.Linq; // Cung cấp các phương thức truy vấn LINQ
using System.Text; // Hỗ trợ các thao tác xử lý chuỗi và mã hóa ký tự
using System.Threading.Tasks; // Hỗ trợ lập trình đa luồng và bất đồng bộ
using CMS.Data.Entities; // Tham chiếu đến các thực thể khác trong thư mục Entities

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class Category // Định nghĩa lớp Category đại diện cho bảng danh mục bài viết
    {
        public int Id { get; set; } // Khóa chính của bảng danh mục (Id tự động tăng)
        public string Name { get; set; } // Tên danh mục (ví dụ: Tin Giáo Dục, Tin Thể Thao...)
        public string Description { get; set; } // Mô tả chi tiết về danh mục này

        // Quan hệ một - nhiều: Một danh mục chứa danh sách nhiều bài viết liên quan
        public virtual ICollection<Post> Posts { get; set; }
    }
}