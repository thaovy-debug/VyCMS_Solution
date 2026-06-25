/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Component hiển thị danh sách các sản phẩm thời trang cao cấp dạng lưới theo phong cách Thiều Hoa
Ngay thuc hien: 15/05/2026
*/

import React, { useState, useEffect } from 'react'; // Nhập React và các hooks useState, useEffect từ React
import { Link } from 'react-router-dom';
import productService from '../services/productService'; // Nhập lớp dịch vụ gọi API sản phẩm từ Backend
import ProductCard from './ProductCard'; // Nhập component thẻ sản phẩm

const ProductList = ({ selectedCategoryId, customFilterType, searchQuery, minPrice, maxPrice, selectedSize, selectedColor, onAvailableFiltersChange }) => { // Định nghĩa component nhận prop selectedCategoryId và customFilterType từ component cha
    const [products, setProducts] = useState([]); // Khai báo state products lưu trữ danh sách sản phẩm, mặc định rỗng
    const [loading, setLoading] = useState(true); // Khai báo state loading quản lý trạng thái tải dữ liệu
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const itemsPerPage = 8; // Số sản phẩm trên mỗi trang

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
                        data = data.filter(p => p.isNew);
                        data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)); // Sắp xếp sản phẩm mới nhất lên đầu
                    } else if (customFilterType === 'sale') { // Nếu chọn xem sản phẩm đang giảm giá (Sale Off)
                        data = data.filter(p => p.discountPercent > 0); // Lọc các sản phẩm có phần trăm giảm giá > 0
                    } else if (customFilterType === 'hot') {
                        data = data.filter(p => p.isHot); // Bán chạy: Lọc theo cờ IsHot
                    } // Kết thúc lọc điều kiện đặc biệt
                } // Kết thúc khối điều kiện phân loại tải
                // Lọc theo từ khóa tìm kiếm
                if (searchQuery) {
                    data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                }
                
                // Lọc theo giá tối thiểu
                if (minPrice !== null && minPrice !== undefined) {
                    data = data.filter(p => (p.discountPercent > 0 ? p.price * (1 - p.discountPercent / 100) : p.price) >= minPrice);
                }
                
                // Lọc theo giá tối đa
                if (maxPrice !== null && maxPrice !== undefined) {
                    data = data.filter(p => (p.discountPercent > 0 ? p.price * (1 - p.discountPercent / 100) : p.price) <= maxPrice);
                }

                // Trích xuất các bộ lọc có sẵn trước khi áp dụng
                if (onAvailableFiltersChange) {
                    const sizesSet = new Set();
                    const colorsMap = new Map();

                    data.forEach(p => {
                        if (p.sizes) {
                            p.sizes.split(',').forEach(s => sizesSet.add(s.trim()));
                        }
                        if (p.colors) {
                            try {
                                const colorsArr = JSON.parse(p.colors);
                                colorsArr.forEach(c => {
                                    if (!colorsMap.has(c.name)) colorsMap.set(c.name, c);
                                });
                            } catch (e) { }
                        }
                    });

                    onAvailableFiltersChange({
                        sizes: Array.from(sizesSet).filter(s => s),
                        colors: Array.from(colorsMap.values())
                    });
                }

                // Lọc theo kích thước
                if (selectedSize) {
                    data = data.filter(p => p.sizes && p.sizes.includes(selectedSize));
                }

                // Lọc theo màu sắc
                if (selectedColor) {
                    data = data.filter(p => {
                        if (!p.colors) return false;
                        try {
                            const colorsArr = JSON.parse(p.colors);
                            return colorsArr.some(c => c.name === selectedColor);
                        } catch(e) {
                            return p.colors.includes(selectedColor);
                        }
                    });
                }

                setProducts(data); // Cập nhật mảng sản phẩm lấy được vào state products
            } catch (error) { // Bắt lỗi trong khối catch nếu xảy ra sự cố
                console.error("Lỗi khi tải danh sách sản phẩm:", error); // In lỗi chi tiết ra console F12
            } finally { // Khối luôn chạy sau khi xong xử lý try/catch
                setLoading(false); // Đặt trạng thái loading về false để tắt thông báo chờ
            } // Kết thúc khối finally
        }; // Kết thúc định nghĩa hàm fetchProducts

        fetchProducts(); // Thực thi hàm tải sản phẩm
    }, [selectedCategoryId, customFilterType, searchQuery, minPrice, maxPrice, selectedSize, selectedColor]); // Chạy lại hiệu ứng mỗi khi danh mục hoặc bộ lọc thay đổi

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (loading) { // Nếu trạng thái loading đang là true
        return <div className="text-center my-4 text-muted">Đang tải sản phẩm thời trang thiết kế...</div>; // Trả về giao diện thông báo chờ tải dữ liệu
    } // Kết thúc điều kiện kiểm tra loading

    return ( // Trả về cấu trúc giao diện JSX của lưới sản phẩm
        <div className="row"> {/* Khởi tạo hàng lưới grid của Bootstrap */}
            {products.length === 0 ? ( // Kiểm tra nếu danh sách sản phẩm trống
                <div className="col-12 text-center py-5">
                    <img 
                        src="https://thieuhoa.com.vn/wp-content/uploads/2024/03/empty-product.png" 
                        alt="Không tìm thấy sản phẩm" 
                        style={{ maxWidth: '200px', opacity: 0.6 }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p className="text-muted mt-4 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                        Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn
                    </p>
                    <button className="btn btn-outline-thieuhoa mt-2 rounded-pill px-4" onClick={() => window.location.href='/san-pham'}>
                        Xem tất cả sản phẩm
                    </button>
                </div>
            ) : ( // Ngược lại nếu mảng chứa dữ liệu sản phẩm từ database
                currentProducts.map((item) => ( // Duyệt mảng sản phẩm hiện tại để tạo các card hiển thị tương ứng
                    <ProductCard key={item.id} item={item} colClass="col-lg-4 col-md-6 mb-4" />
                )) // Kết thúc vòng lặp map
            )} {/* Kết thúc khối biểu thức điều kiện */}
            
            {/* Thanh điều hướng phân trang */}
            {totalPages > 1 && (
                <div className="col-12 mt-4 d-flex justify-content-center">
                    <nav>
                        <ul className="pagination" style={{ gap: '5px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button 
                                        className="page-link shadow-none" 
                                        style={currentPage === i + 1 ? { backgroundColor: 'var(--thieuhoa-primary)', borderColor: 'var(--thieuhoa-primary)', color: 'white' } : { color: 'var(--thieuhoa-primary)' }}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}
        </div> // Kết thúc div row bao ngoài
    ); // Kết thúc hàm return giao diện
}; // Kết thúc định nghĩa component ProductList

export default ProductList; // Xuất mặc định component ProductList để sử dụng trong App.jsx
