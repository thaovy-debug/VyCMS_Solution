import React, { useState, useEffect } from 'react';
import CategoryProductList from '../components/CategoryProductList';
import ProductList from '../components/ProductList';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import categoryProductService from '../services/categoryProductService';

export default function Shop() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const filterParam = queryParams.get('filter');

    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryParam ? parseInt(categoryParam) : null);
    const [customFilterType, setCustomFilterType] = useState(filterParam || null);
    const [searchQuery, setSearchQuery] = useState(searchParam || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryProductService.getAllCategoryProducts();
                setCategories(data);
            } catch (err) {}
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategoryId(parseInt(categoryParam));
            setCustomFilterType(null);
        } else {
            setSelectedCategoryId(null);
        }
        
        if (filterParam) {
            setCustomFilterType(filterParam);
        } else if (!categoryParam) {
            setCustomFilterType(null);
        }
        
        setSearchQuery(searchParam || '');
    }, [categoryParam, searchParam, filterParam]);

    const handleApplyPriceFilter = () => {
        setAppliedMinPrice(minPrice !== '' ? parseInt(minPrice) : null);
        setAppliedMaxPrice(maxPrice !== '' ? parseInt(maxPrice) : null);
    };

    const [isProductFilterOpen, setIsProductFilterOpen] = useState(false);
    const [isSizeFilterOpen, setIsSizeFilterOpen] = useState(false);
    const [isColorFilterOpen, setIsColorFilterOpen] = useState(false);
    const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
    
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);

    const getCategoryBannerInfo = () => {
        let bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/04/web.webp";
        let title = "Thời Trang Trung Niên";
        let desc = "Xu hướng thời trang trung niên cao cấp, tôn vinh vẻ đẹp mặn mà của phái đẹp Việt.";

        if (selectedCategoryId !== null) {
            const cat = categories.find(c => c.id === selectedCategoryId);
            const catName = cat?.name || "";
            title = catName;
            if (cat?.imageUrl) {
                bannerUrl = cat.imageUrl.startsWith('http') ? cat.imageUrl : `${import.meta.env.VITE_API_URL || 'https://localhost:7030'}${cat.imageUrl}`;
            } else {
                if (catName.includes("Đầm")) {
                    bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp";
                    desc = "Bộ sưu tập đầm trung niên dáng suông, đầm xòe, đầm dự tiệc thêu hoa sang trọng che khuyết điểm.";
                } else if (catName.includes("Áo")) {
                    bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/ao-kieu-trung-nien.webp";
                    desc = "Các thiết kế áo kiểu trung niên, áo thun in, áo sơ mi lụa mềm mại mang lại sự thoải mái tự tin.";
                } else if (catName.includes("Bộ")) {
                    bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/do-bo-trung-nien-thieu-hoa.webp";
                    desc = "Thiết kế đồ bộ mặc nhà, dạo phố rộng rãi mát mẻ từ chất liệu thun cotton, lụa satin tơ tằm.";
                } else if (catName.includes("Túi")) {
                    bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/tui-xach-camie-thieu-hoa.webp";
                    desc = "Dòng túi xách Camie thiết kế thanh lịch, phụ kiện hoàn hảo cho set đồ trung niên quý phái.";
                } else if (catName.includes("Khăn")) {
                    bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/khan-choang-co-thieu-hoa.webp";
                    desc = "Khăn choàng cổ lụa tơ tằm, khăn len cashmere giữ ấm và làm điểm nhấn quý phái cho trang phục.";
                }
            }
        } else {
            if (customFilterType === "new") {
                title = "HÀNG MỚI VỀ";
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/dam-trung-nien-du-tiec-thiet-ke-peplum-phoi-dap-ly-sang-trong-dd5x0806-thieu-hoa-6.webp";
                desc = "Khám phá ngay các mẫu thiết kế quần áo, váy trung niên mới nhất vừa lên kệ của Thiều Hoa.";
            } else if (customFilterType === "sale") {
                title = "SALE - OFF";
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/01/ao-kieu-trung-nien.webp";
                desc = "Ưu đãi cực khủng lên đến 50% dành cho các sản phẩm thời trang trung niên thiết kế độc quyền.";
            } else if (customFilterType === "hot") {
                title = "BÁN CHẠY";
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/tui-xach-camie-thieu-hoa.webp";
                desc = "Tổng hợp những mẫu đầm suông, áo kiểu được hàng ngàn khách hàng yêu thích và săn lùng.";
            } else if (customFilterType === "gift") {
                title = "QUÀ TẶNG MẸ";
                bannerUrl = "https://thieuhoa.com.vn/wp-content/uploads/2026/02/khan-choang-co-thieu-hoa.webp";
                desc = "Gợi ý những set quà tặng ý nghĩa, tinh tế nhất gửi gắm tình yêu kính đến những người mẹ thân thương.";
            }
        }
        return { bannerUrl, title, desc };
    };

    return (
        <main className="container py-5 flex-grow-1">
            {(selectedCategoryId !== null || customFilterType !== null) ? (
                <div className="mb-4">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb bg-transparent px-0 mb-3" style={{ fontSize: '0.88rem' }}>
                            <li className="breadcrumb-item">
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/san-pham')}
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
            ) : (
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb bg-transparent px-0 mb-4">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">Sản phẩm</li>
                    </ol>
                </nav>
            )}
            <div className="row">
                <aside className="col-lg-3 col-md-4 mb-4 mb-lg-0">
                    <div className="card border-0 shadow-sm mb-4">
                        <div 
                            className="card-header bg-white font-weight-bold text-uppercase py-3 d-flex justify-content-between align-items-center" 
                            style={{ color: 'var(--thieuhoa-primary)', borderBottom: '2px solid var(--thieuhoa-primary)', cursor: 'pointer' }}
                            onClick={() => setIsProductFilterOpen(!isProductFilterOpen)}
                        >
                            <span><i className="fa-solid fa-list-ul mr-2"></i> Lọc sản phẩm</span>
                            <i className={`fa-solid ${isProductFilterOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                        </div>
                        {isProductFilterOpen && (
                            <div className="card-body p-0">
                                <ul className="list-group list-group-flush">
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${selectedCategoryId === null && customFilterType === null ? 'font-weight-bold' : ''}`} onClick={() => navigate('/san-pham')} style={selectedCategoryId === null && customFilterType === null ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Tất cả sản phẩm
                                    </button>
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${customFilterType === 'new' ? 'font-weight-bold' : ''}`} onClick={() => navigate('/san-pham?filter=new')} style={customFilterType === 'new' ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Hàng mới về <span className="badge badge-danger float-right">NEW</span>
                                    </button>
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${customFilterType === 'sale' ? 'font-weight-bold' : ''}`} onClick={() => navigate('/san-pham?filter=sale')} style={customFilterType === 'sale' ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Khuyến mãi <span className="badge badge-danger float-right">SALE</span>
                                    </button>
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${customFilterType === 'hot' ? 'font-weight-bold' : ''}`} onClick={() => navigate('/san-pham?filter=hot')} style={customFilterType === 'hot' ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Bán chạy <span className="badge badge-danger float-right">HOT</span>
                                    </button>
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <CategoryProductList 
                        selectedCategoryId={selectedCategoryId} 
                        onSelectCategory={(id) => {
                            navigate(`/san-pham?category=${id}`);
                        }} 
                    />
                    
                    {/* Filter theo màu sắc */}
                    {availableColors.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div 
                                className="card-header bg-white font-weight-bold py-3 d-flex justify-content-between align-items-center" 
                                style={{ borderBottom: '1px solid var(--thieuhoa-border)', cursor: 'pointer' }}
                                onClick={() => setIsColorFilterOpen(!isColorFilterOpen)}
                            >
                                Màu sắc
                                <i className={`fa-solid ${isColorFilterOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                            </div>
                            {isColorFilterOpen && (
                                <div className="card-body p-3">
                                    <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                        {availableColors.map(color => {
                                            const getColorHex = (cName) => {
                                                const n = cName.toLowerCase();
                                                if (n.includes('đỏ')) return '#e74c3c';
                                                if (n.includes('cam')) return '#e67e22';
                                                if (n.includes('vàng')) return '#f1c40f';
                                                if (n.includes('xanh lá') || n.includes('lục')) return '#2ecc71';
                                                if (n.includes('xanh navy') || n.includes('xanh đen')) return '#2c3e50';
                                                if (n.includes('xanh dương') || n.includes('xanh biển')) return '#3498db';
                                                if (n.includes('tím')) return '#9b59b6';
                                                if (n.includes('hồng')) return '#ff9ff3';
                                                if (n.includes('đen')) return '#111111';
                                                if (n.includes('trắng')) return '#ffffff';
                                                if (n.includes('xám') || n.includes('ghi') || n.includes('xanh đá')) return '#95a5a6';
                                                if (n.includes('nâu')) return '#8b4513';
                                                if (n.includes('be') || n.includes('kem')) return '#f5f5dc';
                                                return '#cccccc';
                                            };
                                            return (
                                                <button 
                                                    key={color.name}
                                                    onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                                                    className="btn btn-sm shadow-sm"
                                                    title={color.name}
                                                    style={{ 
                                                        border: selectedColor === color.name ? '3px solid var(--thieuhoa-primary)' : '1px solid #ddd',
                                                        backgroundColor: getColorHex(color.name),
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        padding: '0',
                                                        transition: 'all 0.2s ease',
                                                        transform: selectedColor === color.name ? 'scale(1.1)' : 'scale(1)'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter theo kích thước */}
                    {availableSizes.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div 
                                className="card-header bg-white font-weight-bold py-3 d-flex justify-content-between align-items-center" 
                                style={{ borderBottom: '1px solid var(--thieuhoa-border)', cursor: 'pointer' }}
                                onClick={() => setIsSizeFilterOpen(!isSizeFilterOpen)}
                            >
                                Size
                                <i className={`fa-solid ${isSizeFilterOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                            </div>
                            {isSizeFilterOpen && (
                                <div className="card-body p-3">
                                    <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                        {availableSizes.map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                                className={`btn btn-sm text-dark font-weight-bold`}
                                                style={{ 
                                                    border: selectedSize === size ? '2px solid #333' : '1px solid #ddd',
                                                    backgroundColor: selectedSize === size ? '#f8f9fa' : 'transparent',
                                                    minWidth: '45px',
                                                    padding: '5px 10px'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter theo giá */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div 
                            className="card-header bg-white font-weight-bold py-3 d-flex justify-content-between align-items-center" 
                            style={{ borderBottom: '1px solid var(--thieuhoa-border)', cursor: 'pointer' }}
                            onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                        >
                            Lọc theo giá
                            <i className={`fa-solid ${isPriceFilterOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                        </div>
                        {isPriceFilterOpen && (
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2" style={{ gap: '10px' }}>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-sm" 
                                        placeholder="Tối thiểu" 
                                        value={minPrice} 
                                        onChange={(e) => setMinPrice(e.target.value)} 
                                    />
                                    <span>-</span>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-sm" 
                                        placeholder="Tối đa" 
                                        value={maxPrice} 
                                        onChange={(e) => setMaxPrice(e.target.value)} 
                                    />
                                </div>
                                <button className="btn btn-sm btn-outline-danger w-100 mt-2" onClick={handleApplyPriceFilter} style={{ borderColor: 'var(--thieuhoa-primary)', color: 'var(--thieuhoa-primary)' }}>
                                    Áp dụng
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
                <section className="col-lg-9 col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="font-weight-bold text-uppercase m-0" style={{ color: 'var(--thieuhoa-primary)' }}>
                            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` :
                             selectedCategoryId !== null ? 'Danh mục sản phẩm' :
                             customFilterType === 'new' ? 'Hàng mới về' :
                             customFilterType === 'sale' ? 'Sản phẩm khuyến mãi' : 
                             customFilterType === 'hot' ? 'Sản phẩm bán chạy' : 'Tất cả sản phẩm'}
                        </h4>
                    </div>
                    <ProductList 
                        selectedCategoryId={selectedCategoryId} 
                        customFilterType={customFilterType} 
                        searchQuery={searchQuery}
                        minPrice={appliedMinPrice}
                        maxPrice={appliedMaxPrice}
                        selectedSize={selectedSize}
                        selectedColor={selectedColor}
                        onAvailableFiltersChange={(filters) => {
                            setAvailableSizes(prev => JSON.stringify(prev) === JSON.stringify(filters.sizes) ? prev : filters.sizes);
                            setAvailableColors(prev => JSON.stringify(prev) === JSON.stringify(filters.colors) ? prev : filters.colors);
                        }}
                    />
                </section>
            </div>
        </main>
    );
}