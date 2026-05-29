/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Component hiển thị danh sách các sản phẩm thời trang cao cấp dạng lưới theo phong cách Thiều Hoa
Ngay thuc hien: 15/05/2026
*/

import React, { useState, useEffect } from 'react'; // Nhập React và các hooks useState, useEffect từ React
import productService from '../services/productService'; // Nhập lớp dịch vụ gọi API sản phẩm từ Backend

const ProductList = ({ selectedCategoryId, customFilterType }) => { // Định nghĩa component nhận prop selectedCategoryId và customFilterType từ component cha
    const [products, setProducts] = useState([]); // Khai báo state products lưu trữ danh sách sản phẩm, mặc định rỗng
    const [loading, setLoading] = useState(true); // Khai báo state loading quản lý trạng thái tải dữ liệu

    useEffect(() => { // Tải dữ liệu tự động mỗi khi selectedCategoryId hoặc customFilterType thay đổi
        const fetchProducts = async () => { // Định nghĩa hàm bất đồng bộ tải sản phẩm
            try { // Khối bắt đầu try
                setLoading(true); // Kích hoạt trạng thái loading hiển thị vòng chờ
                let data; // Khai báo biến chứa dữ liệu sản phẩm
                if (selectedCategoryId !== null && selectedCategoryId !== undefined) { // Nếu có mã danh mục cụ thể được chọn từ menu
                    data = await productService.getProductsByCategory(selectedCategoryId); // Tải sản phẩm theo danh mục tương ứng
                } else { // Ngược lại nếu xem tất cả hoặc xem danh mục đặc biệt
                    data = await productService.getAllProducts(); // Tải tất cả các sản phẩm từ database
                    if (customFilterType === 'new') { // Nếu người dùng chọn xem sản phẩm mới (New arrival)
                        data = [...data].reverse(); // Đảo ngược mảng để sản phẩm thêm sau (ID lớn) hiện lên trước
                    } else if (customFilterType === 'sale') { // Nếu chọn xem sản phẩm đang giảm giá (Sale Off)
                        data = data.filter(p => p.discountPercent > 0); // Lọc các sản phẩm có phần trăm giảm giá > 0
                    } // Kết thúc lọc điều kiện đặc biệt
                } // Kết thúc khối điều kiện phân loại tải
                setProducts(data); // Cập nhật mảng sản phẩm lấy được vào state products
            } catch (error) { // Bắt lỗi trong khối catch nếu xảy ra sự cố
                console.error("Lỗi khi tải danh sách sản phẩm:", error); // In lỗi chi tiết ra console F12
            } finally { // Khối luôn chạy sau khi xong xử lý try/catch
                setLoading(false); // Đặt trạng thái loading về false để tắt thông báo chờ
            } // Kết thúc khối finally
        }; // Kết thúc định nghĩa hàm fetchProducts

        fetchProducts(); // Thực thi hàm tải sản phẩm
    }, [selectedCategoryId, customFilterType]); // Chạy lại hiệu ứng mỗi khi danh mục hoặc bộ lọc thay đổi


    if (loading) { // Nếu trạng thái loading đang là true
        return <div className="text-center my-4 text-muted">Đang tải sản phẩm thời trang thiết kế...</div>; // Trả về giao diện thông báo chờ tải dữ liệu
    } // Kết thúc điều kiện kiểm tra loading

    return ( // Trả về cấu trúc giao diện JSX của lưới sản phẩm
        <div className="row"> {/* Khởi tạo hàng lưới grid của Bootstrap */}
            {products.length === 0 ? ( // Kiểm tra nếu danh sách sản phẩm trống
                <div className="col-12"> {/* Ô bao bọc chiếm toàn bộ chiều rộng hàng */}
                    <p className="text-muted text-center py-4"> {/* Thẻ hiển thị dòng văn bản căn giữa màu xám */}
                        {selectedCategoryId === null 
                            ? "Chưa có sản phẩm thời trang nào trong hệ thống." // Thông báo khi xem tất cả sản phẩm
                            : "Danh mục này hiện chưa có sản phẩm."} {/* Thông báo riêng khi chọn danh mục chưa có sản phẩm */}
                    </p> {/* Kết thúc thẻ hiển thị */}
                </div> // Kết thúc ô bao bọc
            ) : ( // Ngược lại nếu mảng chứa dữ liệu sản phẩm từ database
                products.map((item) => ( // Duyệt mảng sản phẩm để tạo các card hiển thị tương ứng
                    <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={item.id}> {/* Mỗi dòng hiển thị 4 sản phẩm trên màn hình máy tính */}
                        <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden transition-all hover-card" style={{ backgroundColor: 'var(--thieuhoa-card-bg)' }}> {/* Thẻ card bo góc, đổ bóng mờ, nền trắng */}
                            {/* Khung chứa ảnh sản phẩm thời trang thiết kế */}
                            <div className="position-relative overflow-hidden" style={{ height: '260px', backgroundColor: '#F8F6F2' }}> {/* Khung giới hạn chiều cao ảnh nền xám kem */}
                                {item.imageUrl ? ( // Nếu sản phẩm có chứa đường dẫn hình ảnh từ CSDL
                                    <img // Ảnh chính sản phẩm
                                        src={item.imageUrl} // Gán đường dẫn ảnh lấy được từ API
                                        className="w-100 h-100 hover-zoom" // Ảnh rộng 100%, tự động phóng to mượt mà khi di chuột
                                        alt={item.name} // Nhãn mô tả ảnh bằng tên sản phẩm
                                        style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} // Ảnh vừa khít khung, hiệu ứng phóng to chậm 0.4 giây
                                    /> // Kết thúc thẻ img
                                ) : ( // Ngược lại nếu không có ảnh từ cơ sở dữ liệu
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted"> {/* Tạo khung trống thông báo không có hình ảnh */}
                                        <i className="fa-regular fa-image" style={{ fontSize: '3rem', opacity: 0.3 }}></i> {/* Biểu tượng ảnh trống */}
                                    </div> // Kết thúc khung trống
                                )} {/* Kết thúc biểu thức điều kiện hiển thị ảnh */}
                                {/* Badge nhãn NEW ở bên trái ảnh */}
                                <span className="position-absolute badge badge-dark px-2 py-1 small font-weight-bold text-uppercase" style={{ top: '10px', left: '10px', backgroundColor: '#111111', fontSize: '0.65rem', letterSpacing: '0.5px' }}>NEW</span> {/* Badge hàng mới */}
                                {/* Badge phần trăm giảm giá hiển thị động theo DiscountPercent */}
                                {item.discountPercent > 0 && (
                                    <span className="position-absolute badge badge-danger px-2 py-1 font-weight-bold" style={{ top: '10px', right: '10px', backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.7rem', borderRadius: '4px' }}>-{item.discountPercent}%</span>
                                )}
                            </div> {/* Kết thúc khung chứa ảnh */}

                            {/* Thân card chứa thông tin sản phẩm */}
                            <div className="card-body p-3 d-flex flex-column justify-content-between"> {/* Card-body phân bổ không gian đều */}
                                <div> {/* Nhóm tiêu đề và giá sản phẩm */}
                                    {/* Nhãn hiệu phụ nhỏ đặc trưng của Thiều Hoa phía trên tiêu đề */}
                                    <div className="small text-uppercase font-weight-bold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '1px', color: 'var(--thieuhoa-gold) !important' }}>THIỀU HOA DESIGN</div> {/* Nhãn hiệu phụ */}
                                    <h5 className="card-title font-weight-bold text-dark mb-2" style={{ fontSize: '0.92rem', lineHeight: '1.4', height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</h5> {/* Tên sản phẩm giới hạn 2 dòng tránh vỡ khung */}
                                    {/* Hiển thị giá khuyến mãi và giá gốc gạch ngang nếu có giảm giá */}
                                    <div className="d-flex align-items-center mb-2" style={{ gap: '8px' }}> {/* Căn hàng ngang giá cũ và mới */}
                                        <span className="font-weight-bold" style={{ fontSize: '1.05rem', color: 'var(--thieuhoa-primary)' }}> {/* Giá hiển thị */}
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)} {/* Định dạng VND */}
                                        </span> {/* Kết thúc giá mới */}
                                        {item.discountPercent > 0 && (
                                            <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.85rem', textDecoration: 'line-through' }}> {/* Giá gốc gạch ngang màu xám */}
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} {/* Giá gốc gạch ngang */}
                                            </span> /* Kết thúc giá gốc */
                                        )}
                                    </div> {/* Kết thúc dòng hiển thị giá */}

                                    {/* Ô vòng tròn hiển thị tùy chọn màu sắc giống như Thiều Hoa Web */}
                                    <div className="d-flex align-items-center mb-2" style={{ gap: '5px' }}> {/* Hiển thị các ô màu sắc sản phẩm */}
                                        <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#e28743', cursor: 'pointer' }} title="Màu cam đất"></span> {/* Màu cam đất */}
                                        <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#1e3d59', cursor: 'pointer' }} title="Màu xanh navy"></span> {/* Xanh navy */}
                                        <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#111111', cursor: 'pointer' }} title="Màu đen sang trọng"></span> {/* Màu đen */}
                                    </div> {/* Kết thúc dòng màu sắc */}
                                </div> {/* Kết thúc nhóm tiêu đề và giá */}
                                <p className="card-text small text-muted mt-2 mb-0" style={{ fontSize: '0.78rem' }}> {/* Hiển thị số lượng sản phẩm tồn kho */}
                                    <i className="fa-solid fa-boxes-stacked mr-1"></i> Số lượng tồn kho: {item.stockQuantity ?? item.stock} sản phẩm {/* Tồn kho với fallback thuộc tính */}
                                </p> {/* Kết thúc hiển thị tồn kho */}
                            </div> {/* Kết thúc card-body */}

                            {/* Chân card chứa nút bấm */}
                            <div className="card-footer bg-transparent border-top-0 px-3 pb-3 pt-0"> {/* Phần chân thẻ card không viền */}
                                <button className="btn btn-outline-thieuhoa btn-block btn-sm rounded-pill font-weight-bold transition-all"> {/* Nút bấm mua hàng bo tròn kiểu pill viền đỏ nâu */}
                                    <i className="fa-solid fa-cart-plus mr-1"></i> Thêm vào giỏ {/* Icon thêm vào giỏ và nhãn nút */}
                                </button> {/* Kết thúc button */}
                            </div> {/* Kết thúc card-footer */}
                        </div> {/* Kết thúc card */}
                    </div> // Kết thúc cột lưới sản phẩm
                )) // Kết thúc vòng lặp map
            )} {/* Kết thúc khối biểu thức điều kiện */}
        </div> // Kết thúc div row bao ngoài
    ); // Kết thúc hàm return giao diện
}; // Kết thúc định nghĩa component ProductList

export default ProductList; // Xuất mặc định component ProductList để sử dụng trong App.jsx
