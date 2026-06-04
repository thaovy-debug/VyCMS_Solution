/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa lớp dịch vụ gọi các API liên quan đến Sản phẩm thời trang từ Backend
Ngay thuc hien: 15/05/2026
*/

import axiosClient from '../api/axiosClient'; // Nhập đối tượng axiosClient đã được cấu hình đường dẫn cơ sở

const productService = { // Khai báo đối tượng dịch vụ chứa các hàm gọi API liên quan đến sản phẩm
    // Hàm gọi API lấy toàn bộ danh sách quần áo, váy dạ hội
    getAllProducts: () => { // Định nghĩa phương thức lấy danh sách tất cả sản phẩm thời trang
        const url = '/Products'; // Đường dẫn phụ khớp chính xác với Router ProductsController ở Backend
        return axiosClient.get(url); // Thực hiện phương thức HTTP GET và trả về một Promise chứa dữ liệu sản phẩm
    }, // Kết thúc phương thức getAllProducts

    // Hàm gọi API lấy danh sách sản phẩm theo mã danh mục sản phẩm cụ thể
    getProductsByCategory: (categoryId) => { // Định nghĩa phương thức lấy sản phẩm theo danh mục
        const url = `/Products/category/${categoryId}`; // Đường dẫn phụ chứa tham số categoryId khớp với Backend
        return axiosClient.get(url); // Thực hiện phương thức HTTP GET và trả về một Promise chứa dữ liệu sản phẩm đã lọc
    },

    getProductById: (id) => {
        const url = `/Products/${id}`;
        return axiosClient.get(url);
    }
}; // Kết thúc định nghĩa đối tượng productService

export default productService; // Xuất đối tượng dịch vụ để các component có thể import sử dụng

