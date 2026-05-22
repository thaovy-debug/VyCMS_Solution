/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý đơn hàng, 
Ngay thuc hien: 15/05/2026
*/

using System; // Sử dụng các lớp cơ bản của hệ thống .NET
using System.Collections.Generic; // Hỗ trợ làm việc với các tập hợp dữ liệu generic (ICollection)
using System.Linq; // Hỗ trợ các thao tác truy vấn dữ liệu LINQ
using System.Text; // Hỗ trợ xử lý văn bản và mã hóa chuỗi
using System.Threading.Tasks; // Hỗ trợ lập trình bất đồng bộ Task
using System.ComponentModel.DataAnnotations; // Sử dụng các Annotation để ràng buộc dữ liệu đầu vào
using System.ComponentModel.DataAnnotations.Schema; // Hỗ trợ định nghĩa khóa ngoại và ánh xạ lược đồ dữ liệu

namespace CMS.Data.Entities // Định nghĩa không gian tên chứa các thực thể của tầng dữ liệu
{
    public class Order // Định nghĩa lớp Order đại diện cho bảng đơn hàng
    {
        [Key] // Xác định thuộc tính tiếp theo làm khóa chính
        public int Id { get; set; } // Thuộc tính Id đơn hàng (tự động tăng)

        public DateTime OrderDate { get; set; } = DateTime.Now; // Ngày tạo đơn hàng, mặc định lấy thời gian hiện tại

        public int CustomerId { get; set; } // Thuộc tính khóa ngoại liên kết tới bảng khách hàng (CustomerId)

        public int Status { get; set; } // Trạng thái đơn hàng: 0: Chờ duyệt, 1: Đang giao, 2: Đã xong

        public string? Notes { get; set; } // Thuộc tính ghi chú đơn hàng của khách hàng hoặc admin (có thể null)

        [ForeignKey("CustomerId")] // Chỉ định CustomerId làm khóa ngoại liên kết tới bảng Customer
        public virtual Customer? Customer { get; set; } // Khai báo đối tượng tham chiếu đến thực thể Customer liên quan

        // Quan hệ một - nhiều: Một đơn hàng có thể chứa một danh sách tập hợp nhiều chi tiết đơn hàng (OrderDetails)
        public virtual ICollection<OrderDetail>? OrderDetails { get; set; }
    }
}
