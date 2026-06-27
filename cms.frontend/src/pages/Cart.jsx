import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VariantModal from '../components/VariantModal';
import { toast } from 'react-toastify';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    
    const customer = JSON.parse(localStorage.getItem('customer'));
    const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem(cartKey)) || []);
    }, []);

    const getMaxStock = (item) => {
        let maxStock = item.stockQuantity || 0;
        
        let parsedColors = [];
        try { if (item.colors) parsedColors = JSON.parse(item.colors); } catch(e){}
        const needsColor = parsedColors.length > 0;
        const needsSize = item.sizes && item.sizes.split(',').length > 0;
        const isFullySelected = (!needsColor || item.color) && (!needsSize || item.size);

        if (item.variantStocks && isFullySelected) {
            try {
                const stocks = JSON.parse(item.variantStocks);
                const key = `${item.color || ''}-${item.size || ''}`;
                if (stocks[key] !== undefined) maxStock = stocks[key];
                else if (Object.keys(stocks).length > 0) maxStock = 0;
            } catch(e) {}
        }
        return maxStock;
    };

    const updateQuantity = (id, size, color, delta) => {
        const newCart = cart.map(item => {
            if (item.id === id && item.size === size && item.color === color) {
                const newQuantity = item.quantity + delta;
                const maxStock = getMaxStock(item);
                if (delta > 0 && newQuantity > maxStock) {
                    toast.warning(`Chỉ còn ${maxStock} sản phẩm cho phân loại này!`);
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

    const setQuantityAbsolute = (id, size, color, value) => {
        const newCart = cart.map(item => {
            if (item.id === id && item.size === size && item.color === color) {
                if (value === '') return { ...item, quantity: '' };
                const num = parseInt(value, 10);
                if (isNaN(num)) return item;
                if (num < 1) return { ...item, quantity: 1 };
                const maxStock = getMaxStock(item);
                if (num > maxStock) {
                    toast.warning(`Chỉ còn ${maxStock} sản phẩm cho phân loại này!`);
                    return { ...item, quantity: maxStock };
                }
                return { ...item, quantity: num };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart.filter(i => i.quantity !== '')));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (id, size, color) => {
        const newCart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleConfirmVariantChange = (item, newColor, newSize) => {
        const newCart = [...cart];
        const oldIndex = newCart.findIndex(i => i.id === item.id && i.size === item.size && i.color === item.color);
        
        if (oldIndex !== -1) {
            const oldItem = newCart[oldIndex];
            // Check if the new variant already exists
            const existingIndex = newCart.findIndex((i, idx) => i.id === item.id && i.size === newSize && i.color === newColor && idx !== oldIndex);
            
            if (existingIndex !== -1) {
                // Merge quantities
                newCart[existingIndex].quantity += oldItem.quantity;
                newCart.splice(oldIndex, 1);
            } else {
                // Update old item
                newCart[oldIndex] = { ...oldItem, color: newColor, size: newSize };
            }
            
            setCart(newCart);
            localStorage.setItem(cartKey, JSON.stringify(newCart));
            window.dispatchEvent(new Event('cartUpdated'));
        }
        setEditingItem(null);
    };

    const total = cart.reduce((sum, item) => sum + (item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity, 0);

    return (
        <main className="container py-5 flex-grow-1">
            <h3 className="font-weight-bold text-uppercase mb-4" style={{ color: 'var(--zeychic-primary)' }}>Giỏ hàng của bạn</h3>
            {cart.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">Giỏ hàng trống.</p>
                    <Link to="/" className="btn btn-thieuhoa text-white mt-3" style={{ backgroundColor: 'var(--zeychic-primary)' }}>Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        {cart.map(item => (
                            <div className="card shadow-sm border-0 mb-3" key={`${item.id}-${item.size || 'default'}-${item.color || 'default'}`}>
                                <div className="card-body d-flex align-items-center">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl.startsWith('http') ? item.imageUrl.split(',')[0] : `${import.meta.env.VITE_API_URL}${item.imageUrl.split(',')[0]}`} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} className="mr-3" />
                                    ) : (
                                        <div className="bg-light mr-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '100px', borderRadius: '8px' }}>
                                            <i className="fa-regular fa-image text-muted"></i>
                                        </div>
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="font-weight-bold mb-1">{item.name}</h6>
                                        
                                        <div className="mb-2">
                                            <button 
                                                className="btn btn-sm text-left d-inline-flex align-items-center bg-light border shadow-sm" 
                                                style={{ borderRadius: '6px', fontSize: '0.85rem', padding: '4px 10px', color: '#555' }}
                                                onClick={() => setEditingItem(item)}
                                            >
                                                <span>{item.color ? `Màu ${item.color}` : 'Chọn màu'}, {item.size ? `Size ${item.size}` : 'Chọn size'}</span>
                                                <i className="fa-solid fa-chevron-down ml-2 text-muted" style={{ fontSize: '0.7rem' }}></i>
                                            </button>
                                        </div>

                                        <div className="text-danger font-weight-bold mb-2" style={{ fontSize: '1.1rem' }}>
                                            {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}
                                        </div>
                                        <div className="d-flex align-items-center mt-2 border" style={{ width: '100px', height: '32px', borderRadius: '4px' }}>
                                            <button className="btn btn-sm bg-transparent border-0 px-2 h-100 font-weight-bold d-flex align-items-center" onClick={() => updateQuantity(item.id, item.size, item.color, -1)}>-</button>
                                            <input type="text" className="form-control form-control-sm border-0 text-center bg-transparent shadow-none h-100 font-weight-bold p-0" style={{ fontSize: '0.9rem' }} value={item.quantity} onChange={(e) => setQuantityAbsolute(item.id, item.size, item.color, e.target.value)} onBlur={(e) => { if (item.quantity === '') setQuantityAbsolute(item.id, item.size, item.color, '1'); }} />
                                            <button className="btn btn-sm bg-transparent border-0 px-2 h-100 font-weight-bold d-flex align-items-center" onClick={() => updateQuantity(item.id, item.size, item.color, 1)}>+</button>
                                        </div>
                                        <div className="mt-1 text-muted" style={{ fontSize: '0.8rem' }}>Kho còn: {getMaxStock(item)}</div>
                                    </div>
                                    <button className="btn btn-link text-danger ml-3" onClick={() => removeItem(item.id, item.size, item.color)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '12px' }}>
                            <h5 className="font-weight-bold mb-4">Tóm tắt đơn hàng</h5>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                                <span className="text-muted">Tạm tính:</span>
                                <span className="font-weight-bold">
                                    {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(total)}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="font-weight-bold">Tổng tiền:</span>
                                <span className="font-weight-bold text-danger" style={{ fontSize: '1.4rem' }}>
                                    {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(total)}
                                </span>
                            </div>
                            <Link to="/checkout" className="btn btn-block text-white font-weight-bold py-3 mt-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px', fontSize: '1.05rem' }}>
                                TIẾN HÀNH THANH TOÁN <i className="fa-solid fa-arrow-right ml-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {editingItem && (
                <VariantModal
                    show={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                    initialColor={editingItem.color}
                    initialSize={editingItem.size}
                    onConfirm={(newColor, newSize) => handleConfirmVariantChange(editingItem, newColor, newSize)}
                />
            )}
        </main>
    );
}
