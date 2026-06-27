/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Component hiển thị danh mục sản phẩm theo phong cách tối giản và tinh tế của ZeyChíc
Ngay thuc hien: 15/05/2026
*/

import React, { useState, useEffect } from 'react'; // Nhập React và các hooks useState, useEffect
import categoryProductService from '../services/categoryProductService'; // Nhập lớp dịch vụ gọi API danh mục sản phẩm

const CategoryProductList = ({ selectedCategoryId, onSelectCategory }) => { // Định nghĩa component nhận hai props điều phối việc chọn danh mục
    // Khai báo state lưu trữ mảng danh mục nhận về từ cơ sở dữ liệu
    const [categoryProducts, setCategoryProducts] = useState([]); // State danh mục sản phẩm
    const [loading, setLoading] = useState(true); // State quản lý hiệu ứng loading
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => { // Tải danh mục tự động khi component được khởi chạy lần đầu
        const fetchCategoryProducts = async () => { // Hàm bất đồng bộ tải dữ liệu từ Backend
            try { // Khối bắt đầu try
                setLoading(true); // Kích hoạt trạng thái loading hiển thị hiệu ứng chờ
                const data = await categoryProductService.getAllCategoryProducts(); // Chờ lấy dữ liệu từ API service
                setCategoryProducts(data); // Cập nhật mảng danh mục nhận được vào state
            } catch (error) { // Khối catch để bắt lỗi nếu có
                console.error("Lỗi khi tải danh mục sản phẩm:", error); // Log lỗi chi tiết
            } finally { // Khối luôn thực hiện cuối cùng
                setLoading(false); // Tắt trạng thái loading
            } // Kết thúc khối finally
        }; // Kết thúc định nghĩa hàm fetchCategoryProducts

        fetchCategoryProducts(); // Thực thi hàm tải danh mục
    }, []); // Mảng phụ thuộc rỗng đảm bảo chỉ gọi hàm một lần duy nhất

    if (loading) { // Nếu trạng thái loading đang hoạt động
        return <div className="text-center my-4 text-muted">Đang tải danh mục thời trang...</div>; // Trả về giao diện thông báo chờ tải dữ liệu
    } // Kết thúc kiểm tra loading

    return ( // Trả về giao diện cấu trúc danh mục sản phẩm
        <div className="card border-0 shadow-sm mb-4">
            <div 
                className="card-header bg-white font-weight-bold text-uppercase py-3 d-flex justify-content-between align-items-center" 
                style={{ color: 'var(--zeychic-primary)', borderBottom: '2px solid var(--zeychic-primary)', cursor: 'pointer' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span><i className="fa-solid fa-shirt mr-2"></i> Danh mục sản phẩm</span>
                <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`}></i>
            </div>
            {isOpen && (
                <div className="card-body p-0"> {/* Thân card không sử dụng padding mặc định */}
                    <div className="list-group list-group-flush"> {/* Tạo nhóm danh sách viền phẳng sạch sẽ */}
                        
                        {/* Nút bấm để chọn Tất cả sản phẩm */}
                        <button // Tạo nút bấm Tất cả sản phẩm
                            type="button" // Đặt kiểu phần tử là button
                            onClick={() => onSelectCategory(null)} // Gọi hàm callback truyền giá trị null lên component cha khi bấm để hiển thị hết sản phẩm
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3 transition-all" // Class hover mượt của danh sách
                            style={{
                                fontSize: '0.92rem', // Kích thước chữ
                                color: selectedCategoryId === null ? 'var(--zeychic-primary)' : '#333333', // Đổi màu chữ đỏ nâu nếu được chọn là Tất cả
                                backgroundColor: selectedCategoryId === null ? 'rgba(83, 30, 24, 0.05)' : 'transparent', // Nền đỏ nâu nhạt nếu được chọn là Tất cả
                                borderBottom: '1px solid #f2f0eb', // Gạch dưới mỏng phân cách
                                borderLeft: selectedCategoryId === null ? '4px solid var(--zeychic-primary)' : '4px solid transparent', // Viền bên trái màu đỏ nâu nếu chọn là Tất cả
                                transition: 'all 0.2s ease-in-out' // Hiệu ứng chuyển động mượt
                            }} // Kết thúc style
                        > {/* Kết thúc thẻ mở button */}
                            <span className="font-weight-bold">Tất cả sản phẩm</span> {/* Nhãn chữ Tất cả sản phẩm in đậm */}
                            <i className="fa-solid fa-angle-right text-muted" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i> {/* Mũi tên góc nhọn sang phải nhỏ tinh tế */}
                        </button> {/* Kết thúc thẻ button Tất cả sản phẩm */}

                        {categoryProducts.length === 0 ? ( // Kiểm tra mảng danh mục có trống không
                            <div className="p-4 text-center text-muted">Không có danh mục nào.</div> // Hiển thị thông báo rỗng
                        ) : ( // Ngược lại nếu có dữ liệu danh mục từ database
                            categoryProducts.map((item) => ( // Duyệt mảng tạo nút cho từng danh mục
                                <button // Tạo nút bấm đại diện danh mục
                                    key={item.id} // Gán khoá định danh duy nhất trong React cho nút bấm
                                    type="button" // Đặt kiểu phần tử là button
                                    onClick={() => onSelectCategory(item.id)} // Gọi hàm callback truyền id danh mục lên component cha khi bấm
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3 transition-all" // Class hover mượt của danh sách
                                    style={{
                                        fontSize: '0.92rem', // Kích thước chữ
                                        color: item.id === selectedCategoryId ? 'var(--zeychic-primary)' : '#333333', // Đổi màu chữ đỏ nâu nếu được chọn
                                        backgroundColor: item.id === selectedCategoryId ? 'rgba(83, 30, 24, 0.05)' : 'transparent', // Nền đỏ nâu nhạt nếu chọn
                                        borderBottom: '1px solid #f2f0eb', // Gạch dưới mỏng
                                        borderLeft: item.id === selectedCategoryId ? '4px solid var(--zeychic-primary)' : '4px solid transparent', // Viền trái đỏ nâu nổi bật nếu chọn
                                        transition: 'all 0.2s ease-in-out' // Hiệu ứng chuyển động mượt
                                    }} // Kết thúc style
                                > {/* Kết thúc thẻ mở button */}
                                    <span className="font-weight-bold">{item.name}</span> {/* Tên danh mục in đậm nhẹ */}
                                    <i className="fa-solid fa-angle-right text-muted" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i> {/* Mũi tên góc nhọn sang phải nhỏ tinh tế */}
                                </button> // Kết thúc thẻ button danh mục
                            )) // Kết thúc vòng lặp map
                        )} {/* Kết thúc khối biểu thức điều kiện */}
                    </div> {/* Kết thúc thẻ bao list-group */}
                </div> /* Kết thúc thân card-body */
            )}

        </div> // Kết thúc card danh mục
    ); // Kết thúc hàm return giao diện
}; // Kết thúc định nghĩa component CategoryProductList

export default CategoryProductList; // Xuất mặc định component để import sử dụng ở các tệp tin khác

