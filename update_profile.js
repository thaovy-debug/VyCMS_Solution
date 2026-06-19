const fs = require('fs');
let code = fs.readFileSync('e:/asp/VyCMS_Solution/cms.frontend/src/pages/Profile.jsx', 'utf8');

// 1. Add ProductCard import
code = code.replace(
  "import axios from 'axios';",
  "import axios from 'axios';\nimport ProductCard from '../components/ProductCard';"
);

// 2. Add Favorites and Forgot Password states
code = code.replace(
  "const [passwordData, setPasswordData] = useState({\n        password: ''\n    });",
  "const [passwordData, setPasswordData] = useState({\n        oldPassword: '',\n        password: ''\n    });\n    const [favorites, setFavorites] = useState([]);\n    const [showOtpForm, setShowOtpForm] = useState(false);\n    const [otp, setOtp] = useState('');\n    const [newPassword, setNewPassword] = useState('');"
);

// 3. Update useEffect
code = code.replace(
  "        fetchOrders();\n    }, [customer, navigate]);",
  "        fetchOrders();\n        \n        const loadFavorites = () => {\n            const key = `favorites_${customer.id}`;\n            setFavorites(JSON.parse(localStorage.getItem(key)) || []);\n        };\n        loadFavorites();\n        window.addEventListener('favoritesUpdated', loadFavorites);\n        return () => window.removeEventListener('favoritesUpdated', loadFavorites);\n    }, [customer, navigate]);"
);

// 4. Update Password logic
code = code.replace(
  /const handleUpdatePassword = async \(e\) => \{[\s\S]*?finally \{\n            setUpdating\(false\);\n        \}\n    \};/,
  `const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!passwordData.oldPassword || !passwordData.password) {
            alert("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới");
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
            const response = await axios.put(\`\${import.meta.env.VITE_API_URL}/api/Auth/CustomerUpdate/\${customer.id}\`, updatePayload);
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

    const handleForgotPassword = async () => {
        try {
            const res = await axios.post(\`\${import.meta.env.VITE_API_URL}/api/Auth/CustomerForgotPassword\`, { email: customer.email });
            setMessage(res.data.message || "Đã gửi mã OTP đến email của bạn.");
            setShowOtpForm(true);
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi gửi yêu cầu khôi phục mật khẩu.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(\`\${import.meta.env.VITE_API_URL}/api/Auth/CustomerResetPassword\`, { email: customer.email, otp, newPassword });
            setMessage(res.data.message || "Khôi phục mật khẩu thành công! Hãy dùng mật khẩu mới để đăng nhập lần sau.");
            setShowOtpForm(false);
            setOtp('');
            setNewPassword('');
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi khôi phục mật khẩu.");
        }
    };`
);

// 5. Update menuItems
code = code.replace(
  /const menuItems = \[\s*[\s\S]*?\];/,
  `const menuItems = [
        { id: 'account', icon: 'fa-regular fa-user', label: 'Thông tin tài khoản' },
        { id: 'address', icon: 'fa-solid fa-location-dot', label: 'Sổ địa chỉ' },
        { id: 'orders', icon: 'fa-solid fa-file-invoice', label: 'Đơn hàng của tôi' },
        { id: 'wishlist', icon: 'fa-regular fa-heart', label: 'Sản phẩm yêu thích' },
        { id: 'password', icon: 'fa-solid fa-lock', label: 'Đổi mật khẩu' },
        { id: 'notifications', icon: 'fa-regular fa-bell', label: 'Thông báo', badge: 3 },
    ];`
);

