/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Thực hiện quản lý chi tiết đơn hàng, 
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
    public class OrderDetail // Định nghĩa lớp OrderDetail đại diện cho bảng chi tiết đơn hàng
    {
        [Key] // Xác định thuộc tính tiếp theo làm khóa chính
        public int Id { get; set; } // Thuộc tính Id chi tiết đơn hàng (tự động tăng)

        public int OrderId { get; set; } // Thuộc tính khóa ngoại liên kết tới bảng đơn hàng (OrderId)

        public int ProductId { get; set; } // Thuộc tính khóa ngoại liên kết tới bảng sản phẩm (ProductId)

        public int Quantity { get; set; } // Thuộc tính lưu trữ số lượng sản phẩm được mua

        [Column(TypeName = "decimal(18,2)")] // Ánh xạ kiểu dữ liệu trong SQL Server là decimal với độ chính xác (18, 2)
        public decimal UnitPrice { get; set; } // Thuộc tính lưu trữ giá của sản phẩm tại thời điểm mua hàng

        [ForeignKey("OrderId")] // Chỉ định OrderId làm khóa ngoại liên kết tới bảng Order
        public virtual Order? Order { get; set; } // Khai báo đối tượng tham chiếu đến thực thể Order liên quan

        [ForeignKey("ProductId")] // Chỉ định ProductId làm khóa ngoại liên kết tới bảng Product
        public virtual Product? Product { get; set; } // Khai báo đối tượng tham chiếu đến thực thể Product liên quan
    }
}
