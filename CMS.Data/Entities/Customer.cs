/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý khách hàng, 
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các lớp cơ bản của hệ thống .NET
using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.Linq; // Hỗ trợ các thao tác truy vấn dữ liệu LINQ
using System.Text; // Hỗ trợ xử lý văn bản và mã hóa chuỗi
using System.Threading.Tasks; // Hỗ trợ lập trình bất đồng bộ Task
using System.ComponentModel.DataAnnotations; // Sử dụng các Annotation để ràng buộc dữ liệu đầu vào

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    // Khách hàng
    public class Customer // Định nghĩa lớp Customer đại diện cho bảng khách hàng
    {
        [Key] // Xác định thuộc tính tiếp theo làm khóa chính
        public int Id { get; set; } // Thuộc tính Id khách hàng (tự động tăng)

        [Required] // Yêu cầu bắt buộc nhập họ tên
        public string FullName { get; set; } // Thuộc tính lưu trữ họ tên đầy đủ của khách hàng

        [Required] // Yêu cầu bắt buộc nhập địa chỉ Email
        [EmailAddress] // Xác định định dạng nhập vào phải là địa chỉ Email hợp lệ
        public string Email { get; set; } // Thuộc tính lưu trữ địa chỉ email khách hàng

        public string? Phone { get; set; } // Thuộc tính lưu trữ số điện thoại khách hàng (có thể null)

        public string? Address { get; set; } // Thuộc tính lưu trữ địa chỉ của khách hàng (có thể null)

        [Required] // Yêu cầu bắt buộc nhập mật khẩu
        public string Password { get; set; } // Thuộc tính lưu trữ mật khẩu thô của khách hàng để đơn giản hóa hệ thống

        // Quan hệ một - nhiều: Một khách hàng có thể thực hiện mua sắm và tạo nhiều đơn hàng (Orders)
        public virtual ICollection<Order>? Orders { get; set; }
    }
}
