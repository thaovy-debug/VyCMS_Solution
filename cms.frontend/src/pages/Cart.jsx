import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState([]);
    
    const customer = JSON.parse(localStorage.getItem('customer'));
    const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem(cartKey)) || []);
    }, []);

    const updateQuantity = (id, size, delta) => {
        const newCart = cart.map(item => {
            if (item.id === id && item.size === size) {
                const newQuantity = item.quantity + delta;
                if (delta > 0 && item.stockQuantity !== undefined && newQuantity > item.stockQuantity) {
                    alert('Số lượng sản phẩm trong kho không đủ!');
                    return item;
                }
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const setQuantityAbsolute = (id, size, value) => {
        const newCart = cart.map(item => {
            if (item.id === id && item.size === size) {
                if (value === '') return { ...item, quantity: '' };
                const num = parseInt(value, 10);
                if (isNaN(num)) return item;
                if (num < 1) return { ...item, quantity: 1 };
                if (item.stockQuantity !== undefined && num > item.stockQuantity) {
                    alert('Số lượng sản phẩm trong kho không đủ!');
                    return { ...item, quantity: item.stockQuantity };
                }
                return { ...item, quantity: num };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart.filter(i => i.quantity !== '')));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (id, size) => {
        const newCart = cart.filter(item => !(item.id === id && item.size === size));
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const total = cart.reduce((sum, item) => sum + (item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity, 0);

    return (
        <main className="container py-5 flex-grow-1">
            <h3 className="font-weight-bold text-uppercase mb-4" style={{ color: 'var(--thieuhoa-primary)' }}>Giỏ hàng của bạn</h3>
            {cart.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">Giỏ hàng trống.</p>
                    <Link to="/" className="btn btn-thieuhoa text-white mt-3" style={{ backgroundColor: 'var(--thieuhoa-primary)' }}>Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        {cart.map(item => (
                            <div className="card shadow-sm border-0 mb-3" key={`${item.id}-${item.size || 'default'}`}>
                                <div className="card-body d-flex align-items-center">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL}${item.imageUrl}`} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} className="mr-3" />
                                    ) : (
                                        <div className="bg-light mr-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '100px', borderRadius: '8px' }}>
                                            <i className="fa-regular fa-image text-muted"></i>
                                        </div>
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="font-weight-bold">{item.name} {item.size && <span className="badge badge-secondary ml-2" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>Size: {item.size}</span>}</h6>
                                        <div className="text-danger font-weight-bold mb-2">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}
                                        </div>
                                        <div className="d-flex align-items-center mt-2 border" style={{ width: '100px', height: '32px', borderRadius: '4px' }}>
                                            <button className="btn btn-sm bg-transparent border-0 px-2 h-100 font-weight-bold d-flex align-items-center" onClick={() => updateQuantity(item.id, item.size, -1)}>-</button>
                                            <input type="text" className="form-control form-control-sm border-0 text-center bg-transparent shadow-none h-100 font-weight-bold p-0" style={{ fontSize: '0.9rem' }} value={item.quantity} onChange={(e) => setQuantityAbsolute(item.id, item.size, e.target.value)} onBlur={(e) => { if (item.quantity === '') setQuantityAbsolute(item.id, item.size, '1'); }} />
                                            <button className="btn btn-sm bg-transparent border-0 px-2 h-100 font-weight-bold d-flex align-items-center" onClick={() => updateQuantity(item.id, item.size, 1)}>+</button>
                                        </div>
                                    </div>
                                    <button className="btn btn-link text-danger ml-3" onClick={() => removeItem(item.id, item.size)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 p-4">
                            <h5 className="font-weight-bold mb-3">Tóm tắt đơn hàng</h5>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tổng tiền:</span>
                                <span className="font-weight-bold text-danger" style={{ fontSize: '1.2rem' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                </span>
                            </div>
                            <Link to="/checkout" className="btn btn-block text-white font-weight-bold py-2 mt-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }}>
                                TIẾN HÀNH THANH TOÁN
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
