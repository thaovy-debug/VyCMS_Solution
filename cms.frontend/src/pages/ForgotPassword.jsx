import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (location.state && location.state.defaultEmail) {
            setEmail(location.state.defaultEmail);
        }
    }, [location.state]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning("Vui lòng nhập Email của bạn.");
            return;
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerForgotPassword`, { email });
            toast(res.data.message || "Đã gửi mã OTP đến email của bạn.");
            setShowOtpForm(true);
        } catch (err) {
            toast.warning(err.response?.data?.message || "Lỗi gửi yêu cầu khôi phục mật khẩu.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerResetPassword`, { email, otp, newPassword });
            toast.success(res.data.message || "Khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay.");
            navigate('/login');
        } catch (err) {
            toast.warning(err.response?.data?.message || "Lỗi khôi phục mật khẩu.");
        }
    };

    if (showOtpForm) {
        return (
            <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
                <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
                    <h3 className="text-center mb-4 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>KHÔI PHỤC MẬT KHẨU</h3>
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group mb-3">
                            <label className="font-weight-bold">Email của bạn</label>
                            <input type="email" className="form-control" value={email} disabled />
                        </div>
                        <div className="form-group mb-3">
                            <label className="font-weight-bold">Mã OTP</label>
                            <input type="text" className="form-control" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Nhập mã 6 số từ email..." />
                        </div>
                        <div className="form-group mb-4">
                            <label className="font-weight-bold">Mật khẩu mới</label>
                            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Nhập mật khẩu mới..." />
                        </div>
                        <button type="submit" className="btn btn-block text-white font-weight-bold py-2 mb-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px', width: '100%' }}>XÁC NHẬN</button>
                        <div className="text-center">
                            <span 
                                onClick={() => setShowOtpForm(false)} 
                                style={{ cursor: 'pointer', color: 'var(--thieuhoa-primary)', fontWeight: 'bold' }}
                            >
                                Quay lại nhập email
                            </span>
                        </div>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
                <h3 className="text-center mb-4 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>QUÊN MẬT KHẨU</h3>
                <p className="text-center text-muted small mb-4">Vui lòng nhập địa chỉ email bạn đã đăng ký để nhận mã OTP khôi phục mật khẩu.</p>
                <form onSubmit={handleForgotPassword}>
                    <div className="form-group mb-4">
                        <label className="font-weight-bold">Email của bạn</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Nhập email..." />
                    </div>
                    <button type="submit" className="btn btn-block text-white font-weight-bold py-2 mb-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px', width: '100%' }}>GỬI MÃ OTP</button>
                    <div className="text-center">
                        <span className="text-muted">Nhớ mật khẩu? </span>
                        <Link to="/login" style={{ color: 'var(--thieuhoa-primary)', fontWeight: 'bold' }}>Quay lại đăng nhập</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
