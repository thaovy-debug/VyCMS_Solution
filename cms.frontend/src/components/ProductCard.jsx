import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ item }) => {
    const navigate = useNavigate();

    const handleBuyNow = (e) => {
        e.preventDefault();
        if (item.stockQuantity < 1) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }

        navigate('/checkout', {
            state: {
                directBuyItem: {
                    ...item,
                    quantity: 1
                }
            }
        });
    };

    return (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden transition-all hover-card" style={{ backgroundColor: 'var(--thieuhoa-card-bg)' }}>
                {/* Khung chứa ảnh */}
                <Link to={`/product/${item.id}`} className="position-relative overflow-hidden d-block text-decoration-none" style={{ height: '260px', backgroundColor: '#F8F6F2' }}>
                    {item.imageUrl ? (() => {
                        const firstImg = item.imageUrl.split(',')[0];
                        return (
                            <img 
                                src={firstImg.startsWith('http') ? firstImg : `${import.meta.env.VITE_API_URL}${firstImg}`} 
                                className="w-100 h-100 hover-zoom" 
                                alt={item.name} 
                                style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                            />
                        );
                    })() : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                            <i className="fa-regular fa-image" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                        </div>
                    )}
                    {item.stockQuantity === 0 && (
                        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 10, top: 0, left: 0 }}>
                            <span className="badge badge-dark px-3 py-2 font-weight-bold" style={{ fontSize: '1rem', letterSpacing: '1px' }}>HẾT HÀNG</span>
                        </div>
                    )}
                    {item.createdDate && new Date() - new Date(item.createdDate) < 7 * 24 * 60 * 60 * 1000 && (
                        <span className="position-absolute badge badge-dark px-2 py-1 small font-weight-bold text-uppercase" style={{ top: '10px', left: '10px', backgroundColor: '#111111', fontSize: '0.65rem', letterSpacing: '0.5px', zIndex: 11 }}>NEW</span>
                    )}
                    {item.discountPercent > 0 && (
                        <span className="position-absolute badge badge-danger px-2 py-1 font-weight-bold" style={{ top: '10px', right: '10px', backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.7rem', borderRadius: '4px', zIndex: 11 }}>-{item.discountPercent}%</span>
                    )}
                </Link>

                {/* Thân card chứa thông tin */}
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                        <div className="small text-uppercase font-weight-bold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>THIỀU HOA DESIGN</div>
                        <Link to={`/product/${item.id}`} className="text-decoration-none hover-link">
                            <h5 className="card-title font-weight-bold text-dark mb-2" style={{ fontSize: '0.92rem', lineHeight: '1.4', height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</h5>
                        </Link>
                        
                        <div className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                            <span className="font-weight-bold" style={{ fontSize: '1.05rem', color: 'var(--thieuhoa-primary)' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}
                            </span>
                            {item.discountPercent > 0 && (
                                <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.85rem', textDecoration: 'line-through' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                </span>
                            )}
                        </div>

                        <div className="d-flex align-items-center mb-2" style={{ gap: '5px' }}>
                            <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#e28743', cursor: 'pointer' }} title="Màu cam đất"></span>
                            <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#1e3d59', cursor: 'pointer' }} title="Màu xanh navy"></span>
                            <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: '#111111', cursor: 'pointer' }} title="Màu đen sang trọng"></span>
                        </div>
                    </div>
                    <p className="card-text small text-muted mt-2 mb-0" style={{ fontSize: '0.78rem' }}>
                        <i className="fa-solid fa-boxes-stacked mr-1"></i> Số lượng tồn kho: {item.stockQuantity ?? item.stock} sản phẩm
                    </p>
                </div>

                {/* Chân card */}
                <div className="card-footer bg-transparent border-top-0 px-3 pb-3 pt-0">
                    {item.stockQuantity === 0 ? (
                        <button className="btn btn-secondary btn-block btn-sm rounded-pill font-weight-bold py-2" disabled style={{ fontSize: '0.9rem' }}>
                            Hết hàng
                        </button>
                    ) : (
                        <button 
                            className="btn btn-block btn-sm rounded-pill font-weight-bold py-2 transition-all d-flex align-items-center justify-content-center text-white" 
                            style={{ backgroundColor: '#5c2a21', border: 'none', fontSize: '0.9rem' }}
                            onClick={handleBuyNow}
                        >
                            <i className="fa-solid fa-cart-plus mr-2" style={{ fontSize: '1rem' }}></i> Mua ngay
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
