import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VariantModal from './VariantModal';
import { toast } from 'react-toastify';

const ProductCard = ({ item, colClass = 'col-lg-3 col-md-4 col-sm-6 mb-4' }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = React.useState(false);
    const [showVariantModal, setShowVariantModal] = React.useState(false);

    const hasVariants = React.useMemo(() => {
        let parsedColors = [];
        try { if (item.colors) parsedColors = JSON.parse(item.colors); } catch(e){}
        const sizes = item.sizes ? item.sizes.split(',').filter(s => s.trim()) : [];
        return parsedColors.length > 0 || sizes.length > 0;
    }, [item]);


    React.useEffect(() => {
        const customer = JSON.parse(localStorage.getItem('customer'));
        const key = customer ? `favorites_${customer.id}` : 'favorites_guest';
        const favs = JSON.parse(localStorage.getItem(key)) || [];
        setIsFavorite(favs.some(f => f.id === item.id));
        
        const updateFavs = () => {
            const currentFavs = JSON.parse(localStorage.getItem(key)) || [];
            setIsFavorite(currentFavs.some(f => f.id === item.id));
        };
        window.addEventListener('favoritesUpdated', updateFavs);
        return () => window.removeEventListener('favoritesUpdated', updateFavs);
    }, [item.id]);

    const toggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const customer = JSON.parse(localStorage.getItem('customer'));
        const key = customer ? `favorites_${customer.id}` : 'favorites_guest';
        let favs = JSON.parse(localStorage.getItem(key)) || [];
        
        if (isFavorite) {
            favs = favs.filter(f => f.id !== item.id);
            setIsFavorite(false);
        } else {
            favs.push(item);
            setIsFavorite(true);
        }
        localStorage.setItem(key, JSON.stringify(favs));
        window.dispatchEvent(new Event('favoritesUpdated'));
    };


    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (item.stockQuantity < 1) {
            toast.warning('Số lượng sản phẩm trong kho không đủ!');
            return;
        }

        if (hasVariants) {
            setShowVariantModal(true);
        } else {
            navigate('/checkout', {
                state: {
                    directBuyItem: {
                        ...item,
                        quantity: 1
                    }
                }
            });
        }
    };

    const handleConfirmVariant = (color, size) => {
        setShowVariantModal(false);
        navigate('/checkout', {
            state: {
                directBuyItem: {
                    ...item,
                    color: color,
                    size: size,
                    quantity: 1
                }
            }
        });
    };

    return (
        <div className={colClass}>
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
                        <span className="position-absolute badge badge-danger px-2 py-1 font-weight-bold" style={{ top: item.createdDate && new Date() - new Date(item.createdDate) < 7 * 24 * 60 * 60 * 1000 ? '40px' : '10px', left: '10px', backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.7rem', borderRadius: '4px', zIndex: 11 }}>-{item.discountPercent}%</span>
                    )}
                    
                    <div 
                        className="position-absolute d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" 
                        style={{ top: '10px', right: '10px', zIndex: 12, cursor: 'pointer', width: '32px', height: '32px', transition: 'all 0.2s' }}
                        onClick={toggleFavorite}
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <i className={`${isFavorite ? 'fa-solid text-danger' : 'fa-regular text-secondary'} fa-heart`} style={{ fontSize: '1.1rem', marginTop: '2px' }}></i>
                    </div>
                </Link>

                {/* Thân card chứa thông tái */}
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

                        {(() => {
                            let parsedColors = [];
                            if (item.colors) {
                                try { parsedColors = JSON.parse(item.colors); } catch(e) {}
                            }
                            
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

                            if (parsedColors.length > 0) {
                                return (
                                    <div className="d-flex align-items-center mb-2" style={{ gap: '5px' }}>
                                        {parsedColors.slice(0, 5).map((c, idx) => (
                                            <span key={idx} className="rounded-circle border shadow-sm" style={{ width: '12px', height: '12px', backgroundColor: getColorHex(c.name), cursor: 'pointer' }} title={c.name}></span>
                                        ))}
                                        {parsedColors.length > 5 && <span className="small text-muted" style={{fontSize: '10px'}}>+{parsedColors.length - 5}</span>}
                                    </div>
                                );
                            } else {
                                return <div className="d-flex align-items-center mb-2" style={{ gap: '5px', height: '12px' }}></div>;
                            }
                        })()}
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

            <VariantModal
                show={showVariantModal}
                onClose={() => setShowVariantModal(false)}
                item={item}
                title="Chọn phân loại"
                onConfirm={handleConfirmVariant}
            />
        </div>
    );
};

export default ProductCard;
