import React, { useState, useEffect } from 'react';
import CategoryProductList from '../components/CategoryProductList';
import ProductList from '../components/ProductList';
import { Link, useLocation } from 'react-router-dom';

export default function Shop() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');

    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryParam ? parseInt(categoryParam) : null);
    const [customFilterType, setCustomFilterType] = useState(null);
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
        setSearchQuery(searchParam || '');
    }, [categoryParam, searchParam]);

    const handleApplyPriceFilter = () => {
        setAppliedMinPrice(minPrice !== '' ? parseInt(minPrice) : null);
        setAppliedMaxPrice(maxPrice !== '' ? parseInt(maxPrice) : null);
    };

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
                        <div className="card-header bg-white font-weight-bold text-uppercase py-3" style={{ color: 'var(--thieuhoa-primary)', borderBottom: '2px solid var(--thieuhoa-primary)' }}>
                            <i className="fa-solid fa-list-ul mr-2"></i> Lọc sản phẩm
                        </div>
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
                    </div>
                    <CategoryProductList 
                        selectedCategoryId={selectedCategoryId} 
                        onSelectCategory={(id) => {
                            setSelectedCategoryId(id);
                            setCustomFilterType(null);
                        }} 
                    />
                    
                    {/* Filter theo giá */}
                    <div className="card border-0 shadow-sm mt-4 mb-4">
                        <div className="card-header bg-white font-weight-bold py-3" style={{ borderBottom: '1px solid var(--thieuhoa-border)' }}>
                            Lọc theo giá
                        </div>
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
                    />
                </section>
            </div>
        </main>
    );
}
