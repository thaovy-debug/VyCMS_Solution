import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [customer, setCustomer] = useState(() => JSON.parse(localStorage.getItem('customer')) || null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('Không có nhu cầu');
    const [cancelCustomReason, setCancelCustomReason] = useState('');
    const [isCanceling, setIsCanceling] = useState(false);

    const [activeTab, setActiveTab] = useState('account');
    const [readNotifications, setReadNotifications] = useState(() => JSON.parse(localStorage.getItem(`read_notifications_${JSON.parse(localStorage.getItem('customer'))?.id}`)) || []);

    // Address Book states
    const [addressBook, setAddressBook] = useState([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [provinces, setProvinces] = useState([]);
        const [wards, setWards] = useState([]);
    const [newAddress, setNewAddress] = useState({ province: '', ward: '', specific: '', isDefault: false });

    useEffect(() => {
        if (location.state && location.state.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Mocks cho các trường không có trong DB nhưng có trong thiết kế
    const [gender, setGender] = useState(localStorage.getItem('mock_gender') || 'Nam');
    const [dob, setDob] = useState(localStorage.getItem('mock_dob') || '1990-05-15');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        password: ''
    });
    const [favorites, setFavorites] = useState([]);
    
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedCustomer = JSON.parse(localStorage.getItem('customer'));
        if (storedCustomer) {
            setCustomer(storedCustomer);
            setFormData({
                fullName: storedCustomer.fullName || '',
                phone: storedCustomer.phone || '',
                address: storedCustomer.address || ''
            });

            const mockGender = localStorage.getItem('mock_gender');
            const mockDob = localStorage.getItem('mock_dob');
            if (mockGender) setGender(mockGender);
            if (mockDob) setDob(mockDob);
            
            if (storedCustomer.addressBook) {
                try {
                    setAddressBook(JSON.parse(storedCustomer.addressBook));
                } catch (e) {
                    console.error("Error parsing address book", e);
                }
            }

            // Fetch orders
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/customer/${storedCustomer.id}`);
                    setOrders(response.data);
                } catch (error) {
                    console.error("Lỗi lấy đơn hàng", error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
            
            const loadFavorites = () => {
                const key = `favorites_${storedCustomer.id}`;
                setFavorites(JSON.parse(localStorage.getItem(key)) || []);
            };
            loadFavorites();
            window.addEventListener('favoritesUpdated', loadFavorites);
            return () => window.removeEventListener('favoritesUpdated', loadFavorites);
        } else {
            navigate('/login');
        }

        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/v2/?depth=2');
                setProvinces(res.data);
            } catch (err) {
                console.error("Failed to load provinces", err);
            }
        };
        fetchProvinces();
    }, [navigate]);

    useEffect(() => {
        if (newAddress.province) {
            const p = provinces.find(p => p.name === newAddress.province);
            setWards(p ? p.wards : []);
            setNewAddress(prev => ({ ...prev, ward: '' }));
        }
    }, [newAddress.province, provinces]);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('customer');
            localStorage.removeItem('cart_guest');
            navigate('/');
            window.location.reload();
        }
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');
        try {
            localStorage.setItem('mock_gender', gender);
            localStorage.setItem('mock_dob', dob);

            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/${customer.id}`, formData);
            if (response.data && response.data.customer) {
                localStorage.setItem('customer', JSON.stringify(response.data.customer));
                setCustomer(response.data.customer);
                setMessage('Cập nhật thông tin thành công!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Lỗi cập nhật", error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!passwordData.oldPassword || !passwordData.password) {
            toast.warning("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới");
            return;
        }
        setUpdating(true);
        setMessage('');
        try {
            const updatePayload = {
                fullName: customer.fullName,
                oldPassword: passwordData.oldPassword,
                password: passwordData.password
            };
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/${customer.id}`, updatePayload);
            if (response.data && response.data.customer) {
                setMessage('Đổi mật khẩu thành công!');
                setPasswordData({ oldPassword: '', password: '' });
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Lỗi cập nhật mật khẩu", error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const submitCancelOrder = async () => {
        if (!cancelOrderId) return;
        const finalReason = cancelReason === 'Lý do khác' ? cancelCustomReason : cancelReason;
        if (!finalReason.trim()) {
            toast.warning("Vui lòng nhập lý do hủy đơn");
            return;
        }
        setIsCanceling(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Orders/${cancelOrderId}/cancel`, {
                reason: finalReason
            });
            toast.success(response.data.message || "Đã hủy đơn hàng thành công");
            setCancelModalOpen(false);
            setCancelOrderId(null);
            setCancelReason('Không có nhu cầu');
            setCancelCustomReason('');
            
            // Cập nhật lại orders
            const ordersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/Orders/customer/${customer.id}`);
            setOrders(ordersResponse.data);
            
            // Trigger notification update
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
        } finally {
            setIsCanceling(false);
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                setUpdating(true);
                try {
                    const updatePayload = { avatarUrl: base64String };
                    const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/${customer.id}`, updatePayload);
                    if (response.data && response.data.customer) {
                        localStorage.setItem('customer', JSON.stringify(response.data.customer));
                        setCustomer(response.data.customer);
                    }
                } catch (error) {
                    console.error("Lỗi cập nhật ảnh đại diện", error);
                    toast("Không thể cập nhật ảnh đại diện");
                } finally {
                    setUpdating(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.province || !newAddress.ward || !newAddress.specific) {
            toast.warning("Vui lòng điền đầy đủ thông tin địa chỉ");
            return;
        }
        setUpdating(true);
        try {
            const addressToSave = { ...newAddress, id: Date.now().toString() };
            let updatedAddressBook = [...addressBook];
            if (addressToSave.isDefault) {
                updatedAddressBook = updatedAddressBook.map(a => ({ ...a, isDefault: false }));
            }
            if (updatedAddressBook.length === 0) addressToSave.isDefault = true;
            updatedAddressBook.push(addressToSave);

            const updatePayload = {
                addressBook: JSON.stringify(updatedAddressBook)
            };
            if (addressToSave.isDefault) {
                updatePayload.address = `${addressToSave.specific}, ${addressToSave.ward}, ${''}, ${addressToSave.province}`;
            }

            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/${customer.id}`, updatePayload);
            if (response.data && response.data.customer) {
                localStorage.setItem('customer', JSON.stringify(response.data.customer));
                setCustomer(response.data.customer);
                setAddressBook(updatedAddressBook);
                setIsAddingAddress(false);
                setNewAddress({ province: '', ward: '', specific: '', isDefault: false });
                if (addressToSave.isDefault) setFormData(prev => ({ ...prev, address: updatePayload.address }));
            }
        } catch (error) {
            console.error("Lỗi cập nhật sổ địa chỉ", error);
            toast.warning("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        setUpdating(true);
        try {
            const updatedAddressBook = addressBook.filter(a => a.id !== id);
            const updatePayload = {
                addressBook: JSON.stringify(updatedAddressBook)
            };
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/${customer.id}`, updatePayload);
            if (response.data && response.data.customer) {
                localStorage.setItem('customer', JSON.stringify(response.data.customer));
                setCustomer(response.data.customer);
                setAddressBook(updatedAddressBook);
            }
        } catch (error) {
            console.error("Lỗi xóa địa chỉ", error);
        } finally {
            setUpdating(false);
        }
    };

    const notifications = orders.map(o => {
        let title, content, color, icon;
        if (o.status === 0) {
            title = 'Đơn hàng chờ xác nhận';
            content = `Đơn hàng #${o.id} của bạn đã được hệ thống tiếp nhận và đang chờ xác nhận.`;
            color = 'secondary';
            icon = 'fa-clock';
        } else if (o.status === 1) {
            title = 'Đơn hàng chờ giao hàng';
            content = `Đơn hàng #${o.id} đã được xác nhận và đang chờ giao cho đơn vị vận chuyển.`;
            color = 'warning';
            icon = 'fa-box';
        } else if (o.status === 2) {
            title = 'Đơn hàng đang giao';
            content = `Đơn hàng #${o.id} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại.`;
            color = 'primary';
            icon = 'fa-truck-fast';
        } else if (o.status === 4 || o.status === 7) {
            title = 'Đơn hàng đã bị hủy';
            content = `Đơn hàng #${o.id} đã được hủy.`;
            color = 'danger';
            icon = 'fa-ban';
        } else if (o.status === 6) {
            title = 'Đơn hàng đang cập nhật';
            content = `Đơn hàng #${o.id} đang được cửa hàng cập nhật theo yêu cầu của bạn.`;
            color = 'info';
            icon = 'fa-pen-to-square';
        } else {
            title = 'Giao hàng thành công';
            content = `Đơn hàng #${o.id} đã được giao thành công. Cảm ơn bạn đã mua sắm tại hệ thống!`;
            color = 'success';
            icon = 'fa-check-circle';
        }
        return {
            id: `${o.id}_${o.status}`,
            orderId: o.id,
            date: new Date(o.orderDate),
            title, content, color, icon
        };
    }).sort((a, b) => b.orderId - a.orderId);

    const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

    useEffect(() => {
        if (activeTab === 'notifications' && notifications.length > 0) {
            const allIds = notifications.map(n => n.id);
            const newRead = [...new Set([...readNotifications, ...allIds])];
            if (newRead.length !== readNotifications.length) {
                setReadNotifications(newRead);
                localStorage.setItem(`read_notifications_${customer?.id}`, JSON.stringify(newRead));
            }
        }
    }, [activeTab, notifications, customer, readNotifications]);

    if (!customer) return null;

    const menuItems = [
        { id: 'account', icon: 'fa-regular fa-user', label: 'Thông tin tài khoản' },
        // { id: 'address', icon: 'fa-solid fa-location-dot', label: 'Sổ địa chỉ' },
        { id: 'orders', icon: 'fa-solid fa-file-invoice', label: 'Đơn hàng của tôi' },
        { id: 'wishlist', icon: 'fa-regular fa-heart', label: 'Sản phẩm yêu thích' },
        { id: 'password', icon: 'fa-solid fa-lock', label: 'Đổi mật khẩu' },
        { id: 'notifications', icon: 'fa-regular fa-bell', label: 'Thông báo', badge: unreadCount > 0 ? unreadCount : null },
    ];

    const avatarUrl = customer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName)}&background=random&color=fff&size=150`;

    return (
        <div className="flex-grow-1" style={{ backgroundColor: '#f4f4f4', padding: '40px 0' }}>
            <div className="container">
                <div className="row">
                    {/* LEFT SIDEBAR */}
                    <div className="col-lg-3 mb-4">
                        <div className="card shadow-sm border-0 mb-3" style={{ borderRadius: '12px' }}>
                            <div className="card-body d-flex align-items-center">
                                <label style={{ cursor: 'pointer', margin: 0, position: 'relative' }} title="Thay đổi ảnh đại diện">
                                    <img src={avatarUrl} alt="Avatar" className="rounded-circle mr-3 border" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                    <div className="position-absolute d-flex align-items-center justify-content-center rounded-circle" style={{ bottom: 0, right: '12px', width: '20px', height: '20px', backgroundColor: 'var(--zeychic-primary)', color: 'white', fontSize: '10px' }}>
                                        <i className="fa-solid fa-camera"></i>
                                    </div>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                                </label>
                                <div>
                                    <h6 className="font-weight-bold mb-1">{customer.fullName}</h6>
                                    <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>{customer.email}</p>
                                    <span className="badge badge-warning text-dark px-2 py-1" style={{ fontSize: '0.7rem', backgroundColor: '#ffd700' }}>
                                        <i className="fa-solid fa-crown mr-1"></i> Thành viên
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <div className="list-group list-group-flush">
                                {menuItems.map(item => (
                                    <button 
                                        key={item.id}
                                        className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 py-3 ${activeTab === item.id ? 'active text-white' : 'text-dark'}`}
                                        style={{ 
                                            backgroundColor: activeTab === item.id ? 'var(--zeychic-primary)' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem'
                                        }}
                                        onClick={() => setActiveTab(item.id)}
                                    >
                                        <div>
                                            <i className={`${item.icon} mr-3`} style={{ width: '20px', textAlign: 'center' }}></i>
                                            <span className={activeTab === item.id ? 'font-weight-bold' : ''}>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="badge badge-danger badge-pill" style={{ backgroundColor: activeTab === item.id ? '#fff' : 'var(--zeychic-primary)', color: activeTab === item.id ? 'var(--zeychic-primary)' : '#fff' }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                                <button 
                                    className="list-group-item list-group-item-action d-flex align-items-center border-0 py-3 text-dark"
                                    onClick={handleLogout}
                                    style={{ cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    <i className="fa-solid fa-arrow-right-from-bracket mr-3" style={{ width: '20px', textAlign: 'center' }}></i>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="col-lg-9">
                        
                        {/* THÔNG TIN TÀI KHOẢN */}
                        {activeTab === 'account' && (
                            <>
                                <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-4 p-md-5">
                                        <h4 className="font-weight-bold mb-2">Thông tin tài khoản</h4>
                                        <p className="text-muted mb-4 pb-3 border-bottom">Quản lý và cập nhật thông tin cá nhân của bạn.</p>
                                        
                                        {message && (
                                            <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'} mb-4`}>
                                                {message}
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-md-8 border-right pr-md-4">
                                                <form onSubmit={handleUpdateInfo}>
                                                    <div className="row">
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Họ và tên</label>
                                                            <input type="text" className="form-control shadow-none bg-light" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required style={{ border: 'none', borderRadius: '8px', padding: '10px 15px' }} />
                                                        </div>
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Email</label>
                                                            <input type="email" className="form-control shadow-none bg-light" value={customer.email} disabled style={{ border: 'none', borderRadius: '8px', padding: '10px 15px', color: '#999' }} />
                                                        </div>
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Số điện thoại</label>
                                                            <input type="text" className="form-control shadow-none bg-light" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ border: 'none', borderRadius: '8px', padding: '10px 15px' }} />
                                                        </div>
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Ngày sinh</label>
                                                            <input type="date" className="form-control shadow-none bg-light" value={dob} onChange={e => setDob(e.target.value)} style={{ border: 'none', borderRadius: '8px', padding: '10px 15px' }} />
                                                        </div>
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Giới tính</label>
                                                            <select className="form-control shadow-none bg-light" value={gender} onChange={e => setGender(e.target.value)} style={{ border: 'none', borderRadius: '8px', padding: '10px 15px' }}>
                                                                <option value="Nam">Nam</option>
                                                                <option value="Nữ">Nữ</option>
                                                                <option value="Khác">Khác</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-6 form-group mb-4">
                                                            <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Ngày tạo tài khoản</label>
                                                            <input type="text" className="form-control shadow-none bg-light" value="20/06/2026 10:15" disabled style={{ border: 'none', borderRadius: '8px', padding: '10px 15px', color: '#999' }} />
                                                        </div>
                                                    </div>

                                                    <div className="form-group mb-4">
                                                        <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Địa chỉ mặc định</label>
                                                        <input type="text" className="form-control shadow-none bg-light" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ border: 'none', borderRadius: '8px', padding: '10px 15px' }} />
                                                    </div>

                                                    <div className="d-flex mt-4 pt-2">
                                                        <button type="submit" className="btn text-white font-weight-bold px-4 py-2 mr-3" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} disabled={updating}>
                                                            <i className="fa-regular fa-floppy-disk mr-2"></i> {updating ? 'Đang lưu...' : 'Cập nhật thông tin'}
                                                        </button>
                                                        <button type="button" className="btn btn-light font-weight-bold px-4 py-2" style={{ border: '1px solid #ddd', borderRadius: '8px' }} onClick={() => {
                                                            setFormData({ fullName: customer.fullName || '', phone: customer.phone || '', address: customer.address || '' });
                                                            setGender(localStorage.getItem('mock_gender') || 'Nam');
                                                            setDob(localStorage.getItem('mock_dob') || '1990-05-15');
                                                        }}>
                                                            Hủy thay đổi
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="col-md-4 d-flex flex-column align-items-center justify-content-center mt-4 mt-md-0">
                                                <label style={{ cursor: 'pointer', textAlign: 'center' }} title="Thay đổi ảnh đại diện">
                                                    <div className="position-relative mb-3 mx-auto" style={{ width: '120px' }}>
                                                        <img src={avatarUrl} alt="Avatar" className="rounded-circle shadow-sm" style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #fff' }} />
                                                        <div className="position-absolute bg-white rounded-circle shadow d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', bottom: '0', right: '0' }}>
                                                            <i className="fa-solid fa-camera text-secondary"></i>
                                                        </div>
                                                    </div>
                                                    <h6 className="font-weight-bold text-dark">Ảnh đại diện</h6>
                                                    <p className="text-muted small text-center mb-3">JPG, PNG tối đa 2MB</p>
                                                    <div className="btn btn-outline-danger font-weight-bold py-1 px-4" style={{ borderRadius: '20px', borderColor: 'var(--zeychic-primary)', color: 'var(--zeychic-primary)' }}>
                                                        <i className="fa-solid fa-upload mr-2"></i> Đổi ảnh
                                                    </div>
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* SỔ ĐỊA CHỈ */}
                        {activeTab === 'address' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-2">Sổ địa chỉ</h4>
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                        <p className="text-muted mb-0">Quản lý các địa chỉ nhận hàng của bạn.</p>
                                        {!isAddingAddress && (
                                            <button className="btn btn-sm text-white" style={{ backgroundColor: 'var(--zeychic-primary)' }} onClick={() => setIsAddingAddress(true)}>
                                                <i className="fa-solid fa-plus mr-1"></i> Thêm địa chỉ mới
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isAddingAddress && (
                                        <div className="card bg-light border-0 mb-4 p-4" style={{ borderRadius: '10px' }}>
                                            <h6 className="font-weight-bold mb-3">Thêm địa chỉ mới</h6>
                                            <form onSubmit={handleSaveAddress}>
                                                <div className="row">
                                                    <div className="col-md-6 form-group mb-3">
                                                        <label className="small font-weight-bold">Tỉnh / Thành phố <span className="text-danger">*</span></label>
                                                        <select className="form-control shadow-none" value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} required>
                                                            <option value="">Chọn Tỉnh / Thành</option>
                                                            {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6 form-group mb-3">
                                                        <label className="small font-weight-bold">Phường / Xã <span className="text-danger">*</span></label>
                                                        <select className="form-control shadow-none" value={newAddress.ward} onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })} required disabled={!newAddress.province}>
                                                            <option value="">Chọn Phường / Xã</option>
                                                            {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label className="small font-weight-bold">Địa chỉ cụ thể (Số nhà, đường) <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control shadow-none" value={newAddress.specific} onChange={(e) => setNewAddress({ ...newAddress, specific: e.target.value })} required placeholder="Ví dụ: 123 Lê Lợi" />
                                                </div>
                                                <div className="form-check mb-4">
                                                    <input type="checkbox" className="form-check-input" id="isDefaultAddr" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                                                    <label className="form-check-label small" htmlFor="isDefaultAddr">Đặt làm địa chỉ mặc định</label>
                                                </div>
                                                <div className="d-flex">
                                                    <button type="submit" className="btn text-white px-4 py-2 mr-2" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} disabled={updating}>Lưu địa chỉ</button>
                                                    <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px' }} onClick={() => setIsAddingAddress(false)}>Hủy</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {addressBook.length === 0 && !isAddingAddress ? (
                                        <div className="text-center py-5">
                                            <i className="fa-solid fa-map-location-dot text-muted mb-3" style={{ fontSize: '3rem', opacity: '0.3' }}></i>
                                            <h6 className="text-muted">Bạn chưa có địa chỉ nào trong sổ</h6>
                                            <p className="small text-muted mb-0">Hãy thêm địa chỉ để thanh toán nhanh hơn</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {addressBook.map((addr) => (
                                                <div className="col-md-6 mb-3" key={addr.id}>
                                                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '10px' }}>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <div className="font-weight-bold">
                                                                    {customer.fullName}
                                                                    {addr.isDefault && <span className="badge badge-success ml-2" style={{ fontSize: '0.65rem' }}>Mặc định</span>}
                                                                </div>
                                                                <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteAddress(addr.id)}>
                                                                    <i className="fa-regular fa-trash-can"></i>
                                                                </button>
                                                            </div>
                                                            <p className="small text-muted mb-1">{customer.phone}</p>
                                                            <p className="small mb-0">{addr.specific}, {addr.ward}, {addr.province}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ĐƠN HÀNG CỦA TÔI */}
                        {activeTab === 'orders' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-4 pb-3 border-bottom">Đơn hàng của tôi</h4>
                                    
                                    {loadingOrders ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-danger mb-3" role="status" style={{ color: 'var(--zeychic-primary)' }}></div>
                                            <p className="text-muted">Đang tải lịch sử đơn hàng...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem', color: '#ccc' }}>
                                                <i className="fa-solid fa-box-open"></i>
                                            </div>
                                            <h6 className="font-weight-bold">Chưa có đơn hàng nào</h6>
                                            <p className="text-muted mb-4">Bạn chưa thực hiện giao dịch nào trên hệ thống.</p>
                                            <button className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} onClick={() => navigate('/san-pham')}>
                                                Tiếp tục mua sắm
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column" style={{ gap: '20px' }}>
                                            {orders.map(order => (
                                                <div key={order.id} className="card border p-3 rounded-lg shadow-sm hover-card" style={{ transition: 'all 0.3s' }}>
                                                    <div 
                                                        className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3" 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                    >
                                                        <div>
                                                            <span className="font-weight-bold text-dark mr-2">Mã ĐH: #{order.id}</span>
                                                            <span className="text-muted small">| Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <span className={`badge px-3 py-2 mr-3 ${order.status === 0 ? 'badge-warning text-dark' : order.status === 1 ? 'badge-info' : order.status === 2 ? 'badge-primary' : order.status === 3 ? 'badge-success' : (order.status === 4 || order.status === 7) ? 'badge-danger' : order.status === 6 ? 'badge-info' : 'badge-secondary'}`} style={{ borderRadius: '20px' }}>
                                                                {order.status === 0 ? 'Chờ xác nhận' : order.status === 1 ? 'Chờ giao hàng' : order.status === 2 ? 'Đang giao hàng' : order.status === 3 ? 'Đã giao' : (order.status === 4 || order.status === 7) ? 'Đã hủy' : order.status === 6 ? 'Đang cập nhật' : 'Hoàn thành'}
                                                            </span>
                                                            <i className={`fa-solid fa-chevron-${expandedOrderId === order.id ? 'up' : 'down'} text-muted`}></i>
                                                        </div>
                                                    </div>
                                                    
                                                    {expandedOrderId === order.id && (
                                                        <>
                                                            {order.details && order.details.map((d, idx) => (
                                                                <div key={idx} className="d-flex align-items-center mb-3 bg-white border-bottom pb-3">
                                                                    <div className="d-flex flex-grow-1 align-items-center">
                                                                        <div className="mr-3 shadow-sm" style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                                                            {d.imageUrl ? (
                                                                                <img src={d.imageUrl.split(',')[0].startsWith('http') ? d.imageUrl.split(',')[0] : `${import.meta.env.VITE_API_URL}${d.imageUrl.split(',')[0]}`} alt={d.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                            ) : (
                                                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><i className="fa-regular fa-image text-muted"></i></div>
                                                                            )}
                                                                        </div>
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="font-weight-bold mb-2 text-dark" style={{ fontSize: '1rem' }}>{d.productName}</h6>
                                                                            <div className="d-flex flex-wrap align-items-center mb-2" style={{ gap: '8px' }}>
                                                                                {d.color && (
                                                                                    <span className="font-weight-bold text-muted" style={{ backgroundColor: '#F8F6F2', fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px' }}>Màu: {d.color}</span>
                                                                                )}
                                                                                {d.size && (
                                                                                    <span className="font-weight-bold text-muted" style={{ backgroundColor: '#F8F6F2', fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px' }}>Size: {d.size}</span>
                                                                                )}
                                                                                {(!d.color && !d.size) && (
                                                                                    <span className="font-weight-bold text-muted" style={{ backgroundColor: '#F8F6F2', fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px' }}>Phân loại: Mặc định</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>ID sản phẩm: {d.productId}</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="d-flex align-items-center justify-content-end text-right ml-4" style={{ gap: '30px', minWidth: '300px' }}>
                                                                        <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                                                                            {d.unitPrice.toLocaleString('vi-VN')} VNĐ
                                                                        </div>
                                                                        <div className="font-weight-bold text-dark" style={{ width: '30px', textAlign: 'center', fontSize: '1.05rem' }}>
                                                                            {d.quantity}
                                                                        </div>
                                                                        <div className="font-weight-bold" style={{ color: 'var(--zeychic-primary)', minWidth: '120px', fontSize: '1.05rem' }}>
                                                                            {(d.unitPrice * d.quantity).toLocaleString('vi-VN')} VNĐ
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    {order.status === 0 && (
                                                                        <button 
                                                                            className="btn btn-outline-danger font-weight-bold px-3 py-1" 
                                                                            style={{ borderRadius: '6px' }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setCancelOrderId(order.id);
                                                                                setCancelModalOpen(true);
                                                                            }}
                                                                        >
                                                                            Hủy đơn
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="mr-3 text-dark">Tổng số tiền:</span>
                                                                    <span className="h5 mb-0 font-weight-bold" style={{ color: 'var(--zeychic-primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ĐỔI MẬT KHẨU */}
                        {activeTab === 'password' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-2">Đổi mật khẩu</h4>
                                    <p className="text-muted mb-4 pb-3 border-bottom">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                                    
                                    {message && (
                                        <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'} mb-4`}>
                                            {message}
                                        </div>
                                    )}

                                        <form onSubmit={handleUpdatePassword} style={{ maxWidth: '500px' }}>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Mật khẩu hiện tại</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control shadow-none bg-light" 
                                                    value={passwordData.oldPassword} 
                                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                    required 
                                                    placeholder="Nhập mật khẩu hiện tại..."
                                                    style={{ border: 'none', borderRadius: '8px', padding: '12px 15px' }} 
                                                />
                                            </div>
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Mật khẩu mới</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control shadow-none bg-light" 
                                                    value={passwordData.password} 
                                                    onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                                                    required 
                                                    placeholder="Nhập mật khẩu mới..."
                                                    style={{ border: 'none', borderRadius: '8px', padding: '12px 15px' }} 
                                                />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <button type="submit" className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} disabled={updating}>
                                                    <i className="fa-solid fa-key mr-2"></i> {updating ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                                                </button>
                                                <Link to="/forgot-password" state={{ defaultEmail: customer.email }} style={{ color: 'var(--zeychic-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Quên mật khẩu?</Link>
                                            </div>
                                        </form>
                                </div>
                            </div>
                        )}

                        {/* SẢN PHẨM YÊU THÍCH */}
                        {activeTab === 'wishlist' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-4 pb-3 border-bottom">Sản phẩm yêu thích</h4>
                                    {favorites.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem', color: '#ccc' }}>
                                                <i className="fa-regular fa-heart"></i>
                                            </div>
                                            <h6 className="font-weight-bold">Chưa có sản phẩm yêu thích</h6>
                                            <p className="text-muted mb-4">Hãy thêm những sản phẩm bạn yêu thích vào danh sách này nhé.</p>
                                            <button className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} onClick={() => navigate('/san-pham')}>
                                                Khám phá ngay
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {favorites.map(item => (
                                                <ProductCard key={item.id} item={item} colClass="col-lg-4 col-md-6 mb-4" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* THÔNG BÁO CẬP NHẬT ĐƠN HÀNG */}
                        {activeTab === 'notifications' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-4 pb-3 border-bottom">Thông báo của bạn</h4>
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem', color: '#ccc' }}>
                                                <i className="fa-regular fa-bell-slash"></i>
                                            </div>
                                            <h6 className="font-weight-bold">Không có thông báo mới</h6>
                                            <p className="text-muted mb-4">Các cập nhật về trạng thái đơn hàng sẽ tự động xuất hiện ở đây.</p>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {notifications.map((n, idx) => (
                                                <div key={n.id} className={`list-group-item py-3 px-0 border-bottom ${idx === 0 ? 'pt-0' : ''}`}>
                                                    <div className="d-flex">
                                                        <div className={`text-${n.color} bg-light rounded-circle d-flex align-items-center justify-content-center mr-3`} style={{ width: '50px', height: '50px', fontSize: '1.2rem', flexShrink: 0 }}>
                                                            <i className={`fa-solid ${n.icon}`}></i>
                                                        </div>
                                                        <div className="w-100">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <h6 className="font-weight-bold mb-0 text-dark">{n.title}</h6>
                                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{n.date.toLocaleDateString('vi-VN')} {n.date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</small>
                                                            </div>
                                                            <p className="text-muted mb-0 small" style={{ lineHeight: '1.5' }}>{n.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>

            {/* Modal Hủy Đơn Hàng */}
            {cancelModalOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title font-weight-bold">Hủy Đơn Hàng #{cancelOrderId}</h5>
                                <button type="button" className="close" onClick={() => { setCancelModalOpen(false); setCancelOrderId(null); }}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">Vui lòng chọn lý do hủy đơn hàng:</p>
                                <div className="form-group">
                                    <select 
                                        className="form-control shadow-none bg-light border-0" 
                                        style={{ padding: '10px 15px', height: 'auto', borderRadius: '8px' }}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    >
                                        <option value="Không có nhu cầu">Không có nhu cầu</option>
                                        <option value="Thay đổi địa chỉ">Thay đổi địa chỉ</option>
                                        <option value="Thay đổi phân loại size, màu sắc">Thay đổi phân loại size, màu sắc</option>
                                        <option value="Lý do khác">Lý do khác</option>
                                    </select>
                                </div>
                                {cancelReason === 'Lý do khác' && (
                                    <div className="form-group mt-3">
                                        <textarea 
                                            className="form-control shadow-none bg-light border-0" 
                                            style={{ borderRadius: '8px' }}
                                            rows="3" 
                                            placeholder="Nhập lý do cụ thể..."
                                            value={cancelCustomReason}
                                            onChange={(e) => setCancelCustomReason(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light" onClick={() => { setCancelModalOpen(false); setCancelOrderId(null); }} style={{ borderRadius: '8px' }} disabled={isCanceling}>
                                    Trở lại
                                </button>
                                <button type="button" className="btn text-white font-weight-bold" onClick={submitCancelOrder} style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} disabled={isCanceling}>
                                    {isCanceling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