// 6. Update Orders UI
code = code.replace(
  /\{\/\* ĐƠN HÀNG CỦA TÔI \*\/\}[\s\S]*?\{\/\* ĐỔI MẬT KHẨU \*\/\}/,
  `{/* ĐƠN HÀNG CỦA TÔI */}
                        {activeTab === 'orders' && (
                            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', minHeight: '500px' }}>
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="font-weight-bold mb-4 pb-3 border-bottom">Đơn hàng của tôi</h4>
                                    
                                    {loadingOrders ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-danger mb-3" role="status" style={{ color: 'var(--thieuhoa-primary)' }}></div>
                                            <p className="text-muted">Đang tải lịch sử đơn hàng...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem', color: '#ccc' }}>
                                                <i className="fa-solid fa-box-open"></i>
                                            </div>
                                            <h6 className="font-weight-bold">Chưa có đơn hàng nào</h6>
                                            <p className="text-muted mb-4">Bạn chưa thực hiện giao dịch nào trên hệ thống.</p>
                                            <button className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }} onClick={() => navigate('/san-pham')}>
                                                Tiếp tục mua sắm
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column" style={{ gap: '20px' }}>
                                            {orders.map(order => (
                                                <div key={order.id} className="card border p-3 rounded-lg shadow-sm hover-card" style={{ cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => alert(\`Đang mở chi tiết đơn hàng #\${order.id}\`)}>
                                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                                        <div>
                                                            <span className="font-weight-bold text-dark mr-2">Mã ĐH: #{order.id}</span>
                                                            <span className="text-muted small">| Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                        <span className={\`badge px-3 py-2 \${order.status === 0 ? 'badge-warning text-dark' : order.status === 1 ? 'badge-primary' : 'badge-success'}\`} style={{ borderRadius: '20px' }}>
                                                            {order.status === 0 ? 'Chờ xác nhận' : order.status === 1 ? 'Đang giao' : 'Hoàn thành'}
                                                        </span>
                                                    </div>
                                                    {order.details && order.details.map((d, idx) => (
                                                        <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-light d-flex align-items-center justify-content-center border rounded mr-3" style={{ width: '60px', height: '60px' }}>
                                                                    <i className="fa-regular fa-image text-muted"></i>
                                                                </div>
                                                                <div>
                                                                    <h6 className="font-weight-bold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>{d.productName}</h6>
                                                                    <div className="text-muted small">Size: {d.size || 'Mặc định'} x {d.quantity}</div>
                                                                </div>
                                                            </div>
                                                            <div className="font-weight-bold" style={{ color: 'var(--thieuhoa-primary) !important' }}>
                                                                {(d.unitPrice * d.quantity).toLocaleString('vi-VN')}đ
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="border-top pt-3 mt-2 d-flex justify-content-end align-items-center">
                                                        <span className="mr-3 text-dark">Tổng số tiền:</span>
                                                        <span className="h5 mb-0 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ĐỔI MẬT KHẨU */}`
);

// 7. Update Password UI
code = code.replace(
  /<form onSubmit=\{handleUpdatePassword\}[\s\S]*?<\/form>/,
  `{showOtpForm ? (
                                        <form onSubmit={handleResetPassword} style={{ maxWidth: '500px' }}>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Mã OTP (Đã gửi vào {customer.email})</label>
                                                <input type="text" className="form-control shadow-none bg-light" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Nhập mã 6 số từ email..." style={{ border: 'none', borderRadius: '8px', padding: '12px 15px' }} />
                                            </div>
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold text-secondary" style={{ fontSize: '0.85rem' }}>Mật khẩu mới</label>
                                                <input type="password" className="form-control shadow-none bg-light" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Nhập mật khẩu mới..." style={{ border: 'none', borderRadius: '8px', padding: '12px 15px' }} />
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <button type="submit" className="btn text-white font-weight-bold px-4 py-2 mr-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }}>
                                                    Xác nhận khôi phục
                                                </button>
                                                <span onClick={() => setShowOtpForm(false)} style={{ cursor: 'pointer', color: 'var(--thieuhoa-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Quay lại</span>
                                            </div>
                                        </form>
                                    ) : (
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
                                                <button type="submit" className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }} disabled={updating}>
                                                    <i className="fa-solid fa-key mr-2"></i> {updating ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                                                </button>
                                                <span onClick={handleForgotPassword} style={{ cursor: 'pointer', color: 'var(--thieuhoa-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Quên mật khẩu?</span>
                                            </div>
                                        </form>
                                    )}`
);

// 8. Add Wishlist UI
code = code.replace(
  /\{\/\* TÍNH NĂNG CHƯA PHÁT TRIỂN \*\/\}[\s\S]*?includes\(activeTab\) && \(/,
  `{/* SẢN PHẨM YÊU THÍCH */}
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
                                            <button className="btn text-white font-weight-bold px-4 py-2" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }} onClick={() => navigate('/san-pham')}>
                                                Khám phá ngay
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {favorites.map(item => (
                                                <ProductCard key={item.id} item={item} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TÍNH NĂNG CHƯA PHÁT TRIỂN */}
                        {['address', 'notifications'].includes(activeTab) && (`
);

fs.writeFileSync('e:/asp/VyCMS_Solution/cms.frontend/src/pages/Profile.jsx', code);
console.log('Updated Profile.jsx');
