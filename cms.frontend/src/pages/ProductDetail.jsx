import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                if (data.sizes) {
                    const sizeArr = data.sizes.split(',').map(s => s.trim());
                    if (sizeArr.length > 0) setSelectedSize(sizeArr[0]);
                }
            } catch (err) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product.sizes && !selectedSize) {
            alert('Vui lòng chọn size trước khi mua!');
            return;
        }
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = currentCart.find(item => item.id === product.id && item.size === selectedSize);
        
        const nextQuantity = existing ? existing.quantity + 1 : 1;
        if (product.stockQuantity < nextQuantity) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }

        if (existing) {
            existing.quantity += 1;
        } else {
            currentCart.push({ ...product, quantity: 1, size: selectedSize });
        }
        localStorage.setItem('cart', JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`Đã thêm ${product.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        if (product.sizes && !selectedSize) {
            alert('Vui lòng chọn size trước khi mua!');
            return;
        }
        if (product.stockQuantity < 1) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            return;
        }
        const directProduct = { ...product, quantity: 1, size: selectedSize };
        navigate('/checkout', { state: { directBuyItem: directProduct } });
    };

    if (loading) {
        return <div className="text-center py-5 my-5 text-muted">Đang tải thông tin sản phẩm...</div>;
    }

    if (!product) {
        return <div className="text-center py-5 my-5 text-danger font-weight-bold">Không tìm thấy sản phẩm!</div>;
    }

    return (
        <main className="container py-5 flex-grow-1">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent px-0 mb-4">
                    <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                    <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">{product.name}</li>
                </ol>
            </nav>

            <div className="row">
                {/* Hình ảnh sản phẩm */}
                <div className="col-md-5 mb-4 mb-md-0">
                    <div id="productCarousel" className="carousel slide card border-0 shadow-sm rounded-lg overflow-hidden" data-ride="carousel" style={{ backgroundColor: '#F8F6F2', height: '500px' }}>
                        {product.imageUrl ? (() => {
                            const images = product.imageUrl.split(',').filter(x => x.trim() !== '');
                            return (
                                <>
                                    {images.length > 1 && (
                                        <ol className="carousel-indicators">
                                            {images.map((_, idx) => (
                                                <li key={idx} data-target="#productCarousel" data-slide-to={idx} className={idx === 0 ? "active" : ""} style={{ backgroundColor: 'var(--thieuhoa-primary)', height: '4px', borderRadius: '4px' }}></li>
                                            ))}
                                        </ol>
                                    )}
                                    <div className="carousel-inner h-100">
                                        {images.map((img, idx) => (
                                            <div key={idx} className={`carousel-item h-100 ${idx === 0 ? 'active' : ''}`}>
                                                <img 
                                                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`} 
                                                    alt={`${product.name} - ${idx}`} 
                                                    className="d-block w-100 h-100" 
                                                    style={{ objectFit: 'cover' }} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {images.length > 1 && (
                                        <>
                                            <a className="carousel-control-prev" href="#productCarousel" role="button" data-slide="prev" style={{ width: '10%' }}>
                                                <i className="fa-solid fa-chevron-left" style={{ fontSize: '1.5rem', color: '#333333', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}></i>
                                                <span className="sr-only">Previous</span>
                                            </a>
                                            <a className="carousel-control-next" href="#productCarousel" role="button" data-slide="next" style={{ width: '10%' }}>
                                                <i className="fa-solid fa-chevron-right" style={{ fontSize: '1.5rem', color: '#333333', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}></i>
                                                <span className="sr-only">Next</span>
                                            </a>
                                        </>
                                    )}
                                </>
                            );
                        })() : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                <i className="fa-regular fa-image" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="col-md-7 px-md-5">
                    <div className="small text-uppercase font-weight-bold mb-2" style={{ color: 'var(--thieuhoa-gold)', letterSpacing: '1px' }}>THIỀU HOA DESIGN</div>
                    <h2 className="font-weight-bold text-dark mb-3" style={{ lineHeight: '1.4' }}>{product.name}</h2>
                    
                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom" style={{ gap: '15px' }}>
                        <h3 className="font-weight-bold m-0" style={{ color: 'var(--thieuhoa-primary)' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discountPercent > 0 ? product.price * (1 - product.discountPercent / 100) : product.price)}
                        </h3>
                        {product.discountPercent > 0 && (
                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '1.1rem' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </span>
                        )}
                        {product.discountPercent > 0 && (
                            <span className="badge badge-danger px-2 py-1 font-weight-bold" style={{ backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.8rem' }}>
                                Giảm {product.discountPercent}%
                            </span>
                        )}
                    </div>

                    {product.sizes && (
                        <div className="mb-4">
                            <p className="font-weight-bold mb-2 text-dark">Chọn Size:</p>
                            <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                {product.sizes.split(',').map(s => s.trim()).filter(s => s).map(size => (
                                    <button
                                        key={size}
                                        className={`btn ${selectedSize === size ? 'btn-thieuhoa text-white font-weight-bold' : 'btn-outline-secondary'}`}
                                        style={selectedSize === size ? { backgroundColor: 'var(--thieuhoa-primary)', borderColor: 'var(--thieuhoa-primary)' } : {}}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="font-weight-bold mb-2 text-dark">Tình trạng kho:</p>
                        <p className={product.stockQuantity === 0 ? "text-danger font-weight-bold" : "text-muted"}>
                            <i className="fa-solid fa-boxes-stacked mr-2"></i> 
                            {product.stockQuantity === 0 ? "Hết hàng" : `Còn lại ${product.stockQuantity ?? 0} sản phẩm`}
                        </p>
                    </div>

                    <div className="d-flex" style={{ gap: '15px' }}>
                        <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} className={`btn ${product.stockQuantity === 0 ? 'btn-secondary' : 'btn-outline-thieuhoa'} px-5 py-3 font-weight-bold rounded-pill text-uppercase`}>
                            <i className="fa-solid fa-cart-plus mr-2"></i> {product.stockQuantity === 0 ? "Đã hết hàng" : "Thêm vào giỏ hàng"}
                        </button>
                        <button onClick={handleBuyNow} disabled={product.stockQuantity === 0} className={`btn ${product.stockQuantity === 0 ? 'btn-secondary' : 'btn-thieuhoa text-white'} px-5 py-3 font-weight-bold rounded-pill text-uppercase flex-grow-1`} style={product.stockQuantity === 0 ? {} : { backgroundColor: 'var(--thieuhoa-primary)' }}>
                            {product.stockQuantity === 0 ? "Hết hàng" : "Mua ngay"}
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-top">
                        <div className="d-flex align-items-center mb-2">
                            <i className="fa-solid fa-truck-fast mr-3 text-muted" style={{ fontSize: '1.2rem' }}></i>
                            <span className="small text-muted">Giao hàng cực nhanh 4H tại TPHCM và Hà Nội</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <i className="fa-solid fa-shield-halved mr-3 text-muted" style={{ fontSize: '1.2rem' }}></i>
                            <span className="small text-muted">Cam kết 1 đổi 1 trong vòng 7 ngày</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chi tiết dàn ngang */}
            <div className="row mt-5 pt-4 border-top">
                <div className="col-12">
                    <h4 className="font-weight-bold mb-4 text-dark text-uppercase pb-2 border-bottom">Thông tin chi tiết</h4>
                    
                    <div className="mb-5">
                        <h5 className="font-weight-bold mb-3 text-dark">Mô tả sản phẩm:</h5>
                        <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                            {product.description || "Đây là dòng sản phẩm thời trang cao cấp độc quyền từ Thiều Hoa, mang lại sự sang trọng và thanh lịch cho người mặc."}
                        </p>
                    </div>

                    {product.sizeGuideImageUrl && (
                        <div className="mb-4">
                            <h5 className="font-weight-bold mb-4 text-dark">Bảng size / Mô tả thêm:</h5>
                            <img src={product.sizeGuideImageUrl.startsWith('http') ? product.sizeGuideImageUrl : `${import.meta.env.VITE_API_URL}${product.sizeGuideImageUrl}`} alt="Bảng size" className="img-fluid rounded border shadow-sm" style={{ maxWidth: '100%' }} />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
