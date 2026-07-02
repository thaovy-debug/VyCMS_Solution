import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [parsedColors, setParsedColors] = useState([]);
    
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [openAccordion, setOpenAccordion] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                
                // Parse sizes
                if (data.sizes) {
                    const sizeArr = data.sizes.split(',').map(s => s.trim());
                    if (sizeArr.length > 0) setSelectedSize(sizeArr[0]);
                }
                
                // Parse colors from JSON string
                if (data.colors) {
                    try {
                        const colorsArr = JSON.parse(data.colors);
                        setParsedColors(colorsArr);
                        if (colorsArr.length > 0) {
                            setSelectedColor(colorsArr[0].name);
                        }
                    } catch (e) {
                        console.error("Lỗi parse màu sắc:", e);
                    }
                }

                // Parse images
                if (data.imageUrl) {
                    const images = data.imageUrl.split(',').filter(x => x.trim() !== '');
                    if (images.length > 0) {
                        setMainImage(images[0]);
                    }
                }
            
                if (data.categoryProductId) {
                    try {
                        const relatedData = await productService.getProductsByCategory(data.categoryProductId);
                        // Randomize and pick 4
                        const filtered = relatedData
                            .filter(p => p.id.toString() !== id.toString())
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 4);
                        setRelatedProducts(filtered);
                    } catch (e) {
                        console.error('Lỗi lấy sản phẩm liên quan:', e);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getAvailableStock = () => {
        if (!product) return 0;
        let maxStock = product.stockQuantity || 0;
        
        const needsColor = parsedColors.length > 0;
        const needsSize = product.sizes && product.sizes.split(',').length > 0;
        const isFullySelected = (!needsColor || selectedColor) && (!needsSize || selectedSize);

        if (product.variantStocks && isFullySelected) {
            try {
                const stocks = JSON.parse(product.variantStocks);
                const key = `${selectedColor || ''}-${selectedSize || ''}`;
                if (stocks[key] !== undefined) maxStock = stocks[key];
                else if (Object.keys(stocks).length > 0) maxStock = 0;
            } catch(e) {}
        }
        return maxStock;
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const next = prev + delta;
            if (next < 1) return 1;
            const maxStock = getAvailableStock();
            if (maxStock < next) {
                toast.warning(`Xin lỗi, sản phẩm này với phân loại đã chọn chỉ còn ${maxStock} chiếc trong kho!`);
                return maxStock;
            }
            return next;
        });
    };

    const handleColorClick = (colorObj) => {
        setSelectedColor(colorObj.name);
        if (colorObj.image) {
            setMainImage(colorObj.image);
        }
    };

    const handleAddToCart = () => {
        if (product.sizes && !selectedSize) {
            toast.warning('Vui lòng chọn size trước khi mua!');
            return;
        }
        if (parsedColors.length > 0 && !selectedColor) {
            toast.warning('Vui lòng chọn màu sắc trước khi mua!');
            return;
        }

        const customer = JSON.parse(localStorage.getItem('customer'));
        const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';
        const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existing = currentCart.find(item => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
        
        const nextQuantity = existing ? existing.quantity + quantity : quantity;
        const maxStock = getAvailableStock();
        if (maxStock < nextQuantity) {
            toast.warning(`Số lượng vượt quá tồn kho (Còn ${maxStock} sản phẩm)!`);
            return;
        }

        if (existing) {
            existing.quantity += quantity;
        } else {
            currentCart.push({ ...product, quantity: quantity, size: selectedSize, color: selectedColor });
        }
        localStorage.setItem(cartKey, JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success(`Đã thêm ${product.name} ${selectedColor ? `(Màu: ${selectedColor})` : ''} ${selectedSize ? `(Size: ${selectedSize})` : ''} vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        if (product.sizes && !selectedSize) {
            toast.warning('Vui lòng chọn size trước khi mua!');
            return;
        }
        if (parsedColors.length > 0 && !selectedColor) {
            toast.warning('Vui lòng chọn màu sắc trước khi mua!');
            return;
        }
        const maxStock = getAvailableStock();
        if (maxStock < quantity) {
            toast.warning(`Số lượng vượt quá tồn kho (Còn ${maxStock} sản phẩm)!`);
            return;
        }
        const directProduct = { ...product, quantity: quantity, size: selectedSize, color: selectedColor };
        navigate('/checkout', { state: { directBuyItem: directProduct } });
    };

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    if (loading) {
        return <div className="text-center py-5 my-5 text-muted">Đang tải thông tin sản phẩm...</div>;
    }

    if (!product) {
        return <div className="text-center py-5 my-5 text-danger font-weight-bold">Không tìm thấy sản phẩm!</div>;
    }

    // Combine main images and color variant images
    const allImages = (() => {
        let imgs = [];
        if (product.imageUrl) {
            imgs = [...product.imageUrl.split(',').filter(x => x.trim() !== '')];
        }
        if (parsedColors && parsedColors.length > 0) {
            parsedColors.forEach(c => {
                if (c.image && !imgs.includes(c.image)) {
                    imgs.push(c.image);
                }
            });
        }
        return imgs;
    })();

    return (
        <main className="container py-5 flex-grow-1">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent px-0 mb-4 justify-content-center" style={{ fontSize: '0.9rem' }}>
                    <li className="breadcrumb-item"><Link to="/" className="text-dark font-weight-bold text-decoration-none">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link to="/san-pham" className="text-dark font-weight-bold text-decoration-none">Sản phẩm</Link></li>
                    <li className="breadcrumb-item active text-muted" aria-current="page">{product.name}</li>
                </ol>
            </nav>

            <div className="row">
                {/* Hình ảnh sản phẩm (Left Column) */}
                <div className="col-md-7 mb-4 mb-md-0">
                    <div className="d-flex flex-column flex-md-row position-relative">
                        {/* Thumbnails */}
                        {allImages.length > 0 && (
                            <>
                                {/* Desktop view thumbnails - absolute trick to match height */}
                                <div className="d-none d-md-block mr-md-3 mb-3 mb-md-0" style={{ minWidth: '110px', width: '110px' }}>
                                    <div className="d-flex flex-column overflow-auto position-absolute custom-scrollbar" style={{ width: '110px', top: 0, bottom: 0, left: 0, gap: '15px' }}>
                                        {allImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                                                alt={`thumbnail-${idx}`}
                                                className={`img-fluid ${mainImage === img ? 'border border-dark' : 'border border-light'}`}
                                                style={{ cursor: 'pointer', objectFit: 'cover', height: 'calc((100% - 45px) / 4)', width: '100%', flexShrink: 0, opacity: mainImage === img ? 1 : 0.6 }}
                                                onClick={() => setMainImage(img)}
                                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                                onMouseOut={(e) => { if(mainImage !== img) e.currentTarget.style.opacity = 0.6 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Mobile view thumbnails - horizontal scroll */}
                                <div className="d-flex d-md-none flex-row overflow-auto mb-3" style={{ gap: '15px', width: '100%' }}>
                                    {allImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                                            alt={`thumbnail-${idx}`}
                                            className={`img-fluid ${mainImage === img ? 'border border-dark' : 'border border-light'}`}
                                            style={{ cursor: 'pointer', objectFit: 'cover', height: '146px', width: '110px', flexShrink: 0, opacity: mainImage === img ? 1 : 0.6 }}
                                            onClick={() => setMainImage(img)}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseOut={(e) => { if(mainImage !== img) e.currentTarget.style.opacity = 0.6 }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Main Image */}
                        <div className="flex-grow-1" style={{ backgroundColor: '#F8F6F2' }}>
                            {mainImage ? (
                                 <img 
                                    src={mainImage.startsWith('http') ? mainImage : `${import.meta.env.VITE_API_URL}${mainImage}`} 
                                    alt={product.name} 
                                    className="w-100" 
                                    style={{ height: 'auto', display: 'block' }} 
                                />
                            ) : (
                                <div className="w-100 d-flex align-items-center justify-content-center text-muted" style={{ height: '650px', backgroundColor: '#f8f9fa' }}>
                                    <i className="fa-regular fa-image" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Thông tin chi tiết (Right Column) */}
                <div className="col-md-5 pl-md-4">
                    <h2 className="font-weight-bold text-dark mb-2" style={{ lineHeight: '1.4' }}>{product.name}</h2>
                    <p className="text-muted mb-4 small font-weight-bold">
                        SKU: {product.sku || `1P08.${product.id}`} 
                        <span className="ml-3">
                            <i className="fa-solid fa-star text-secondary"></i><i className="fa-solid fa-star text-secondary"></i><i className="fa-solid fa-star text-secondary"></i><i className="fa-solid fa-star text-secondary"></i><i className="fa-solid fa-star text-secondary"></i> 
                            <span className="ml-1">(0) 0 Nhận xét</span>
                        </span>
                    </p>

                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <h3 className="font-weight-bold m-0 text-danger" style={{ fontSize: '1.8rem' }}>
                            {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(product.discountPercent > 0 ? product.price * (1 - product.discountPercent / 100) : product.price)}
                        </h3>
                        {product.discountPercent > 0 && (
                            <span className="text-muted text-decoration-line-through ml-3" style={{ fontSize: '1.1rem' }}>
                                {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Colors - Dynamic from parsedColors */}
                    {(() => {
                        let stocks = {};
                        if (product.variantStocks) {
                            try { stocks = JSON.parse(product.variantStocks); } catch(e){}
                        }
                        const isColorDisabled = (colorName) => {
                            if (!selectedSize || Object.keys(stocks).length === 0) return false;
                            const key = `${colorName}-${selectedSize}`;
                            return stocks[key] === undefined || stocks[key] <= 0;
                        };
                        const isSizeDisabled = (sizeName) => {
                            if (!selectedColor || Object.keys(stocks).length === 0) return false;
                            const key = `${selectedColor}-${sizeName}`;
                            return stocks[key] === undefined || stocks[key] <= 0;
                        };

                        return (
                            <>
                                {parsedColors.length > 0 && (
                                    <div className="mb-4 d-flex align-items-center">
                                        <p className="mb-0 text-dark font-weight-bold" style={{ width: '120px', fontSize: '1.05rem' }}>Màu sắc:</p>
                                        <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                            {parsedColors.map((colorObj, idx) => {
                                                const disabled = isColorDisabled(colorObj.name);
                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`btn btn-sm position-relative overflow-hidden ${selectedColor === colorObj.name ? 'border-dark font-weight-bold' : 'border'}`}
                                                        style={{ 
                                                            backgroundColor: selectedColor === colorObj.name ? '#fff2f2' : (disabled ? '#f1f1f1' : 'transparent'), 
                                                            minWidth: '60px', height: '36px', borderRadius: '4px',
                                                            color: disabled ? '#aaa' : '#333',
                                                            opacity: disabled ? 0.6 : 1,
                                                            cursor: disabled ? 'not-allowed' : 'pointer'
                                                        }}
                                                        disabled={disabled}
                                                        onClick={() => { if(!disabled) handleColorClick(colorObj); }}
                                                        title={colorObj.name}
                                                    >
                                                        {colorObj.name}
                                                        {disabled && <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#aaa', transform: 'rotate(-15deg)'}}></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {product.sizes && (
                                    <div className="mb-4 d-flex align-items-center">
                                        <p className="mb-0 text-dark font-weight-bold" style={{ width: '120px', fontSize: '1.05rem' }}>Size:</p>
                                        <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                            {product.sizes.split(',').map(s => s.trim()).filter(s => s).map(size => {
                                                const disabled = isSizeDisabled(size);
                                                return (
                                                    <button
                                                        key={size}
                                                        className={`btn btn-sm position-relative overflow-hidden ${selectedSize === size ? 'border-dark font-weight-bold' : 'border'}`}
                                                        style={{ 
                                                            minWidth: '45px', height: '36px', 
                                                            backgroundColor: selectedSize === size ? '#fff2f2' : (disabled ? '#f1f1f1' : 'transparent'), 
                                                            borderRadius: '4px',
                                                            color: disabled ? '#aaa' : '#333',
                                                            opacity: disabled ? 0.6 : 1,
                                                            cursor: disabled ? 'not-allowed' : 'pointer'
                                                        }}
                                                        disabled={disabled}
                                                        onClick={() => { if(!disabled) setSelectedSize(size); }}
                                                    >
                                                        {size}
                                                        {disabled && <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#aaa', transform: 'rotate(-20deg)'}}></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* Quantity */}
                    <div className="mb-4 d-flex align-items-center">
                        <p className="mb-0 text-dark font-weight-bold" style={{ width: '120px', fontSize: '1.05rem' }}>Số lượng:</p>
                        <div className="d-flex align-items-center border" style={{ width: '120px', height: '40px', borderRadius: '4px', backgroundColor: '#fff' }}>
                            <button className="btn btn-sm bg-transparent border-0 px-3 h-100 font-weight-bold d-flex align-items-center" style={{ fontSize: '1.2rem', color: '#555' }} onClick={() => handleQuantityChange(-1)}>-</button>
                            <input type="text" className="form-control form-control-sm border-0 text-center bg-transparent shadow-none h-100 font-weight-bold" style={{ fontSize: '1.1rem' }} value={quantity} onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') { setQuantity(''); return; }
                                const num = parseInt(val, 10);
                                if (isNaN(num)) return;
                                if (num < 1) { setQuantity(1); }
                                else {
                                    const maxStock = getAvailableStock();
                                    if (num > maxStock) {
                                        toast.warning(`Xin lỗi, sản phẩm này với phân loại đã chọn chỉ còn ${maxStock} chiếc trong kho!`);
                                        setQuantity(maxStock);
                                    } else { setQuantity(num); }
                                }
                            }} onBlur={() => {
                                if (quantity === '') setQuantity(1);
                            }} />
                            <button className="btn btn-sm bg-transparent border-0 px-3 h-100 font-weight-bold d-flex align-items-center" style={{ fontSize: '1.2rem', color: '#555' }} onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                        <span className="ml-3 text-muted small" style={{ fontSize: '0.9rem' }}>{getAvailableStock()} sản phẩm có sẵn</span>
                    </div>

                    <div className="d-flex mt-5 mb-5" style={{ gap: '15px', height: '56px' }}>
                        <button className="btn d-flex align-items-center justify-content-center" style={{ width: '64px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                            <i className="fa-regular fa-heart" style={{ fontSize: '1.5rem', color: '#666' }}></i>
                        </button>
                        <button onClick={handleAddToCart} disabled={product.stockQuantity === 0 || getAvailableStock() === 0} className={`btn ${(product.stockQuantity === 0 || getAvailableStock() === 0) ? 'btn-secondary' : 'btn-outline-dark'} font-weight-bold text-uppercase flex-grow-1`} style={{ borderRadius: '4px', border: '1.5px solid #222', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            {(product.stockQuantity === 0 || getAvailableStock() === 0) ? "Đã hết hàng" : "THÊM VÀO GIỎ HÀNG"}
                        </button>
                        <button onClick={handleBuyNow} disabled={product.stockQuantity === 0 || getAvailableStock() === 0} className={`btn ${(product.stockQuantity === 0 || getAvailableStock() === 0) ? 'btn-secondary' : 'btn-dark'} font-weight-bold text-uppercase flex-grow-1`} style={{ borderRadius: '4px', backgroundColor: '#222', border: 'none', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            {(product.stockQuantity === 0 || getAvailableStock() === 0) ? "Hết hàng" : "MUA NGAY"}
                        </button>
                    </div>


                </div>
            </div>

            {/* Chi tiết và bảng size - 2 cột ngang hàng */}
            {(product.description || product.sizeGuideImageUrl) && (
                <div className="row mt-5 pt-5 border-top">
                    {product.description && (
                        <div className={`${product.sizeGuideImageUrl ? 'col-md-6 pr-md-4 mb-4 mb-md-0' : 'col-12'}`} style={product.sizeGuideImageUrl ? { borderRight: '1px solid #eee' } : {}}>
                            <div 
                                className="d-flex justify-content-between align-items-center mb-4 text-dark" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                            >
                                <h4 className="font-weight-bold m-0" style={{ fontSize: '1.15rem' }}>Thông tin chi tiết</h4>
                                <i className={`fa-solid ${openAccordion === 'details' ? 'fa-minus' : 'fa-plus'}`}></i>
                            </div>
                            {openAccordion === 'details' && (
                                <div className="text-muted" style={{ lineHeight: '1.8', fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: product.description }}>
                                </div>
                            )}
                        </div>
                    )}
                    {product.sizeGuideImageUrl && (
                        <div className={product.description ? "col-md-6 pl-md-4" : "col-12"}>
                            <div 
                                className="d-flex justify-content-between align-items-center mb-4 text-dark" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setOpenAccordion(openAccordion === 'size' ? null : 'size')}
                            >
                                <h4 className="font-weight-bold m-0" style={{ fontSize: '1.15rem' }}>Bảng size</h4>
                                <i className={`fa-solid ${openAccordion === 'size' ? 'fa-minus' : 'fa-plus'}`}></i>
                            </div>
                            {openAccordion === 'size' && (
                                <div className={product.description ? "text-center" : ""}>
                                    <img src={product.sizeGuideImageUrl.startsWith('http') ? product.sizeGuideImageUrl : `${import.meta.env.VITE_API_URL}${product.sizeGuideImageUrl}`} alt="Bảng size" className="img-fluid rounded border shadow-sm" style={{ maxWidth: '100%' }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom sections */}
            <div className="row mt-5 pt-5 border-top">
                <div className="col-12">
                    <h5 className="font-weight-bold mb-1 text-dark">Đánh giá sản phẩm</h5>
                    <p className="text-muted mb-4">0 đánh giá</p>
                    <div className="p-4 bg-light d-flex align-items-center justify-content-center mb-5" style={{ borderRadius: '0' }}>
                        <div className="text-center pr-5 border-right" style={{ borderColor: '#ccc' }}>
                            <h2 className="font-weight-bold m-0" style={{ fontSize: '3rem' }}>0.0 <span className="text-muted" style={{ fontSize: '1.5rem' }}>/ 5</span></h2>
                            <div className="text-secondary mt-2" style={{ fontSize: '1.2rem' }}>
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                        </div>
                        <div className="pl-5" style={{ minWidth: '400px' }}>
                            <p className="mb-3 font-weight-bold">Sản phẩm được đánh giá</p>
                            {[5,4,3,2,1].map(star => (
                                <div key={star} className="d-flex align-items-center mb-2">
                                    <span style={{ width: '50px' }}>{star} sao</span>
                                    <div className="progress flex-grow-1 mx-3" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-secondary" role="progressbar" style={{ width: '0%' }}></div>
                                    </div>
                                    <span style={{ width: '30px' }}>(0)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h4 className="font-weight-bold text-center mb-5 text-dark text-uppercase mt-5">CÓ THỂ BẠN SẼ THÍCH</h4>
                    {relatedProducts && relatedProducts.length > 0 ? (
                        <div className="d-flex align-items-center mb-5 overflow-auto" style={{ gap: '20px', paddingBottom: '15px' }}>
                            {relatedProducts.map((item, index) => (
                                <div key={item.id} style={{ minWidth: '250px', flex: '0 0 auto' }}>
                                    <ProductCard item={item} colClass="" />
                                </div>
                            ))}
                            {relatedProducts.length > 0 && (
                                <div style={{ minWidth: '100px', flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
                                    <Link 
                                        to={`/san-pham?category=${product.categoryProductId}`} 
                                        className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '60px', height: '60px', transition: 'all 0.3s' }}
                                        title="Xem thêm"
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#222';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#222';
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-right" style={{ fontSize: '1.5rem' }}></i>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="row text-center mb-5 text-muted">
                            <div className="col-12 py-5">
                                Hiện chưa có sản phẩm gợi ý
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
