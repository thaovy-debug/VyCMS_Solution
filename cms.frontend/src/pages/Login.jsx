import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerLogin`, { email, password });
            if (res.status === 200) {
                alert("Đăng nhập thành công!");
                localStorage.setItem('customer', JSON.stringify(res.data.customer));
                window.location.href = '/'; 
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại.");
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Vui lòng nhập Email của bạn vào ô Email trước khi bấm Quên mật khẩu.");
            return;
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerForgotPassword`, { email });
            alert(res.data.message || "Đã gửi mật khẩu mới đến email của bạn.");
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi gửi yêu cầu khôi phục mật khẩu.");
        }
    };

    return (
        <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
                <h3 className="text-center mb-4 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>ĐĂNG NHẬP</h3>
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Email của bạn</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Nhập email..." />
                    </div>
                    <div className="form-group mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <label className="font-weight-bold mb-0">Mật khẩu</label>
                            <span 
                                onClick={handleForgotPassword} 
                                style={{ cursor: 'pointer', color: 'var(--thieuhoa-primary)', fontSize: '0.9rem' }}
                            >
                                Quên mật khẩu?
                            </span>
                        </div>
                        <input type="password" className="form-control mt-2" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Nhập mật khẩu..." />
                    </div>
                    <button type="submit" className="btn btn-block text-white font-weight-bold py-2 mb-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px', width: '100%' }}>ĐĂNG NHẬP</button>
                    <div className="text-center">
                        <span className="text-muted">Chưa có tài khoản? </span>
                        <Link to="/register" style={{ color: 'var(--thieuhoa-primary)', fontWeight: 'bold' }}>Đăng ký ngay</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
