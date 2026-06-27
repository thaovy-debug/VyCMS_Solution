/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Component hiển thị danh sách các bài viết Tin tức thời trang, xu hướng phối đồ cao cấp kiểu dáng ZeyChíc
Ngay thuc hien: 15/05/2026
*/

import React, { useState, useEffect } from 'react'; // Nhập React và các Hooks useState, useEffect
import { Link } from 'react-router-dom';
import blogService from '../services/blogService'; // Nhập lớp dịch vụ blogService để gọi API bài viết từ Backend

const PostList = ({ isHome, postsProp, loadingProp }) => { // Định nghĩa component chức năng PostList
    const [posts, setPosts] = useState([]); // Khai báo state posts lưu trữ mảng bài viết từ API, mặc định rỗng
    const [loading, setLoading] = useState(true); // Khai báo state loading quản lý trạng thái tải dữ liệu

    useEffect(() => { // Tự động chạy tải bài viết khi component được nạp lần đầu
        if (postsProp !== undefined) {
            setPosts(postsProp);
            setLoading(loadingProp);
            return;
        }

        const fetchPosts = async () => { // Định nghĩa hàm bất đồng bộ fetchPosts
            try { // Khối bắt đầu try
                setLoading(true); // Thiết lập trạng thái loading là true
                const data = isHome ? await blogService.getLatestPosts() : await blogService.getAllPosts(); // Gọi hàm lấy danh sách bài viết từ service
                setPosts(data); // Cập nhật mảng bài viết nhận được vào state posts
            } catch (error) { // Bắt lỗi trong khối catch nếu xảy ra sự cố
                console.error("Lỗi khi tải danh sách bài viết:", error); // Log lỗi chi tiết
            } finally { // Khối luôn chạy sau cùng
                setLoading(false); // Thiết lập trạng thái loading về false để tắt màn hình chờ
            } // Kết thúc khối finally
        }; // Kết thúc định nghĩa hàm fetchPosts

        fetchPosts(); // Thực thi hàm tải bài viết
    }, [isHome, postsProp, loadingProp]); // Chạy lại nếu isHome thay đổi

    if (loading) { // Nếu trạng thái loading đang là true
        return <div className="text-center my-4 text-muted">Đang tải tin tức thời trang xu hướng...</div>; // Trả về giao diện thông báo chờ tải dữ liệu
    } // Kết thúc điều kiện kiểm tra loading

    return ( // Trả về cấu trúc JSX của phần danh sách bài viết thời trang
        <div className="mt-5 mb-5"> {/* Khung div bao ngoài cách lề trên mt-5 và lề dưới mb-5 */}
            {/* Tiêu đề mục tin tức phong cách sang trọng ZeyChíc */}
            <h4 className="mb-4 text-uppercase font-weight-bold text-center pb-2 position-relative" style={{ letterSpacing: '1px', color: 'var(--zeychic-primary)' }}> {/* Định dạng chữ hoa in đậm căn giữa đỏ nâu */}
                <i className="fa-solid fa-feather-pointed mr-2" style={{ color: 'var(--zeychic-gold)' }}></i> Cẩm nang làm đẹp & Xu hướng {/* Icon bút lông màu vàng đi kèm nhãn tiêu đề */}
                {/* Dòng trang trí nhỏ phía dưới tiêu đề */}
                <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--zeychic-gold)', margin: '10px auto 0 auto' }}></div> {/* Thanh vàng kim ngang trang trí */}
            </h4> {/* Kết thúc thẻ tiêu đề */}
            
            {posts.length === 0 ? ( // Kiểm tra nếu danh sách bài viết rỗng
                <p className="text-muted text-center py-4">Chưa có bài viết tin tức nào.</p> // Hiển thị thông báo trống
            ) : ( // Ngược lại nếu mảng chứa dữ liệu bài viết
                <div className="row"> {/* Khởi tạo hàng lưới grid Bootstrap */}
                    {posts.map((post) => ( // Lặp qua từng bài viết để tạo cấu trúc thẻ hiển thị tương ứng
                        <div className="col-lg-6 mb-4" key={post.id}> {/* Mỗi bài viết chiếm một nửa chiều ngang màn hình máy tính (6/12) */}
                            <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden transition-all hover-card" style={{ backgroundColor: 'var(--zeychic-card-bg)' }}> {/* Card bo góc nền trắng có hover nổi */}
                                <div className="row no-gutters h-100"> {/* Khởi tạo hàng ngang Bootstrap không khoảng giãn */}
                                    {post.imageUrl && ( // Nếu bài viết có chứa đường dẫn ảnh đại diện
                                        <div className="col-sm-4 position-relative overflow-hidden" style={{ minHeight: '160px' }}> {/* Cột chứa ảnh chiếm 4/12 chiều rộng card */}
                                            <img // Thẻ ảnh bài viết blog
                                                src={post.imageUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'https://localhost:7030'}${post.imageUrl}` : post.imageUrl} // Gán đường dẫn ảnh từ API
                                                className="w-100 h-100 hover-zoom" // Ảnh rộng dài 100%, hiệu ứng phóng to
                                                alt={post.title} // Nhãn mô tả ảnh là tiêu đề bài viết
                                                style={{ objectFit: 'cover', transition: 'transform 0.4s ease', position: 'absolute', top: 0, left: 0 }} // Định dạng ảnh vừa khít khung
                                            /> {/* Kết thúc img */}
                                        </div> // Kết thúc cột chứa ảnh
                                    )} {/* Kết thúc điều kiện hiển thị ảnh */}
                                    <div className="col-sm-8 d-flex flex-column justify-content-between"> {/* Cột chứa thông tin bài viết chiếm 8/12 chiều rộng */}
                                        <div className="card-body p-3"> {/* Thân card bài viết */}
                                            <div className="mb-2"> {/* Nhóm hiển thị danh mục bài viết */}
                                                <span className="badge px-2 py-1 rounded font-weight-bold text-uppercase" style={{ backgroundColor: '#F8F6F2', color: 'var(--zeychic-primary)', fontSize: '0.68rem', letterSpacing: '0.5px' }}>{post.categoryName}</span> {/* Badge danh mục */}
                                            </div> {/* Kết thúc nhóm danh mục */}
                                            <h5 className="card-title font-weight-bold mb-2" style={{ fontSize: '0.98rem', lineHeight: '1.4' }}> {/* Tiêu đề bài viết */}
                                                <Link to={`/post/${post.id}`} className="text-dark text-decoration-none hover-link" style={{ transition: 'color 0.2s' }}> {/* Liên kết dẫn tới trang chi tiết bài viết */}
                                                    {post.title} {/* Hiển thị tiêu đề bài viết */}
                                                </Link> {/* Kết thúc thẻ liên kết */}
                                            </h5> {/* Kết thúc tiêu đề */}
                                            <p className="card-text text-muted small mb-0" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}> {/* Đoạn tóm tắt bài viết giới hạn 2 dòng */}
                                                {post.shortDescription || 'Đọc cẩm nang thời trang ZeyChíc để cập nhật những mẹo phối đồ sang trọng, giúp tôn vinh vẻ đẹp của phụ nữ Việt Nam...'} {/* Hiển thị mô tả hoặc text thay thế nếu rỗng */}
                                            </p> {/* Kết thúc thẻ đoạn văn mô tả */}
                                        </div> {/* Kết thúc card-body */}
                                        <div className="card-footer bg-transparent border-top-0 px-3 pb-3 pt-0 d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}> {/* Phần chân card bài viết hiển thị ngày đăng */}
                                            <span> {/* Thẻ bao ngày đăng */}
                                                <i className="fa-regular fa-calendar mr-1"></i> {/* Icon lịch */}
                                                {/* Chuyển định dạng ngày giờ của .NET thô thành cấu trúc ngày/tháng/năm của Việt Nam */}
                                                {new Date(post.createdDate).toLocaleDateString('vi-VN')} {/* Ngày đăng thuần Việt */}
                                            </span> {/* Kết thúc thẻ bao ngày đăng */}
                                            <Link to={`/post/${post.id}`} className="font-weight-bold text-uppercase" style={{ color: 'var(--zeychic-primary)', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Chi tiết <i className="fa-solid fa-arrow-right-long ml-1"></i></Link> {/* Nút liên kết chi tiết */}
                                        </div> {/* Kết thúc khối thông tin chân bài viết */}
                                    </div> {/* Kết thúc phần cột thông tin */}
                                </div> {/* Kết thúc dòng ngang */}
                            </div> {/* Kết thúc card */}
                        </div> // Kết thúc cột bài viết
                    )) // Kết thúc vòng lặp bài viết
                } {/* Kết thúc khối lặp dữ liệu */}
                </div> // Kết thúc div row
            )} {/* Kết thúc khối biểu thức điều kiện */}
        </div> // Kết thúc div mb-5 bao ngoài
    ); // Kết thúc hàm return giao diện
}; // Kết thúc định nghĩa component PostList

export default PostList; // Xuất mặc định component PostList để có thể import sử dụng ở các tệp tin khác
