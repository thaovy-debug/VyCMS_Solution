import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerLogin`, { email, password });
            if (res.status === 200) {
                toast.success("Đăng nhập thành công!");
                const customer = res.data.customer;
                localStorage.setItem('customer', JSON.stringify(customer));
                
                // Migrate and merge guest cart / legacy cart to the new customer cart
                const cartKey = `cart_${customer.id}`;
                let userCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
                const legacyCart = JSON.parse(localStorage.getItem('cart')) || [];
                
                const combined = [...userCart, ...guestCart, ...legacyCart];
                if (combined.length > 0) {
                    const mergedMap = new Map();
                    combined.forEach(item => {
                        const key = `${item.id}-${item.size || ''}-${item.color || ''}`;
                        if (mergedMap.has(key)) {
                            mergedMap.get(key).quantity += item.quantity;
                        } else {
                            mergedMap.set(key, { ...item });
                        }
                    });
                    localStorage.setItem(cartKey, JSON.stringify(Array.from(mergedMap.values())));
                }
                
                localStorage.removeItem('cart_guest');
                localStorage.removeItem('cart');

                window.location.href = '/'; 
            }
        } catch (err) {
            toast.warning(err.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại.");
        }
    };

    return (
        <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
                <h3 className="text-center mb-4 font-weight-bold" style={{ color: 'var(--zeychic-primary)' }}>ĐĂNG NHẬP</h3>
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Email của bạn</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Nhập email..." />
                    </div>
                    <div className="form-group mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <label className="font-weight-bold mb-0">Mật khẩu</label>
                            <Link 
                                to="/forgot-password" 
                                state={{ defaultEmail: email }}
                                style={{ color: 'var(--zeychic-primary)', fontSize: '0.9rem' }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <input type="password" className="form-control mt-2" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Nhập mật khẩu..." />
                    </div>
                    <button type="submit" className="btn btn-block text-white font-weight-bold py-2 mb-3" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px', width: '100%' }}>ĐĂNG NHẬP</button>
                    <div className="text-center">
                        <span className="text-muted">Chưa có tài khoản? </span>
                        <Link to="/register" style={{ color: 'var(--zeychic-primary)', fontWeight: 'bold' }}>Đăng ký ngay</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
