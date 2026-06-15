/*
Sinh vien:Nguyễn Quỳnh Thảo Vy
Ma sv: 2123110158
Lop:CCQ2311E
Mo ta: Component chính App tích hợp toàn bộ giao diện Thiều Hoa kết nối Database API, đảm bảo giao diện sang trọng, chuyên nghiệp
Ngay thuc hien: 15/05/2026
*/

import React, { useState, useEffect } from 'react'; // Nhập React và các hooks quản lý trạng thái
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import CategoryProductList from './components/CategoryProductList'; // Nhập component danh sách danh mục sản phẩm từ CSDL
import ProductList from './components/ProductList'; // Nhập component danh sách sản phẩm thời trang từ CSDL
import PostList from './components/PostList'; // Nhập component danh sách bài viết blog từ CSDL
import ProductCard from './components/ProductCard'; // Nhập component thẻ sản phẩm
import categoryProductService from './services/categoryProductService'; // Nhập dịch vụ lấy danh mục sản phẩm từ Backend
import productService from './services/productService'; // Nhập dịch vụ lấy sản phẩm từ Backend CSDL
import bannerService from './services/bannerService'; // Nhập dịch vụ lấy banner
import menuService from './services/menuService'; // Nhập dịch vụ lấy menu
import logoImg from './assets/imgs/logo.png'; // Logo hình ảnh
import './App.css'; // Nhập tệp cấu hình CSS giao diện bổ trợ của Thiều Hoa

