import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { toast } from 'react-toastify';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

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
            } catch (err) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (product && product.stockQuantity < next) {
                toast.warning(`Xin lỗi, sản phẩm này chỉ còn ${product.stockQuantity} chiếc trong kho!`);
                return product.stockQuantity;
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
        if (product.stockQuantity < nextQuantity) {
            toast.warning('Số lượng sản phẩm trong kho không đủ!');
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
        if (product.stockQuantity < quantity) {
            toast.warning('Số lượng sản phẩm trong kho không đủ!');
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
                    <div className="d-flex flex-column flex-md-row">
                        {/* Thumbnails */}
                        {product.imageUrl && (
                            <div className="d-flex flex-row flex-md-column mr-md-3 mb-3 mb-md-0 overflow-auto" style={{ gap: '15px', minWidth: '90px', width: '90px' }}>
                                {product.imageUrl.split(',').filter(x => x.trim() !== '').map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                                        alt={`thumbnail-${idx}`}
                                        className={`img-fluid ${mainImage === img ? 'border border-dark' : 'border border-light'}`}
                                        style={{ cursor: 'pointer', objectFit: 'cover', height: '120px', width: '100%', flexShrink: 0, opacity: mainImage === img ? 1 : 0.6 }}
                                        onClick={() => setMainImage(img)}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseOut={(e) => { if(mainImage !== img) e.currentTarget.style.opacity = 0.6 }}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Main Image */}
                        <div className="flex-grow-1" style={{ height: '650px', backgroundColor: '#e2e2e2' }}>
                            {mainImage ? (
                                 <img 
                                    src={mainImage.startsWith('http') ? mainImage : `${import.meta.env.VITE_API_URL}${mainImage}`} 
                                    alt={product.name} 
                                    className="w-100 h-100" 
                                    style={{ objectFit: 'cover', objectPosition: 'center top' }} 
                                />
                            ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted" style={{ backgroundColor: '#f8f9fa' }}>
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
                    {parsedColors.length > 0 && (
                        <div className="mb-4 d-flex align-items-center">
                            <p className="mb-0 text-dark font-weight-bold" style={{ width: '120px', fontSize: '1.05rem' }}>Màu sắc:</p>
                            <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                {parsedColors.map((colorObj, idx) => (
                                    <button
                                        key={idx}
                                        className={`btn btn-sm ${selectedColor === colorObj.name ? 'border-dark font-weight-bold' : 'border'}`}
                                        style={{ backgroundColor: 'transparent', minWidth: '60px', height: '36px', borderRadius: '4px' }}
                                        onClick={() => handleColorClick(colorObj)}
                                        title={colorObj.name}
                                    >
                                        {colorObj.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.sizes && (
                        <div className="mb-4 d-flex align-items-center">
                            <p className="mb-0 text-dark font-weight-bold" style={{ width: '120px', fontSize: '1.05rem' }}>Size:</p>
                            <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                {product.sizes.split(',').map(s => s.trim()).filter(s => s).map(size => (
                                    <button
                                        key={size}
                                        className={`btn btn-sm ${selectedSize === size ? 'border-dark font-weight-bold' : 'border'}`}
                                        style={{ minWidth: '45px', height: '36px', backgroundColor: 'transparent', borderRadius: '4px' }}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                                else if (product && num > product.stockQuantity) {
                                    toast.warning(`Xin lỗi, sản phẩm này chỉ còn ${product.stockQuantity} chiếc trong kho!`);
                                    setQuantity(product.stockQuantity);
                                } else { setQuantity(num); }
                            }} onBlur={() => {
                                if (quantity === '') setQuantity(1);
                            }} />
                            <button className="btn btn-sm bg-transparent border-0 px-3 h-100 font-weight-bold d-flex align-items-center" style={{ fontSize: '1.2rem', color: '#555' }} onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>

                    <div className="d-flex mt-5 mb-5" style={{ gap: '15px', height: '56px' }}>
                        <button className="btn d-flex align-items-center justify-content-center" style={{ width: '64px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                            <i className="fa-regular fa-heart" style={{ fontSize: '1.5rem', color: '#666' }}></i>
                        </button>
                        <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} className={`btn ${product.stockQuantity === 0 ? 'btn-secondary' : 'btn-outline-dark'} font-weight-bold text-uppercase flex-grow-1`} style={{ borderRadius: '4px', border: '1.5px solid #222', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            {product.stockQuantity === 0 ? "Đã hết hàng" : "THÊM VÀO GIỎ HÀNG"}
                        </button>
                        <button onClick={handleBuyNow} disabled={product.stockQuantity === 0} className={`btn ${product.stockQuantity === 0 ? 'btn-secondary' : 'btn-dark'} font-weight-bold text-uppercase flex-grow-1`} style={{ borderRadius: '4px', backgroundColor: '#222', border: 'none', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            {product.stockQuantity === 0 ? "Hết hàng" : "MUA NGAY"}
                        </button>
                    </div>


                </div>
            </div>

            {/* Chi tiết và bảng size - 2 cột ngang hàng */}
            <div className="row mt-5 pt-5 border-top">
                <div className="col-md-6 pr-md-4 mb-4 mb-md-0" style={{ borderRight: '1px solid #eee' }}>
                    <div 
                        className="d-flex justify-content-between align-items-center mb-4 text-dark" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                    >
                        <h4 className="font-weight-bold m-0" style={{ fontSize: '1.15rem' }}>Thông tin chi tiết</h4>
                        <i className={`fa-solid ${openAccordion === 'details' ? 'fa-minus' : 'fa-plus'}`}></i>
                    </div>
                    {openAccordion === 'details' && (
                        <div className="text-muted" style={{ lineHeight: '1.8', fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: product.description || "Chưa có thông tin mô tả cho sản phẩm này." }}>
                        </div>
                    )}
                </div>
                <div className="col-md-6 pl-md-4">
                    <div 
                        className="d-flex justify-content-between align-items-center mb-4 text-dark" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setOpenAccordion(openAccordion === 'size' ? null : 'size')}
                    >
                        <h4 className="font-weight-bold m-0" style={{ fontSize: '1.15rem' }}>Bảng size</h4>
                        <i className={`fa-solid ${openAccordion === 'size' ? 'fa-minus' : 'fa-plus'}`}></i>
                    </div>
                    {openAccordion === 'size' && (
                        <div className="text-center">
                            {product.sizeGuideImageUrl ? (
                                <img src={product.sizeGuideImageUrl.startsWith('http') ? product.sizeGuideImageUrl : `${import.meta.env.VITE_API_URL}${product.sizeGuideImageUrl}`} alt="Bảng size" className="img-fluid rounded border shadow-sm" style={{ maxWidth: '100%' }} />
                            ) : (
                                <p className="text-muted text-left">Chưa có bảng size cho sản phẩm này.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

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
                    <div className="row text-center mb-5 text-muted">
                        <div className="col-12 py-5">
                            Hiện chưa có sản phẩm gợi ý
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
