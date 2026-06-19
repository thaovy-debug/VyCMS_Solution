/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Định nghĩa lớp dịch vụ gọi các API liên quan đến Chuyên mục và Bài viết tin tức từ Backend
Ngay thuc hien: 15/05/2026
*/

import axiosClient from '../api/axiosClient'; // Import đối tượng axiosClient đã được cấu hình sẵn đường dẫn cơ sở

const blogService = { // Khai báo đối tượng dịch vụ chứa các phương thức gọi API tin tức
    // Hàm gọi API lấy danh mục các chủ đề bài viết
    getBlogCategories: () => { // Định nghĩa hàm gọi API danh mục bài viết
        const url = '/Categories'; // Khai báo đường dẫn tương đối khớp với CategoriesController ở Backend
        return axiosClient.get(url); // Thực hiện yêu cầu HTTP GET và trả về kết quả qua Promise
    }, // Kết thúc phương thức getBlogCategories

    // Hàm gọi API lấy toàn bộ các bài viết (Mẹo phối đồ, tin tức thời trang)
    getAllPosts: (filters = {}) => { // Nhận thêm tham số filters để lọc động
        const url = '/Posts';
        return axiosClient.get(url, { params: filters }); // Thực hiện yêu cầu HTTP GET và trả về danh sách bài viết
    },

    getLatestPosts: () => {
        const url = '/Posts/latest';
        return axiosClient.get(url);
    },

    getPostById: (id) => {
        const url = `/Posts/${id}`;
        return axiosClient.get(url);
    },

    // Lấy toàn bộ danh mục bài viết thật từ SQL Server
    getAllCategories: async () => {
        try {
            const response = await axiosClient.get('/Categories');
            return response.data || response;
        } catch (error) {
            console.error("Lỗi API getAllCategories:", error);
            throw error;
        }
    }
}; // Kết thúc đối tượng dịch vụ blogService

export default blogService; // Xuất đối tượng dịch vụ blogService để các component khác import sử dụng