function App() { // Định nghĩa component chính App của dự án
    // Khai báo state để chứa danh mục phục vụ hiển thị trên Menu ngang
    const [categories, setCategories] = useState([]); // Khởi tạo state categories và hàm setCategories
    const [menus, setMenus] = useState([]); // State chứa các menu động từ database
    const [cartCount, setCartCount] = useState(() => {
        const customer = JSON.parse(localStorage.getItem('customer'));
        const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    });

    useEffect(() => {
        const updateCartCount = () => {
            const customer = JSON.parse(localStorage.getItem('customer'));
            const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';
            const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
        };
        window.addEventListener('cartUpdated', updateCartCount);
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, []);

    const handleAddToCart = (product) => {
        const customer = JSON.parse(localStorage.getItem('customer'));
        const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';
        const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existing = currentCart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            currentCart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem(cartKey, JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    };
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Khai báo state selectedCategoryId lưu trữ mã danh mục đang lọc (mặc định null hiển thị tất cả)
    const [customFilterType, setCustomFilterType] = useState(null); // Bộ lọc loại danh mục tự định nghĩa (new, sale, hot, gift)
    const [allProducts, setAllProducts] = useState([]); // Lưu trữ danh sách toàn bộ sản phẩm phục vụ hiển thị trang chủ theo cụm
    const [loadingAll, setLoadingAll] = useState(false); // Quản lý trạng thái tải toàn bộ sản phẩm
    const [banners, setBanners] = useState([]); // State lưu danh sách banners
    const [customer, setCustomer] = useState(() => JSON.parse(localStorage.getItem('customer')) || null); // Tài khoản đăng nhập
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/san-pham?search=${encodeURIComponent(searchInput.trim())}`);
            setSearchInput('');
        }
    };

    useEffect(() => { // Tự động chạy tải danh mục để hiển thị lên thanh điều hướng chính
        const loadMenuCategories = async () => { // Định nghĩa hàm bất đồng bộ loadMenuCategories
            try { // Khối bắt đầu try
                const data = await categoryProductService.getAllCategoryProducts(); // Chờ lấy dữ liệu danh mục từ API service
                setCategories(data); // Đưa danh mục lấy được vào state categories
            } catch (error) { // Bắt lỗi trong khối catch nếu xảy ra sự cố
                console.error("Lỗi khi tải danh mục làm menu:", error); // In lỗi chi tiết ra console phục vụ kiểm tra
            } // Kết thúc khối try-catch
        }; // Kết thúc định nghĩa hàm loadMenuCategories

        const loadAllProducts = async () => { // Định nghĩa hàm tải toàn bộ sản phẩm thời trang
            try { // Khối bắt đầu try
                setLoadingAll(true); // Đặt trạng thái tải là true
                const data = await productService.getAllProducts(); // Gọi API lấy toàn bộ sản phẩm
                setAllProducts(data); // Lưu dữ liệu vào state allProducts
            } catch (error) { // Bắt lỗi
                console.error("Lỗi khi tải toàn bộ sản phẩm:", error); // In ra console
            } finally { // Khối luôn chạy
                setLoadingAll(false); // Đặt trạng thái tải là false
            } // Kết thúc khối finally
        }; // Kết thúc định nghĩa hàm loadAllProducts

        const loadBanners = async () => {
            try {
                const data = await bannerService.getAllBanners();
                setBanners(data);
            } catch (err) {
                console.error("Lỗi khi tải banners:", err);
            }
        };

        const loadMenus = async () => {
            try {
                const data = await menuService.getAllMenus();
                setMenus(data);
            } catch (err) {
                console.error("Lỗi khi tải menus:", err);
            }
        };

        loadMenuCategories(); // Thực thi hàm tải danh mục làm menu
        loadAllProducts(); // Thực thi tải sản phẩm
        loadBanners(); // Thực thi tải banner
        loadMenus(); // Thực thi tải menu động
    }, []); // Chỉ chạy 1 lần khi render

    const handleCategoryClick = (keyword) => { // Định nghĩa hàm chuyển bộ lọc khi click danh mục phụ trong mega menu
        if (!keyword) { // Nếu không có từ khóa danh mục
            setSelectedCategoryId(null); // Trở về xem tất cả
            setCustomFilterType(null); // Tắt bộ lọc đặc biệt
        } else { // Ngược lại nếu có từ khóa
            const cat = categories.find(c => c.name.toLowerCase().includes(keyword.toLowerCase())); // Tìm danh mục khớp với từ khóa
            if (cat) { // Nếu tìm thấy danh mục
                setSelectedCategoryId(cat.id); // Chọn danh mục đó
                setCustomFilterType(null); // Tắt bộ lọc đặc biệt
            } else { // Nếu không tìm thấy
                setSelectedCategoryId(null); // Mặc định về null
                setCustomFilterType(null); // Mặc định tắt bộ lọc đặc biệt
            } // Kết thúc kiểm tra
        } // Kết thúc kiểm tra keyword
    }; // Kết thúc định nghĩa hàm handleCategoryClick

    const getCategoryBannerInfo = () => { // Hàm trả về thông tin banner của danh mục
        let bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/04/web.webp"; // Link banner mặc định
        let title = "Thời Trang Trung Niên"; // Tiêu đề mặc định
        let desc = "Xu hướng thời trang trung niên cao cấp, tôn vinh vẻ đẹp mặn mà của phái đẹp Việt."; // Mô tả mặc định

        if (selectedCategoryId !== null) { // Nếu đang chọn một danh mục cụ thể từ database
            const catName = categories.find(c => c.id === selectedCategoryId)?.name || ""; // Tìm tên danh mục
            title = catName; // Gán tiêu đề bằng tên danh mục
            if (catName.includes("Đầm")) { // Nếu là đầm
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp";
                desc = "Bộ sưu tập đầm trung niên dáng suông, đầm xòe, đầm dự tiệc thêu hoa sang trọng che khuyết điểm.";
            } else if (catName.includes("Áo")) { // Nếu là áo
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/ao-kieu-trung-nien.webp";
                desc = "Các thiết kế áo kiểu trung niên, áo thun in, áo sơ mi lụa mềm mại mang lại sự thoải mái tự tin.";
            } else if (catName.includes("Bộ")) { // Nếu là đồ bộ
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/do-bo-trung-nien-thieu-hoa.webp";
                desc = "Thiết kế đồ bộ mặc nhà, dạo phố rộng rãi mát mẻ từ chất liệu thun cotton, lụa satin tơ tằm.";
            } else if (catName.includes("Túi")) { // Nếu là túi xách
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/tui-xach-camie-thieu-hoa.webp";
                desc = "Dòng túi xách Camie thiết kế thanh lịch, phụ kiện hoàn hảo cho set đồ trung niên quý phái.";
            } else if (catName.includes("Khăn")) { // Nếu là khăn
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/khan-choang-co-thieu-hoa.webp";
                desc = "Khăn choàng cổ lụa tơ tằm, khăn len cashmere giữ ấm và làm điểm nhấn quý phái cho trang phục.";
            } // Kết thúc lọc danh mục
        } else { // Ngược lại nếu là bộ lọc đặc biệt
            if (customFilterType === "new") { // Nếu là mới
                title = "HÀNG MỚI VỀ"; // Đặt tiêu đề
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp"; // Banner cho hàng mới
                desc = "Khám phá ngay các mẫu thiết kế quần áo, váy trung niên mới nhất vừa lên kệ của Thiều Hoa."; // Mô tả
            } else if (customFilterType === "sale") { // Nếu là sale
                title = "SALE - OFF"; // Tiêu đề
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/ao-kieu-trung-nien.webp"; // Banner sale
                desc = "Ưu đãi cực khủng lên đến 50% dành cho các sản phẩm thời trang trung niên thiết kế độc quyền."; // Mô tả
            } else if (customFilterType === "hot") { // Nếu là bán chạy
                title = "BÁN CHẠY"; // Tiêu đề
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/tui-xach-camie-thieu-hoa.webp"; // Banner hot
                desc = "Tổng hợp những mẫu đầm suông, áo kiểu được hàng ngàn khách hàng yêu thích và săn lùng."; // Mô tả
            } else if (customFilterType === "gift") { // Nếu là quà tặng mẹ
                title = "QUÀ TẶNG MẸ"; // Tiêu đề
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/khan-choang-co-thieu-hoa.webp"; // Banner quà tặng
                desc = "Gợi ý những set quà tặng ý nghĩa, tinh tế nhất gửi gắm tình yêu kính đến những người mẹ thân thương."; // Mô tả
            } // Kết thúc kiểm tra bộ lọc đặc biệt
        } // Kết thúc kiểm tra danh mục

        return { bannerUrl, title, desc }; // Trả về thông tin banner
    };

    const renderHomepageProductGrid = (productsToRender) => { // Định nghĩa hàm hỗ trợ hiển thị lưới sản phẩm trang chủ
        if (!productsToRender || productsToRender.length === 0) { // Nếu không có sản phẩm
            return ( // Trả về thông báo trống
                <div className="col-12 text-center py-4 text-muted"> {/* Căn giữa */}
                    Hiện chưa có sản phẩm mẫu nào trong danh mục này. {/* Nội dung */}
                </div> // Kết thúc
            ); // Kết thúc trả về
        } // Kết thúc kiểm tra
        return productsToRender.map((item) => ( // Lặp hiển thị các thẻ card sản phẩm
            <ProductCard key={item.id} item={item} />
        ));
    };

    return ( // Trả về cấu trúc giao diện JSX của website
        <div className="w-100 min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--thieuhoa-bg)' }}> {/* Thẻ bao bọc toàn bộ trang web full-width */}
            
            {/* PHẦN 1: THANH THÔNG BÁO KHUYẾN MÃI TRÊN CÙNG (TOP BAR) */}
            <div className="thieuhoa-topbar text-center"> {/* Thanh thông báo đỏ nâu chữ trắng nhỏ */}
                <div className="container"> {/* Khung container căn chỉnh lề */}
                    <span className="font-weight-bold"><i className="fa-solid fa-truck mr-2"></i> MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TỪ 200K | ĐƯỢC KIỂM TRA HÀNG TRƯỚC KHI THANH TOÁN</span> {/* Nội dung khuyến mãi chuẩn Thiều Hoa */}
                </div> {/* Kết thúc container */}
            </div> {/* Kết thúc thieuhoa-topbar */}

            {/* PHẦN 2: ĐẦU TRANG CHÍNH (HEADER) */}
            <header className="bg-white py-3 shadow-sm" style={{ borderBottom: '1px solid var(--thieuhoa-border)' }}> {/* Khung header trắng bóng mờ */}
                <div className="container"> {/* Khung container căn chỉnh */}
                    <div className="row align-items-center"> {/* Hàng ngang đầu tiên chứa các thành phần chính */}
                        
                        {/* Cột trái: Cửa hàng & Hotline chăm sóc khách hàng */}
                        <div className="col-md-4 d-none d-md-flex align-items-center" style={{ gap: '20px' }}> {/* Chiếm 4/12 lưới, ẩn trên mobile */}
                            {/* Hệ thống cửa hàng */}
                            <a href="/he-thong-cua-hang" className="d-flex align-items-center text-secondary text-decoration-none hover-link" style={{ fontSize: '0.85rem' }}> {/* Liên kết cửa hàng */}
                                <i className="fa-solid fa-location-dot mr-2 text-danger" style={{ fontSize: '1.1rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon định vị */}
                                <span className="font-weight-bold">Cửa hàng</span> {/* Nhãn chữ */}
                            </a> {/* Kết thúc liên kết */}

                            {/* Hotline hỗ trợ miễn phí */}
                            <div className="d-flex align-items-center text-secondary" style={{ fontSize: '0.85rem' }}> {/* Hotline */}
                                <i className="fa-solid fa-headset mr-2 text-danger" style={{ fontSize: '1.1rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon tai nghe */}
                                <span className="font-weight-bold">Hotline: <span style={{ color: 'var(--thieuhoa-primary)' }}>1800 6246</span> (Miễn Phí)</span> {/* Số điện thoại */}
                            </div> {/* Kết thúc hotline */}
                        </div> {/* Kết thúc cột trái */}

                        {/* Cột giữa: Logo thương hiệu Thiều Hoa chính thức */}
                        <div className="col-md-4 col-6 text-center"> {/* Chiếm 4/12 trên desktop, 6/12 trên mobile */}
                            <a href="/" className="d-inline-block text-decoration-none py-2"> {/* Liên kết trang chủ */}
                                <img src={logoImg} alt="Thiều Hoa - Xu Hướng Phái Đẹp" style={{ height: '85px', objectFit: 'contain' }} />
                            </a> {/* Kết thúc liên kết */}
                        </div> {/* Kết thúc cột giữa */}

                        {/* Cột phải: Tài khoản & Giỏ hàng */}
                        <div className="col-md-4 col-6 d-flex align-items-center justify-content-end" style={{ gap: '20px', fontSize: '0.85rem' }}> {/* Chiếm 4/12 trên desktop, 6/12 trên mobile */}
                            {/* Đăng nhập tài khoản thành viên */}
                            {customer ? (
                                <div className="d-flex align-items-center text-secondary hover-link" style={{ cursor: 'pointer' }} onClick={() => { if(window.confirm('Bạn có chắc muốn đăng xuất?')) { localStorage.removeItem('customer'); localStorage.removeItem('cart_guest'); setCustomer(null); window.location.href='/'; } }}>
                                    <i className="fa-solid fa-user-check mr-2 text-danger" style={{ fontSize: '1.1rem', color: 'var(--thieuhoa-primary)' }}></i>
                                    <span className="d-none d-md-inline font-weight-bold" title="Click để đăng xuất">{customer.fullName}</span>
                                </div>
                            ) : (
                                <Link to="/login" className="d-flex align-items-center text-secondary text-decoration-none hover-link"> {/* Nút liên kết đăng nhập */}
                                    <i className="fa-regular fa-user mr-2 text-danger" style={{ fontSize: '1.1rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon người dùng */}
                                    <span className="d-none d-md-inline font-weight-bold">Tài khoản</span> {/* Nhãn chữ */}
                                </Link>
                            )}

                            {/* Giỏ hàng mua sắm */}
                            <a href="/gio-hang" className="d-flex align-items-center text-dark text-decoration-none hover-link position-relative"> {/* Nút liên kết giỏ hàng */}
                                <i className="fa-solid fa-bag-shopping text-danger" style={{ fontSize: '1.3rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon túi xách */}
                                <span className="position-absolute badge badge-danger badge-pill font-weight-bold" style={{ top: '-8px', right: '-8px', backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.65rem' }}>{cartCount}</span> {/* Số lượng sản phẩm */}
                            </a> {/* Kết thúc liên kết */}
                        </div> {/* Kết thúc cột phải */}
                        
                    </div> {/* Kết thúc row */}
                </div> {/* Kết thúc container */}
            </header> {/* Kết thúc header */}

            {/* PHẦN 3: THANH NAVBAR ĐIỀU HƯỚNG CHÍNH VÀ Ô TÌM KIẾM (HORIZONTAL NAVBAR & SEARCH ROW) */}
            <nav className="thieuhoa-navbar sticky-top"> {/* Thanh menu ngang dính sát khi cuộn */}
                <div className="container"> {/* Khung container */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center py-1 py-md-0" style={{ gap: '15px' }}> {/* Flexbox bố trí ngang trên desktop, dọc trên mobile */}
                        
                        {/* Khu vực bên trái: Các danh mục/liên kết điều hướng */}
                        <div className="d-flex align-items-center overflow-visible navbar-links-container" style={{ whiteSpace: 'nowrap' }}> {/* Khung flexbox cho phép menu tràn ra ngoài để hiện dropdown */}
                            
                            {menus.map((menu) => {
                                // Kiểm tra nếu là menu Sản Phẩm thì hiển thị Mega Menu
                                if (menu.link === '/san-pham') {
                                    return (
                                        <div key={menu.id} className="mega-menu-hover"> {/* Lớp cha hover */}
                                            <Link 
                                                to={menu.link} 
                                                className={`btn thieuhoa-nav-link border-0 bg-transparent text-decoration-none mr-1 shadow-none ${selectedCategoryId === null && customFilterType === null && window.location.pathname === '/san-pham' ? 'active' : ''}`} 
                                                style={{ outline: 'none', padding: '14px 15px !important', textTransform: 'uppercase' }}
                                            >
                                                {menu.name} <i className="fa-solid fa-chevron-down ml-1" style={{ fontSize: '0.7rem' }}></i>
                                            </Link>
                                            
                                            {/* Cấu trúc Mega Menu Dropdown hiển thị danh mục từ DATABASE */}
                                            <div className="thieuhoa-mega-menu-dropdown bg-white shadow"> {/* Khung dropdown nền trắng đổ bóng */}
                                                <div className="container py-4"> {/* Khung đệm phía trong */}
                                                    <div className="row text-left"> {/* Dòng cột */}
                                                        {categories.map((cat) => (
                                                            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={cat.id}> {/* Ô cột cố định kích thước để bằng nhau */}
                                                                <div className="d-flex flex-column h-100 pr-3"> {/* Thêm padding right để tạo khoảng cách giữa các cột */}
                                                                    <Link 
                                                                        to={`/san-pham?category=${cat.id}`}
                                                                        className="font-weight-bold text-dark text-uppercase d-block" 
                                                                        style={{ fontSize: '0.85rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', textDecoration: 'none', marginBottom: '12px' }}
                                                                    >
                                                                        {cat.name}
                                                                    </Link>
                                                                    <p className="text-secondary flex-grow-1" style={{ fontSize: '0.75rem', lineHeight: '1.6', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                        {cat.description || `Khám phá các mẫu ${cat.name.toLowerCase()} mới nhất với thiết kế thanh lịch.`}
                                                                    </p>
                                                                    <Link to={`/san-pham?category=${cat.id}`} className="font-weight-bold text-dark mt-auto" style={{ fontSize: '0.75rem', textDecoration: 'none' }}>
                                                                        Xem tất cả &rarr;
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Nếu là các link thông thường
                                const isActive = (menu.link.includes('filter=') && window.location.search.includes(menu.link.split('?')[1])) || 
                                                (window.location.pathname === menu.link && menu.link !== '/');
                                return (
                                    <Link 
                                        key={menu.id}
                                        to={menu.link}
                                        className={`btn thieuhoa-nav-link border-0 bg-transparent text-decoration-none mr-1 shadow-none ${isActive ? 'active' : ''}`}
                                        style={{ outline: 'none', padding: '14px 15px !important', textTransform: 'uppercase' }}
                                    >
                                        {menu.name}
                                    </Link>
                                );
                            })}

                        </div> {/* Kết thúc menu */}

                        {/* Khu vực bên phải: Ô tìm kiếm sản phẩm thời trang thiết kế bo tròn */}
                        <div className="my-2 my-md-0" style={{ width: '280px', maxWidth: '100%' }}> {/* Chiều rộng thanh tìm kiếm */}
                            <form className="input-group" style={{ height: '36px' }} onSubmit={handleSearch}> {/* Nhóm ô nhập liệu và nút bấm */}
                                <input // Ô nhập liệu tìm kiếm
                                    type="text" // Kiểu nhập chữ
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="form-control shadow-none" // Ô nhập liệu
                                    placeholder="Tìm kiếm sản phẩm..." // Gợi ý nhập liệu
                                    style={{
                                        borderRadius: '50px 0 0 50px', // Bo tròn hai góc bên trái
                                        border: '1.5px solid var(--thieuhoa-border)', // Viền xám kem
                                        borderRight: 'none', // Bỏ viền phải
                                        fontSize: '0.85rem', // Chữ nhỏ gọn
                                        paddingLeft: '15px', // Đệm lề trái
                                        height: '100%' // Chiều cao full
                                    }}
                                /> {/* Kết thúc input */}
                                <div className="input-group-append"> {/* Khung ghép nút tìm kiếm phía sau */}
                                    <button 
                                        className="btn d-flex align-items-center justify-content-center" 
                                        type="submit"
                                        style={{
                                            backgroundColor: 'var(--thieuhoa-primary)', // Nền đỏ nâu
                                            borderColor: 'var(--thieuhoa-primary)', // Viền đỏ nâu
                                            borderRadius: '0 50px 50px 0', // Bo tròn hai góc bên phải
                                            padding: '0 16px', // Khoảng đệm ngang vừa vặn
                                            height: '100%' // Chiều cao full
                                        }}
                                    > {/* Nút bấm tìm kiếm màu đỏ đô */}
                                        <i className="fa-solid fa-magnifying-glass text-white" style={{ fontSize: '0.85rem' }}></i> {/* Icon kính lúp màu trắng */}
                                    </button> {/* Kết thúc button */}
                                </div> {/* Kết thúc append */}
                            </form> {/* Kết thúc input-group */}
                        </div> {/* Kết thúc cột tìm kiếm */}

                    </div> {/* Kết thúc flexbox */}
                </div> {/* Kết thúc container */}
            </nav> {/* Kết thúc navbar */}

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/gio-hang" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/san-pham" element={<Shop />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/" element={
                    <>
            {/* HIỂN THỊ CÁC THÀNH PHẦN QUẢNG CÁO TRANG CHỦ CHỈ KHI KHÔNG LỌC DANH MỤC HOẶC LỌC ĐẶC BIỆT */}
            {selectedCategoryId === null && customFilterType === null && (
                <>
                    {/* PHẦN 4: BANNER QUẢNG CÁO LỚN TRANG CHỦ (HERO BANNER SLIDER) */}
                    {banners && banners.length > 0 ? (
                        <div id="heroCarousel" className="carousel slide" data-ride="carousel" data-interval="2500">
                            {banners.length > 1 && (
                                <ol className="carousel-indicators">
                                    {banners.map((_, idx) => (
                                        <li key={idx} data-target="#heroCarousel" data-slide-to={idx} className={idx === 0 ? "active" : ""} style={{ backgroundColor: 'var(--thieuhoa-primary)', height: '4px', borderRadius: '4px' }}></li>
                                    ))}
                                </ol>
                            )}
                            <div className="carousel-inner">
                                {banners.map((banner, idx) => (
                                    <div key={banner.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                                        <a href="/san-pham" className="d-block" style={{ backgroundColor: '#f9fafb', textAlign: 'center' }}>
                                            <img 
                                                src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `${import.meta.env.VITE_API_URL}${banner.imageUrl}`} 
                                                className="d-inline-block" 
                                                alt={banner.title} 
                                                style={{ objectFit: 'contain', width: '100%', maxHeight: '480px' }} 
                                            />
                                        </a>
                                    </div>
                                ))}
                            </div>
                            {banners.length > 1 && (
                                <>
                                    <a className="carousel-control-prev" href="#heroCarousel" role="button" data-slide="prev" style={{ width: '5%' }}>
                                        <i className="fa-solid fa-chevron-left" style={{ fontSize: '1.8rem', color: '#333333', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}></i>
                                        <span className="sr-only">Previous</span>
                                    </a>
                                    <a className="carousel-control-next" href="#heroCarousel" role="button" data-slide="next" style={{ width: '5%' }}>
                                        <i className="fa-solid fa-chevron-right" style={{ fontSize: '1.8rem', color: '#333333', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}></i>
                                        <span className="sr-only">Next</span>
                                    </a>
                                </>
                            )}
                        </div>
                    ) : null}

            {/* PHẦN 5: CHÍNH SÁCH CAM KẾT THƯƠNG HIỆU (BRAND COMMITMENT) */}
            <section className="py-4 shadow-sm" style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid var(--thieuhoa-border)' }}> {/* Phần cam kết nền xám nhạt tăng uy tín */}
                <div className="container"> {/* Khung container */}
                    <div className="row text-center"> {/* Hàng ngang chứa các cam kết */}
                        
                        {/* Cam kết 1: Giá tốt nhất */}
                        <div className="col-lg-3 col-sm-6 mb-3 mb-lg-0 border-right" style={{ borderColor: 'var(--thieuhoa-border)' }}> {/* Cột cam kết 1 */}
                            <div className="d-flex align-items-center justify-content-center text-left px-2"> {/* Căn lề */}
                                <i className="fa-solid fa-tags text-danger mr-3" style={{ fontSize: '2rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon thẻ giá */}
                                <div> {/* Thẻ bao */}
                                    <h6 className="font-weight-bold mb-1" style={{ fontSize: '0.88rem' }}>Giá tốt nhất</h6> {/* Tiêu đề */}
                                    <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>Giảm 15% đơn hàng đầu tiên</p> {/* Mô tả */}
                                </div> {/* Kết thúc bao */}
                            </div> {/* Kết thúc d-flex */}
                        </div> {/* Kết thúc cột cam kết 1 */}

                        {/* Cam kết 2: 100% Made in Viet Nam */}
                        <div className="col-lg-3 col-sm-6 mb-3 mb-lg-0 border-right" style={{ borderColor: 'var(--thieuhoa-border)' }}> {/* Cột cam kết 2 */}
                            <div className="d-flex align-items-center justify-content-center text-left px-2"> {/* Căn lề */}
                                <i className="fa-solid fa-hand-holding-heart text-danger mr-3" style={{ fontSize: '2rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon trái tim nâng niu */}
                                <div> {/* Thẻ bao */}
                                    <h6 className="font-weight-bold mb-1" style={{ fontSize: '0.88rem' }}>100% Made in Viet Nam</h6> {/* Tiêu đề */}
                                    <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>Thử hàng và thanh toán khi nhận</p> {/* Mô tả */}
                                </div> {/* Kết thúc bao */}
                            </div> {/* Kết thúc d-flex */}
                        </div> {/* Kết thúc cột cam kết 2 */}

                        {/* Cam kết 3: Cam kết 1 đổi 1 */}
                        <div className="col-lg-3 col-sm-6 mb-3 mb-lg-0 border-right" style={{ borderColor: 'var(--thieuhoa-border)' }}> {/* Cột cam kết 3 */}
                            <div className="d-flex align-items-center justify-content-center text-left px-2"> {/* Căn lề */}
                                <i className="fa-solid fa-shield-halved text-danger mr-3" style={{ fontSize: '2rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon bảo vệ */}
                                <div> {/* Thẻ bao */}
                                    <h6 className="font-weight-bold mb-1" style={{ fontSize: '0.88rem' }}>Cam kết 1 đổi 1</h6> {/* Tiêu đề */}
                                    <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>Trong vòng 7 ngày đổi mẫu thoải mái</p> {/* Mô tả */}
                                </div> {/* Kết thúc bao */}
                            </div> {/* Kết thúc d-flex */}
                        </div> {/* Kết thúc cột cam kết 3 */}

                        {/* Cam kết 4: Giao hàng 4H */}
                        <div className="col-lg-3 col-sm-6"> {/* Cột cam kết 4 */}
                            <div className="d-flex align-items-center justify-content-center text-left px-2"> {/* Căn lề */}
                                <i className="fa-solid fa-clock text-danger mr-3" style={{ fontSize: '2rem', color: 'var(--thieuhoa-primary)' }}></i> {/* Icon đồng hồ */}
                                <div> {/* Thẻ bao */}
                                    <h6 className="font-weight-bold mb-1" style={{ fontSize: '0.88rem' }}>Giao hàng nhanh 4H</h6> {/* Tiêu đề */}
                                    <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>Nội thành Tp.HCM và Hà Nội</p> {/* Mô tả */}
                                </div> {/* Kết thúc bao */}
                            </div> {/* Kết thúc d-flex */}
                        </div> {/* Kết thúc cột cam kết 4 */}

                    </div> {/* Kết thúc row */}
                </div> {/* Kết thúc container */}
            </section> {/* Kết thúc chính sách cam kết */}

            {/* PHẦN DANH MỤC THỜI TRANG TRUNG NIÊN - 10 HỘP ĐẶC TRƯNG PHONG CÁCH THIỀU HOA */}
            <section className="py-5" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--thieuhoa-border)' }}> {/* Vùng danh mục nền trắng */}
                <div className="container"> {/* Khung container */}
                    <div className="text-center mb-4"> {/* Căn giữa tiêu đề */}
                        <h3 className="text-uppercase font-weight-bold text-dark mb-1" style={{ letterSpacing: '1px', fontSize: '1.4rem' }}>Danh Mục Sản Phẩm</h3> {/* Tiêu đề chính */}
                        <div className="mx-auto" style={{ width: '60px', height: '3px', backgroundColor: 'var(--thieuhoa-primary)' }}></div> {/* Dòng gạch dưới đỏ nâu */}
                    </div> {/* Kết thúc tiêu đề */}

                    <div className="d-flex flex-wrap justify-content-center mt-3" style={{ gap: '2rem' }}> {/* Sử dụng flexbox thay vì grid để tự động dàn đều trên 1 hàng ngang */}
                        {(() => {
                            // Sắp xếp theo thứ tự mong muốn: Đầm, Quần, Áo, Chân váy, Phụ kiện
                            const order = ["đầm", "quần", "áo", "chân váy", "phụ kiện"];
                            let sortedCategories = [];
                            
                            // Đưa các danh mục có trong DB khớp thứ tự lên đầu
                            order.forEach(keyword => {
                                const found = categories.find(c => c.name.toLowerCase() === keyword || c.name.toLowerCase().includes(keyword));
                                if (found && !sortedCategories.some(sc => sc.id === found.id)) {
                                    sortedCategories.push(found);
                                }
                            });

                            // Các danh mục khác (như Áo Khoác) xếp theo sau, TRỪ Sale
                            categories.forEach(c => {
                                if (!sortedCategories.some(sc => sc.id === c.id) && !c.name.toLowerCase().includes("sale") && !c.name.toLowerCase().includes("giảm")) {
                                    sortedCategories.push(c);
                                }
                            });

                            // Đưa danh mục Sale (từ DB) xuống cuối cùng
                            categories.forEach(c => {
                                if (!sortedCategories.some(sc => sc.id === c.id) && (c.name.toLowerCase().includes("sale") || c.name.toLowerCase().includes("giảm"))) {
                                    sortedCategories.push(c);
                                }
                            });

                            return sortedCategories.map((cat, index) => {
                                // Cấu hình hình ảnh dựa vào DB hoặc mặc định
                                let imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/04/web.webp";
                                if (cat.imageUrl) {
                                    imgUrl = cat.imageUrl.startsWith('http') ? cat.imageUrl : `${import.meta.env.VITE_API_URL}${cat.imageUrl}`;
                                } else {
                                    const nameLower = cat.name.toLowerCase();
                                    if (nameLower.includes("đầm")) imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp";
                                    else if (nameLower.includes("quần")) imgUrl = "https://file.hstatic.net/200000182297/article/quan-ong-rong-nu-cong-so_ba0dfcefc1fa4543afbe43b35123d51c.jpg";
                                    else if (nameLower.includes("áo")) imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/ao-kieu-trung-nien.webp";
                                    else if (nameLower.includes("chân váy")) imgUrl = "https://file.hstatic.net/200000182297/article/chan-vay-xep-ly-dai_2c419356d2ee4fbcbb07deaf6bb2013f.jpg";
                                    else if (nameLower.includes("phụ kiện") || nameLower.includes("túi")) imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/tui-xach-camie-thieu-hoa.webp";
                                    else if (nameLower.includes("sale")) imgUrl = "https://storage.googleapis.com/a1aa/image/eI5WqA4K2K20BS1b8XJ3WJ3rB2y2o1P1S3y2o1P1S3y2o1P.jpg"; // Ảnh icon SALE
                                    else if (nameLower.includes("bộ")) imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/do-bo-trung-nien-thieu-hoa.webp";
                                    else if (nameLower.includes("khăn")) imgUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/khan-choang-co-thieu-hoa.webp";
                                }

                                return (
                                    <div className="text-center" key={cat.id} style={{ width: '130px' }}> {/* Đặt chiều rộng cố định để các khối đều nhau */}
                                        <button 
                                            onClick={() => {
                                                if (cat.isCustom) {
                                                    setSelectedCategoryId(null);
                                                    setCustomFilterType("sale");
                                                } else {
                                                    setSelectedCategoryId(cat.id);
                                                    setCustomFilterType(null);
                                                }
                                            }}
                                            className="btn bg-transparent border-0 p-0 text-center w-100" 
                                            style={{ transition: 'transform 0.3s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        > {/* Nút bấm liên kết danh mục dạng khối tròn */}
                                            <div 
                                                className="rounded-circle overflow-hidden mx-auto mb-2 shadow-sm d-flex align-items-center justify-content-center"
                                                style={{ width: '110px', height: '110px', border: '3px solid #f2f0eb', backgroundColor: '#fff' }}
                                            >
                                                <img src={imgUrl} alt={cat.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                            </div>
                                            <span className="font-weight-bold text-dark d-block mt-2" style={{ fontSize: '0.9rem' }}>{cat.name}</span> {/* Nhãn chữ động */}
                                        </button> {/* Kết thúc nút */}
                                    </div> /* Kết thúc khối */
                                );
                            });
                        })()}
                    </div> {/* Kết thúc flexbox */}
                </div> {/* Kết thúc container */}
            </section> {/* Kết thúc phần danh mục */}
                </>
            )}

            {/* PHẦN 6: BỐ CỤC CHÍNH HIỂN THỊ DỮ LIỆU CSDL (MAIN CONTENT) */}
            <main className="container py-5 flex-grow-1"> {/* Khung chứa nội dung chính padding 5 */}
                
                {/* HIỂN THỊ TRANG DANH MỤC (BREADCRUMB & BANNER LỚN DÀNH CHO TRANG CHI TIẾT DANH MỤC HOẶC BỘ LỌC) */}
                {(selectedCategoryId !== null || customFilterType !== null) && (
                    <div className="mb-4">
                        {/* Breadcrumbs điều hướng */}
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb bg-transparent px-0 mb-3" style={{ fontSize: '0.88rem' }}>
                                <li className="breadcrumb-item">
                                    <button 
                                        type="button" 
                                        onClick={() => { setSelectedCategoryId(null); setCustomFilterType(null); }}
                                        className="btn btn-link p-0 text-muted font-weight-bold text-decoration-none"
                                        style={{ fontSize: '0.88rem' }}
                                    >
                                        Trang chủ
                                    </button>
                                </li>
                                <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">
                                    {getCategoryBannerInfo().title}
                                </li>
                            </ol>
                        </nav>

                        {/* Banner danh mục thời trang lớn tương ứng */}
                        <div className="card border-0 rounded-lg overflow-hidden mb-4 shadow-sm" style={{ backgroundColor: '#F8F6F2' }}>
                            <div className="row no-gutters align-items-center">
                                <div className="col-md-7 p-5 text-left">
                                    <span className="badge badge-danger text-uppercase px-3 py-1 font-weight-bold mb-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.7rem' }}>
                                        Bộ Sưu Tập
                                    </span>
                                    <h2 className="font-weight-bold text-dark mb-3" style={{ fontSize: '2rem' }}>{getCategoryBannerInfo().title}</h2>
                                    <p className="text-muted leading-relaxed mb-0" style={{ fontSize: '0.95rem' }}>{getCategoryBannerInfo().desc}</p>
                                </div>
                                <div className="col-md-5" style={{ height: '240px' }}>
                                    <img 
                                        src={getCategoryBannerInfo().bannerUrl} 
                                        alt={getCategoryBannerInfo().title} 
                                        className="w-100 h-100" 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 1. CHẾ ĐỘ TRANG CHỦ: HIỂN THỊ CỤM SẢN PHẨM MỚI, SALE OFF VÀ CỤM THEO DANH MỤC */}
                {selectedCategoryId === null && customFilterType === null ? (
                    <div className="w-100">
                        
                        {/* CỤM 1: HÀNG MỚI VỀ */}
                        <section id="hang-moi-ve-sec" className="mb-5 pb-3">
                            <div className="text-center mb-4">
                                <h3 className="text-uppercase font-weight-bold text-dark mb-1" style={{ letterSpacing: '1.5px', fontSize: '1.4rem' }}>HÀNG MỚI VỀ</h3>
                                <div className="mx-auto" style={{ width: '50px', height: '3px', backgroundColor: 'var(--thieuhoa-primary)' }}></div>
                            </div>
                            <div className="row">
                                {renderHomepageProductGrid([...allProducts].filter(p => p.createdDate && new Date() - new Date(p.createdDate) < 7 * 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, 4))}
                            </div>
                            <div className="text-center mt-3">
                                <button 
                                    onClick={() => setCustomFilterType("new")} 
                                    className="btn btn-thieuhoa px-4 py-2 text-uppercase font-weight-bold text-white rounded-pill shadow-sm"
                                    style={{ fontSize: '0.82rem' }}
                                >
                                    Xem Thêm
                                </button>
                            </div>
                        </section>

                        {/* CỤM 2: SALE OFF */}
                        <section className="mb-5 pb-3" style={{ backgroundColor: '#FDFBF7', padding: '30px 15px', borderRadius: '12px' }}>
                            <div className="text-center mb-4">
                                <h3 className="text-uppercase font-weight-bold text-dark mb-1" style={{ letterSpacing: '1.5px', fontSize: '1.4rem', color: 'var(--thieuhoa-primary)' }}>SALE OFF</h3>
                                <div className="mx-auto" style={{ width: '50px', height: '3px', backgroundColor: 'var(--thieuhoa-primary)' }}></div>
                            </div>
                            <div className="row">
                                {renderHomepageProductGrid(allProducts.filter(p => p.discountPercent && p.discountPercent > 0).slice(0, 4))}
                            </div>
                            <div className="text-center mt-3">
                                <button 
                                    onClick={() => setCustomFilterType("sale")} 
                                    className="btn btn-thieuhoa px-4 py-2 text-uppercase font-weight-bold text-white rounded-pill shadow-sm"
                                    style={{ fontSize: '0.82rem' }}
                                >
                                    Xem Thêm
                                </button>
                            </div>
                        </section>

                        {/* CỤM THEO TỪNG DANH MỤC THỰC TẾ TRONG DATABASE (Đã được yêu cầu loại bỏ trên trang chủ) */}
                    </div>
                ) : (
                    /* 2. CHẾ ĐỘ TRANG DANH MỤC: HIỂN THỊ SIDEBAR BỘ LỌC BÊN TRÁI VÀ DANH SÁCH SẢN PHẨM BÊN PHẢI */
                    <div className="row">
                        {/* Cột bên trái: Sidebar danh mục (CategoryProductList) */}
                        <aside className="col-lg-3 col-md-4 mb-4 mb-lg-0">
                            <CategoryProductList 
                                selectedCategoryId={selectedCategoryId} 
                                onSelectCategory={(id) => {
                                    setSelectedCategoryId(id);
                                    setCustomFilterType(null); // Reset bộ lọc đặc biệt khi click chọn danh mục bên trái
                                }} 
                            />
                            
                            {/* Banner quảng cáo nhỏ thanh bên trái */}
                            <div className="card shadow-sm border-0 rounded-lg overflow-hidden mt-4 d-none d-md-block">
                                <div className="position-relative" style={{ height: '340px' }}>
                                    <img 
                                        src="https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp" 
                                        className="w-100 h-100" 
                                        alt="Khuyến mãi" 
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-end p-4 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', top: 0, left: 0 }}>
                                        <h6 className="font-weight-bold text-uppercase mb-1" style={{ color: 'var(--thieuhoa-light-gold)' }}>Đầm Thiết Kế Cao Cấp</h6>
                                        <p className="small mb-2" style={{ opacity: 0.85 }}>Tôn vinh vóc dáng ngọc ngà của quý cô</p>
                                        <button onClick={() => handleCategoryClick("Đầm")} className="btn btn-sm btn-thieuhoa font-weight-bold text-uppercase rounded-pill text-center py-2" style={{ fontSize: '0.75rem' }}>Xem ngay</button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Cột bên phải: Danh sách sản phẩm của danh mục được chọn (ProductList) */}
                        <section className="col-lg-9 col-md-8">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                                <h4 className="text-uppercase font-weight-bold text-dark m-0" style={{ letterSpacing: '0.5px', fontSize: '1.2rem', color: 'var(--thieuhoa-primary)' }}>
                                    {getCategoryBannerInfo().title}
                                </h4>
                                <span className="small text-muted font-weight-bold">
                                    Tìm thấy trong danh mục
                                </span>
                            </div>
                            <ProductList selectedCategoryId={selectedCategoryId} customFilterType={customFilterType} />
                        </section>
                    </div>
                )}

                {/* PHẦN 7: TIN TỨC & CẨM NANG MẶC ĐẸP (Dữ liệu CSDL) */}
                <div id="tin-tuc-cam-nang" className="border-top mt-5 pt-4">
                    <PostList />
                </div>
                
            </main> {/* Kết thúc main content */}
                    </>
                } />
            </Routes>

            {/* PHẦN 8: CHÂN TRANG THƯƠNG HIỆU THIỀU HOA (FOOTER) */}
            <footer className="thieuhoa-footer pt-5 pb-4 mt-auto"> {/* Chân trang màu đen đỏ nâu, viền vàng kim */}
                <div className="container"> {/* Khung container */}
                    <div className="row text-left"> {/* Hàng ngang căn lề trái */}
                        
                        {/* Cột 1: Thông tin liên hệ và cơ quan chủ quản */}
                        <div className="col-lg-4 col-md-6 mb-4 mb-lg-0"> {/* Cột 1 chiếm 4/12 */}
                            <h5 className="thieuhoa-footer-title">THỜI TRANG THIỀU HOA</h5> {/* Tiêu đề cột */}
                            <div className="small" style={{ lineHeight: '1.8' }}> {/* Khối nhỏ giãn dòng */}
                                <p className="mb-2"><strong className="text-white">CÔNG TY CỔ PHẦN THỜI TRANG THIỀU HOA</strong></p> {/* Tên công ty */}
                                <p className="mb-2"><i className="fa-solid fa-location-dot mr-2"></i> Văn phòng: 254 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh</p> {/* Địa chỉ văn phòng */}
                                <p className="mb-2"><i className="fa-solid fa-phone mr-2"></i> Hotline đặt hàng: 1800 6246 (Miễn phí)</p> {/* Hotline */}
                                <p className="mb-2"><i className="fa-solid fa-envelope mr-2"></i> Email: hotro@thieuhoa.com.vn</p> {/* Email công ty */}
                                <p className="mb-3"><i className="fa-solid fa-code-branch mr-2"></i> GPKD số: 0316123456 do Sở KH&ĐT TP.HCM cấp</p> {/* Giấy phép đăng ký kinh doanh */}
                                
                                {/* Huy hiệu Bộ Công Thương (Thiều Hoa luôn có huy hiệu Đã đăng ký ở footer) */}
                                <a href="http://online.gov.vn/" target="_blank" rel="noreferrer"> {/* Liên kết ngoài đến trang bộ công thương */}
                                    <img // Ảnh huy hiệu đăng ký bộ công thương
                                        src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=200" // Ảnh giả lập huy hiệu Bộ Công Thương (mẫu icon check)
                                        alt="Đã thông báo Bộ Công Thương" // Nhãn
                                        className="mt-2" // Khoảng cách trên
                                        style={{ height: '40px', width: 'auto', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '4px' }} // Chiều cao 40px nền trắng
                                    /> {/* Kết thúc img */}
                                </a> {/* Kết thúc liên kết */}
                            </div> {/* Kết thúc khối nhỏ */}
                        </div> {/* Kết thúc cột 1 */}

                        {/* Cột 2: Danh sách các Showroom đại lý của Thiều Hoa */}
                        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0"> {/* Cột 2 chiếm 3/12 */}
                            <h5 className="thieuhoa-footer-title">HỆ THỐNG CỬA HÀNG</h5> {/* Tiêu đề cột */}
                            <ul className="list-unstyled small" style={{ lineHeight: '1.8' }}> {/* Danh sách không đầu dòng */}
                                <li className="mb-2"><strong className="text-white">TP. Hồ Chí Minh:</strong></li> {/* Nhãn TP.HCM */}
                                <li className="mb-2"><i className="fa-solid fa-shop mr-2 text-warning"></i> 254 Nguyễn Đình Chiểu, P.6, Q.3</li> {/* Showroom Quận 3 */}
                                <li className="mb-2"><i className="fa-solid fa-shop mr-2 text-warning"></i> 422 Quang Trung, P.10, Q.Gò Vấp</li> {/* Showroom Gò Vấp */}
                                <li className="mb-3"><i className="fa-solid fa-shop mr-2 text-warning"></i> 631 Lũy Bán Bích, P.Phú Thạnh, Q.Tân Phú</li> {/* Showroom Tân Phú */}
                                <li className="mb-2"><strong className="text-white">Hà Nội:</strong></li> {/* Nhãn Hà Nội */}
                                <li className="mb-2"><i className="fa-solid fa-shop mr-2 text-warning"></i> 50 Láng Hạ, Q.Đống Đa</li> {/* Showroom Hà Nội */}
                                <li><i className="fa-solid fa-shop mr-2 text-warning"></i> 172 Cầu Giấy, Q.Cầu Giấy</li> {/* Showroom Cầu Giấy */}
                            </ul> {/* Kết thúc danh sách */}
                        </div> {/* Kết thúc cột 2 */}

                        {/* Cột 3: Chính sách mua sắm bảo mật */}
                        <div className="col-lg-3 col-md-6 mb-4 mb-md-0"> {/* Cột 3 chiếm 3/12 */}
                            <h5 className="thieuhoa-footer-title">CHÍNH SÁCH MUA HÀNG</h5> {/* Tiêu đề cột */}
                            <ul className="list-unstyled d-flex flex-column" style={{ gap: '10px' }}> {/* Sắp xếp cột dọc */}
                                <li><a href="/chinh-sach-bao-mat" className="thieuhoa-footer-link text-decoration-none">Chính sách bảo mật thông tin</a></li> {/* Liên kết chính sách bảo mật */}
                                <li><a href="/chinh-sach-doi-tra" className="thieuhoa-footer-link text-decoration-none">Chính sách đổi trả sản phẩm</a></li> {/* Liên kết chính sách đổi trả */}
                                <li><a href="/chinh-sach-bao-hanh" className="thieuhoa-footer-link text-decoration-none">Chính sách bảo hành sản phẩm</a></li> {/* Liên kết chính sách bảo hành */}
                                <li><a href="/chinh-sach-van-chuyen" className="thieuhoa-footer-link text-decoration-none">Chính sách giao hàng toàn quốc</a></li> {/* Liên kết chính sách vận chuyển */}
                                <li><a href="/dieu-khoan-dich-vu" className="thieuhoa-footer-link text-decoration-none">Điều khoản & Điều kiện dịch vụ</a></li> {/* Liên kết điều khoản */}
                                <li><a href="/cau-hoi-thuong-gap" className="thieuhoa-footer-link text-decoration-none">Câu hỏi thường gặp (FAQs)</a></li> {/* Liên kết FAQs */}
                            </ul> {/* Kết thúc danh sách */}
                        </div> {/* Kết thúc cột 3 */}

                        {/* Cột 4: Kết nối với chúng tôi */}
                        <div className="col-lg-2 col-md-6"> {/* Cột 4 chiếm 2/12 */}
                            <h5 className="thieuhoa-footer-title">MẠNG XÃ HỘI</h5> {/* Tiêu đề cột */}
                            <div className="d-flex mb-3" style={{ gap: '10px' }}> {/* Nhóm các nút mạng xã hội nằm ngang */}
                                <a href="https://facebook.com/" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="fa-brands fa-facebook-f"></i></a> {/* Nút Facebook */}
                                <a href="https://youtube.com/" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="fa-brands fa-youtube"></i></a> {/* Nút Youtube */}
                                <a href="https://instagram.com/" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}><i className="fa-brands fa-instagram"></i></a> {/* Nút Instagram */}
                            </div> {/* Kết thúc nhóm mạng xã hội */}
                            <p className="small text-muted mb-2" style={{ fontSize: '0.78rem' }}>Đăng ký nhận tin tức khuyến mãi mới nhất từ Thiều Hoa:</p> {/* Lời khuyên đăng ký email */}
                            <div className="input-group"> {/* Nhóm đăng ký email */}
                                <input type="email" className="form-control form-control-sm rounded-left border-0" placeholder="Email của bạn..." style={{ fontSize: '0.8rem' }} /> {/* Input email */}
                                <div className="input-group-append"> {/* Khung ghép nút đăng ký */}
                                    <button className="btn btn-sm btn-warning font-weight-bold" type="button" style={{ backgroundColor: 'var(--thieuhoa-gold)', border: 'none', color: '#333333' }}><i className="fa-solid fa-paper-plane"></i></button> {/* Nút gửi */}
                                </div> {/* Kết thúc ghép */}
                            </div> {/* Kết thúc nhóm đăng ký */}
                        </div> {/* Kết thúc cột 4 */}

                    </div> {/* Kết thúc row chân trang */}

                    {/* Dòng bản quyền dưới cùng footer */}
                    <div className="border-top mt-4 pt-3 text-center text-muted small" style={{ borderColor: '#531E18' }}> {/* Đường phân cách ngang màu đỏ nâu sẫm */}
                        <p className="mb-0">© 2026 THỜI TRANG THIỀU HOA. Bản quyền thuộc về Nguyễn Quỳnh Thảo Vy - Mã SV: 2123110158.</p> {/* Bản quyền */}
                    </div> {/* Kết thúc dòng bản quyền */}

                </div> {/* Kết thúc container */}
            </footer> {/* Kết thúc footer */}

        </div> // Kết thúc div wrapper
    ); // Kết thúc hàm return giao diện App
} // Kết thúc component App

export default App; // Xuất mặc định component App
