/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa ViewModel dùng để truyền tải thông tin lỗi hệ thống ra View, 
Ngay thuc hien: 15/05/2026
*/

namespace CMS.Backend.Models // Định nghĩa không gian tên chứa các ViewModel phục vụ tầng Backend
{
    public class ErrorViewModel // Định nghĩa lớp ErrorViewModel dùng hiển thị thông tin lỗi
    {
        public string? RequestId { get; set; } // Thuộc tính lưu mã định danh yêu cầu HTTP gây ra lỗi (cho phép null)

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId); // Thuộc tính chỉ đọc xác định có hiển thị RequestId hay không (chỉ hiển thị khi có dữ liệu)
    }
}
