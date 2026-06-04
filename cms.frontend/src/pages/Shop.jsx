import React, { useState, useEffect } from 'react';
import CategoryProductList from '../components/CategoryProductList';
import ProductList from '../components/ProductList';
import { Link, useLocation } from 'react-router-dom';

export default function Shop() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');

    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryParam ? parseInt(categoryParam) : null);
    const [customFilterType, setCustomFilterType] = useState(null);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategoryId(parseInt(categoryParam));
            setCustomFilterType(null);
        } else {
            setSelectedCategoryId(null);
        }
    }, [categoryParam]);

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
                </aside>
                <section className="col-lg-9 col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="font-weight-bold text-uppercase m-0" style={{ color: 'var(--thieuhoa-primary)' }}>
                            {selectedCategoryId === null && customFilterType === null ? 'Tất cả sản phẩm' : 
                             customFilterType === 'new' ? 'Hàng mới về' :
                             customFilterType === 'sale' ? 'Sản phẩm khuyến mãi' : 'Danh mục sản phẩm'}
                        </h4>
                    </div>
                    <ProductList selectedCategoryId={selectedCategoryId} customFilterType={customFilterType} />
                </section>
            </div>
        </main>
    );
}
