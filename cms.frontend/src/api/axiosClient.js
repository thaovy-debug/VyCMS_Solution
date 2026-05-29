/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Khởi tạo và cấu hình Axios Client để gọi API tập trung từ Backend lên Frontend
Ngay thuc hien: 15/05/2026
*/

import axios from 'axios'; // Nhập thư viện axios để thực hiện các yêu cầu HTTP Requests

// Khởi tạo một thực thể axios với cấu hình base chung
const axiosClient = axios.create({ // Tạo thực thể axios mới bằng hàm axios.create
    baseURL: 'http://localhost:5244/api', // Thiết lập đường dẫn cơ sở của Web API Backend (cổng http 5244)
    headers: { // Cấu hình các HTTP Headers mặc định cho tất cả các yêu cầu
        'Content-Type': 'application/json', // Định dạng dữ liệu truyền và nhận là kiểu JSON
    }, // Kết thúc định nghĩa cấu hình headers
    timeout: 10000, // Thiết lập thời gian tối đa chờ phản hồi từ server là 10 giây (10000ms)
}); // Kết thúc khởi tạo thực thể axiosClient

// Sử dụng Response Interceptor để can thiệp và xử lý dữ liệu trước khi trả về cho Component
axiosClient.interceptors.response.use( // Cấu hình interceptor cho luồng phản hồi trả về
    (response) => { // Trường hợp nhận phản hồi thành công từ Server (mã trạng thái 2xx)
        return response.data; // Trích xuất và chỉ trả về phần dữ liệu thực tế (body) nhận được từ JSON
    }, // Kết thúc hàm xử lý khi phản hồi thành công
    (error) => { // Trường hợp xảy ra lỗi kết nối hoặc nhận mã trạng thái lỗi (4xx, 5xx) từ Server
        console.error('Lỗi kết nối API:', error.message); // In thông báo chi tiết lỗi kết nối ra màn hình console F12
        return Promise.reject(error); // Trả về một Promise thất bại để truyền lỗi đến khối catch của component
    } // Kết thúc hàm xử lý khi xảy ra lỗi
); // Kết thúc cấu hình interceptor phản hồi

export default axiosClient; // Xuất thực thể axiosClient làm mặc định để các file service khác import sử dụng
