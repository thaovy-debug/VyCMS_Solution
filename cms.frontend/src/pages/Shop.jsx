import React, { useState, useEffect } from 'react';
import CategoryProductList from '../components/CategoryProductList';
import ProductList from '../components/ProductList';
import { Link, useLocation } from 'react-router-dom';

export default function Shop() {
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

    return (
        <main className="container py-5 flex-grow-1">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent px-0 mb-4">
                    <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                    <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">Sản phẩm</li>
                </ol>
            </nav>
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
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${selectedCategoryId === null && customFilterType === null ? 'font-weight-bold' : ''}`} onClick={() => { setSelectedCategoryId(null); setCustomFilterType(null); }} style={selectedCategoryId === null && customFilterType === null ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Tất cả sản phẩm
                                    </button>
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${customFilterType === 'new' ? 'font-weight-bold' : ''}`} onClick={() => { setSelectedCategoryId(null); setCustomFilterType('new'); }} style={customFilterType === 'new' ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Hàng mới về <span className="badge badge-danger float-right">NEW</span>
                                    </button>
                                    <button className={`list-group-item list-group-item-action border-0 py-3 ${customFilterType === 'sale' ? 'font-weight-bold' : ''}`} onClick={() => { setSelectedCategoryId(null); setCustomFilterType('sale'); }} style={customFilterType === 'sale' ? { color: 'var(--thieuhoa-primary)', backgroundColor: '#F8F6F2' } : {}}>
                                        <i className="fa-solid fa-angle-right mr-2" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i> Khuyến mãi <span className="badge badge-danger float-right">SALE</span>
                                    </button>
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <CategoryProductList 
                        selectedCategoryId={selectedCategoryId} 
                        onSelectCategory={(id) => {
                            setSelectedCategoryId(id);
                            setCustomFilterType(null);
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
                                        {availableColors.map(color => (
                                            <button 
                                                key={color.name}
                                                onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                                                className={`btn btn-sm text-dark font-weight-bold`}
                                                style={{ 
                                                    border: selectedColor === color.name ? '2px solid #333' : '1px solid #ddd',
                                                    backgroundColor: selectedColor === color.name ? '#f8f9fa' : 'transparent',
                                                    padding: '5px 12px'
                                                }}
                                            >
                                                {color.name}
                                            </button>
                                        ))}
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
                             selectedCategoryId === null && customFilterType === null ? 'Tất cả sản phẩm' : 
                             customFilterType === 'new' ? 'Hàng mới về' :
                             customFilterType === 'sale' ? 'Sản phẩm khuyến mãi' : 'Danh mục sản phẩm'}
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
