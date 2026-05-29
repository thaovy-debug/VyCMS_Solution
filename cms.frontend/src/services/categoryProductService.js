/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa lớp dịch vụ gọi các API liên quan đến Danh mục Sản phẩm từ Backend
Ngay thuc hien: 15/05/2026
*/

import axiosClient from '../api/axiosClient'; // Import đối tượng axiosClient đã được cấu hình đường dẫn cơ sở

const categoryProductService = { // Khai báo đối tượng chứa các phương thức gọi API danh mục sản phẩm
    /**
     * Hàm lấy toàn bộ danh mục SẢN PHẨM từ Backend
     * Endpoint này kết nối tới CategoryProductController trong ASP.NET Core
     */
    getAllCategoryProducts: () => { // Định nghĩa hàm gọi API lấy danh sách danh mục sản phẩm
        const url = '/categoriesproducts'; // Định nghĩa đường dẫn phụ khớp chính xác với route của Backend Controller
        return axiosClient.get(url); // Thực hiện phương thức HTTP GET và trả về một Promise chứa dữ liệu danh mục
    } // Kết thúc phương thức getAllCategoryProducts
}; // Kết thúc định nghĩa đối tượng dịch vụ

export default categoryProductService; // Xuất đối tượng dịch vụ để các component có thể import sử dụng
