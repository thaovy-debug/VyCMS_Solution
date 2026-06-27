import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', notes: '' });
    const navigate = useNavigate();
    const location = useLocation();
    const [isDirectBuy, setIsDirectBuy] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Location state
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [specificAddress, setSpecificAddress] = useState('');

    const [addressBook, setAddressBook] = useState([]);
    const [useAddressBook, setUseAddressBook] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    useEffect(() => {
        const storedCustomer = JSON.parse(localStorage.getItem('customer'));
        const cartKey = storedCustomer ? `cart_${storedCustomer.id}` : 'cart_guest';

        if (location.state && location.state.directBuyItem) {
            setCart([location.state.directBuyItem]);
            setIsDirectBuy(true);
        } else {
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            setCart(storedCart);
            setIsDirectBuy(false);
        }
        
        if (storedCustomer) {
            setCustomer(storedCustomer);
            setFormData({
                fullName: storedCustomer.fullName || '',
                phone: storedCustomer.phone || '',
                notes: ''
            });
            if (storedCustomer.address) {
                setSpecificAddress(storedCustomer.address);
            }
            if (storedCustomer.addressBook) {
                try {
                    const parsedBook = JSON.parse(storedCustomer.addressBook);
                    if (parsedBook && parsedBook.length > 0) {
                        setAddressBook(parsedBook);
                        setUseAddressBook(true);
                        const defaultAddr = parsedBook.find(a => a.isDefault) || parsedBook[0];
                        setSelectedAddressId(defaultAddr.id);
                        setSelectedProvince(defaultAddr.province);
                        setSelectedDistrict(defaultAddr.district);
                        setSelectedWard(defaultAddr.ward);
                        setSpecificAddress(defaultAddr.specific);
                    }
                } catch (e) {
                    console.error("Error parsing address book in checkout", e);
                }
            }
        }

        // Fetch Vietnam provinces API
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/v2/?depth=2');
                setProvinces(res.data);
            } catch (err) {
                console.error("Failed to load provinces", err);
            }
        };
        fetchProvinces();
    }, [location.state]);

    useEffect(() => {
        if (selectedProvince && useAddressBook === false) {
            const p = provinces.find(p => p.name === selectedProvince);
            setWards(p ? p.wards : []);
            setSelectedWard('');
        }
    }, [selectedProvince, provinces, useAddressBook]);

    const handleSelectAddress = (id) => {
        setSelectedAddressId(id);
        const addr = addressBook.find(a => a.id === id);
        if (addr) {
            setSelectedProvince(addr.province);
            // Cập nhật wards
            const p = provinces.find(prov => prov.name === addr.province);
            if (p) {
                setWards(p.wards);
            }
            setSelectedWard(addr.ward);
            setSpecificAddress(addr.specific);
        }
    };

    const total = cart.reduce((sum, item) => sum + (item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity, 0);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            toast.warning("Giỏ hàng của bạn đang trống!");
            return;
        }

        if (!selectedProvince || !selectedWard || !specificAddress) {
            toast.warning("Vui lòng nhập đầy đủ địa chỉ giao hàng (Tỉnh/Thành, Phường/Xã và Địa chỉ cụ thể).");
            return;
        }

        const fullShippingAddress = `${specificAddress}, ${selectedWard}, ${selectedProvince}`;

        const orderData = {
            customerId: customer ? customer.id : null,
            totalAmount: total,
            shippingAddress: fullShippingAddress,
            phone: formData.phone,
            notes: formData.notes,
            cartItems: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price,
                size: item.size,
                color: item.color
            }))
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Orders`, orderData);
            if (res.status === 200 || res.status === 201) {
                if (!isDirectBuy) {
                    const cartKey = customer ? `cart_${customer.id}` : 'cart_guest';
                    localStorage.removeItem(cartKey);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                setOrderId(res.data.orderId || res.data.id || "MỚI");
                setIsSuccess(true);
            }
        } catch (err) {
            toast.warning(err.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.");
        }
    };

    if (cart.length === 0 && !isSuccess) {
        return (
            <main className="container py-5 flex-grow-1 text-center">
                <h4>Giỏ hàng trống</h4>
                <p className="text-muted">Bạn chưa chọn sản phẩm nào để thanh toán.</p>
                <Link to="/" className="btn btn-thieuhoa text-white mt-3 px-4 py-2" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '30px' }}>Mua sắm ngay</Link>
            </main>
        );
    }

    if (isSuccess) {
        return (
            <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
                <div className="card shadow border-0 p-5 text-center" style={{ borderRadius: '15px', maxWidth: '550px', width: '100%', margin: '0 auto' }}>
                    <div className="mb-4">
                        <i className="fas fa-check-circle" style={{ fontSize: '80px', color: '#28a745' }}></i>
                    </div>
                    <h3 className="font-weight-bold text-dark mb-3">Đặt hàng thành công!</h3>
                    <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                        Cảm ơn bạn đã tin tưởng và mua sắm tại ZEY CHÍC.<br/>
                        Mã đơn hàng của bạn là: <strong style={{ color: 'var(--zeychic-primary)' }}>#{orderId}</strong>
                    </p>
                    
                    <div className="d-flex flex-column" style={{ gap: '15px' }}>
                        <Link to="/profile" state={{ tab: 'orders' }} className="btn btn-outline-secondary py-3 font-weight-bold" style={{ borderRadius: '8px', border: '2px solid #6c757d' }}>
                            <i className="fas fa-file-invoice mr-2"></i>XEM CHI TIẾT ĐƠN HÀNG
                        </Link>
                        <Link to="/" className="btn text-white py-3 font-weight-bold" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }}>
                            <i className="fas fa-shopping-bag mr-2"></i>TIẾP TỤC MUA SẮM
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container py-5 flex-grow-1">
            <h3 className="font-weight-bold text-uppercase mb-4" style={{ color: 'var(--zeychic-primary)' }}>Thanh Toán Đơn Hàng</h3>
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

                            {addressBook.length > 0 && (
                                <div className="mb-4">
                                    <div className="d-flex mb-3 gap-3">
                                        <div className="form-check mr-4">
                                            <input className="form-check-input" type="radio" name="addressMode" id="modeBook" checked={useAddressBook} onChange={() => setUseAddressBook(true)} />
                                            <label className="form-check-label font-weight-bold" htmlFor="modeBook" style={{ cursor: 'pointer' }}>Chọn từ sổ địa chỉ</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="addressMode" id="modeNew" checked={!useAddressBook} onChange={() => {
                                                setUseAddressBook(false);
                                                setSelectedProvince('');
                                                setSelectedWard('');
                                                setSpecificAddress('');
                                            }} />
                                            <label className="form-check-label font-weight-bold" htmlFor="modeNew" style={{ cursor: 'pointer' }}>Giao đến địa chỉ khác</label>
                                        </div>
                                    </div>

                                    {useAddressBook && (
                                        <div className="list-group mb-3">
                                            {addressBook.map(addr => (
                                                <label key={addr.id} className={`list-group-item list-group-item-action ${selectedAddressId === addr.id ? 'active' : ''}`} style={{ cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', border: selectedAddressId === addr.id ? '2px solid var(--zeychic-primary)' : '1px solid #ddd', backgroundColor: selectedAddressId === addr.id ? '#f8f9fa' : '#fff', color: '#333' }}>
                                                    <div className="d-flex align-items-center">
                                                        <input type="radio" className="mr-3" name="selectedAddr" checked={selectedAddressId === addr.id} onChange={() => handleSelectAddress(addr.id)} />
                                                        <div>
                                                            {addr.isDefault && <span className="badge badge-success mb-1" style={{ fontSize: '0.65rem' }}>Mặc định</span>}
                                                            <p className="mb-0 small">{addr.specific}, {addr.ward}, {addr.province}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!useAddressBook || addressBook.length === 0) && (
                                <div className="p-3 bg-light rounded border mb-4">
                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold">Tỉnh / Thành phố <span className="text-danger">*</span></label>
                                        <select className="form-control" value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} required>
                                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                                            {provinces.map(p => (
                                                <option key={p.code} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold">Phường / Xã <span className="text-danger">*</span></label>
                                        <select className="form-control" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedProvince}>
                                            <option value="">-- Chọn Phường / Xã --</option>
                                            {wards.map(w => (
                                                <option key={w.code} value={w.name}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold">Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={specificAddress} onChange={(e) => setSpecificAddress(e.target.value)} required placeholder="Ví dụ: 123 Lê Lợi..." />
                                    </div>
                                </div>
                            )}
                            <div className="form-group mb-4">
                                <label className="font-weight-bold">Ghi chú đơn hàng (Tùy chọn)</label>
                                <textarea name="notes" className="form-control" rows="2" value={formData.notes} onChange={handleChange} placeholder="Ví dụ: Giao hàng vào giờ hành chính..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-block text-white font-weight-bold py-3 text-uppercase" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px', fontSize: '1.1rem' }}>XÁC NHẬN ĐẶT HÀNG</button>
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
                                            {item.color && <span className="ml-2 font-weight-bold text-dark">| Màu: {item.color}</span>}
                                            {item.size && <span className="ml-2 font-weight-bold text-dark">| Size: {item.size}</span>}
                                        </small>
                                        <div className="text-danger font-weight-bold mt-1" style={{ fontSize: '0.95rem' }}>
                                            {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')((item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price) * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Tạm tính:</span>
                            <span className="font-weight-bold">{(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(total)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                            <span className="text-muted">Phí vận chuyển:</span>
                            <span className="font-weight-bold text-success">Miễn phí</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="font-weight-bold" style={{ fontSize: '1.1rem' }}>Tổng cộng:</span>
                            <span className="font-weight-bold text-danger" style={{ fontSize: '1.3rem' }}>
                                {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
