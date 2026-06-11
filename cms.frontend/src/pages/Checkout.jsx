import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', notes: '' });
    const navigate = useNavigate();
    const location = useLocation();
    const [isDirectBuy, setIsDirectBuy] = useState(false);

    useEffect(() => {
        if (location.state && location.state.directBuyItem) {
            setCart([location.state.directBuyItem]);
            setIsDirectBuy(true);
        } else {
            const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCart(storedCart);
            setIsDirectBuy(false);
        }
        
        const storedCustomer = JSON.parse(localStorage.getItem('customer'));
        if (storedCustomer) {
            setCustomer(storedCustomer);
            setFormData({
                fullName: storedCustomer.fullName || '',
                phone: storedCustomer.phone || '',
                address: storedCustomer.address || '',
                notes: ''
            });
        }
    }, []);

    const total = cart.reduce((sum, item) => sum + (item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity, 0);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }

        const orderData = {
            customerId: customer ? customer.id : null,
            totalAmount: total,
            shippingAddress: formData.address,
            phone: formData.phone,
            notes: formData.notes,
            cartItems: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price,
                size: item.size
            }))
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Orders`, orderData);
            if (res.status === 200 || res.status === 201) {
                alert("Đặt hàng thành công! Đơn hàng của bạn đang được chờ xử lý.");
                if (!isDirectBuy) {
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                navigate('/');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.");
        }
    };

    if (cart.length === 0) {
        return (
            <main className="container py-5 flex-grow-1 text-center">
                <h4>Giỏ hàng trống</h4>
                <p className="text-muted">Bạn chưa chọn sản phẩm nào để thanh toán.</p>
                <Link to="/" className="btn btn-thieuhoa text-white mt-3 px-4 py-2" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '30px' }}>Mua sắm ngay</Link>
            </main>
        );
    }

    return (
        <main className="container py-5 flex-grow-1">
            <h3 className="font-weight-bold text-uppercase mb-4" style={{ color: 'var(--thieuhoa-primary)' }}>Thanh Toán Đơn Hàng</h3>
            <div className="row">
                <div className="col-lg-7 mb-4 mb-lg-0">
                    <div className="card shadow-sm border-0 p-4 rounded-lg">
                        <h5 className="font-weight-bold mb-4">Thông tin giao hàng</h5>
                        {!customer && (
                            <div className="alert alert-warning small border-0" style={{ backgroundColor: '#fff3cd' }}>
                                Bạn chưa đăng nhập. <Link to="/login" className="font-weight-bold alert-link text-danger">Đăng nhập ngay</Link> để theo dõi đơn hàng và nhận ưu đãi!
                            </div>
                        )}
                        <form onSubmit={handleCheckout}>
                            <div className="form-group mb-3">
                                <label className="font-weight-bold">Người nhận</label>
                                <input name="fullName" type="text" className="form-control" value={formData.fullName} onChange={handleChange} required placeholder="Tên người nhận hàng..." />
                            </div>
                            <div className="form-group mb-3">
                                <label className="font-weight-bold">Số điện thoại</label>
                                <input name="phone" type="tel" pattern="[0-9]{10,11}" title="Vui lòng nhập số điện thoại hợp lệ từ 10 đến 11 chữ số" className="form-control" value={formData.phone} onChange={handleChange} required placeholder="Số điện thoại liên hệ..." />
                            </div>
                            <div className="form-group mb-3">
                                <label className="font-weight-bold">Địa chỉ giao hàng</label>
                                <textarea name="address" className="form-control" rows="2" value={formData.address} onChange={handleChange} required placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."></textarea>
                            </div>
                            <div className="form-group mb-4">
                                <label className="font-weight-bold">Ghi chú đơn hàng (Tùy chọn)</label>
                                <textarea name="notes" className="form-control" rows="2" value={formData.notes} onChange={handleChange} placeholder="Ví dụ: Giao hàng vào giờ hành chính..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-block text-white font-weight-bold py-3 text-uppercase" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px', fontSize: '1.1rem' }}>XÁC NHẬN ĐẶT HÀNG</button>
                        </form>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 p-4 rounded-lg" style={{ backgroundColor: '#FDFBF7' }}>
                        <h5 className="font-weight-bold mb-4">Đơn hàng của bạn ({cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</h5>
                        <div className="mb-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {cart.map(item => (
                                <div className="d-flex align-items-center mb-3 pb-3 border-bottom" key={`${item.id}-${item.size || 'default'}`}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL}${item.imageUrl}`} alt={item.name} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '4px' }} className="mr-3 shadow-sm" />
                                    ) : (
                                        <div className="bg-light mr-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '75px', borderRadius: '4px' }}>
                                            <i className="fa-regular fa-image text-muted"></i>
                                        </div>
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="font-weight-bold m-0" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</h6>
                                        <small className="text-muted">
                                            Số lượng: {item.quantity} 
                                            {item.size && <span className="ml-2 font-weight-bold text-dark">| Size: {item.size}</span>}
                                        </small>
                                        <div className="text-danger font-weight-bold mt-1" style={{ fontSize: '0.95rem' }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Tạm tính:</span>
                            <span className="font-weight-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                            <span className="text-muted">Phí vận chuyển:</span>
                            <span className="font-weight-bold text-success">Miễn phí</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="font-weight-bold" style={{ fontSize: '1.1rem' }}>Tổng cộng:</span>
                            <span className="font-weight-bold text-danger" style={{ fontSize: '1.3rem' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
