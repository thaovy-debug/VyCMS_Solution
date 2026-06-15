import axios from 'axios';

// Định nghĩa URL gốc của API, ưu tiên lấy từ biến môi trường VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7030';

// Tạo đối tượng menuService chứa các hàm tương tác với API menu
const menuService = {
    // Hàm gọi API lấy danh sách toàn bộ menu đang hiển thị
    getAllMenus: async () => {
        try {
            // Gửi yêu cầu GET đến endpoint api/MenusApi
            const response = await axios.get(`${API_URL}/api/MenusApi`);
            return response.data; // Trả về mảng dữ liệu menu
        } catch (error) {
            console.error("Lỗi khi lấy danh sách menu:", error);
            throw error;
        }
    }
};

export default menuService; // Xuất đối tượng menuService
