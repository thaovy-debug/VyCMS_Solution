/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý người dùng, 
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các lớp cơ bản của hệ thống .NET
using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.Linq; // Hỗ trợ các thao tác truy vấn dữ liệu LINQ
using System.Text; // Hỗ trợ xử lý văn bản và mã hóa chuỗi
using System.Threading.Tasks; // Hỗ trợ lập trình bất đồng bộ Task

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class User // Định nghĩa lớp User đại diện cho bảng người dùng hệ thống quản lý (admin/editor)
    {
        public int Id { get; set; } // Thuộc tính Id người dùng (Khóa chính tự động tăng)
        public string Username { get; set; } // Thuộc tính Username dùng để đăng nhập vào hệ thống
        public string PasswordHash { get; set; } // Thuộc tính lưu trữ mật khẩu đã được mã hóa (băm) bảo mật
        public string FullName { get; set; } // Thuộc tính lưu trữ họ tên đầy đủ của người dùng
        public string Role { get; set; } // Thuộc tính lưu trữ vai trò/quyền hạn của người dùng (Ví dụ: Quản trị viên, Biên tập viên)
    }
}
