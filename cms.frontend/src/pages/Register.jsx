import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/CustomerRegister`, formData);
            if (res.status === 201) {
                alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi đăng ký. Vui lòng kiểm tra lại.");
        }
    };

    return (
        <main className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
            <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px' }}>
                <h3 className="text-center mb-4 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>ĐĂNG KÝ TÀI KHOẢN</h3>
                <form onSubmit={handleRegister}>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Họ và tên</label>
                        <input name="fullName" type="text" className="form-control" onChange={handleChange} required placeholder="Nhập họ tên..." />
                    </div>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Email</label>
                        <input name="email" type="email" className="form-control" onChange={handleChange} required placeholder="Nhập email..." />
                    </div>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Mật khẩu</label>
                        <input name="password" type="password" className="form-control" onChange={handleChange} required placeholder="Tạo mật khẩu..." />
                    </div>
                    <div className="form-group mb-3">
                        <label className="font-weight-bold">Số điện thoại</label>
                        <input name="phone" type="text" className="form-control" onChange={handleChange} placeholder="Nhập số điện thoại..." />
                    </div>
                    <div className="form-group mb-4">
                        <label className="font-weight-bold">Địa chỉ</label>
                        <input name="address" type="text" className="form-control" onChange={handleChange} placeholder="Nhập địa chỉ..." />
                    </div>
                    <button type="submit" className="btn btn-block text-white font-weight-bold py-2 mb-3" style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '8px' }}>ĐĂNG KÝ</button>
                    <div className="text-center">
                        <span className="text-muted">Đã có tài khoản? </span>
                        <Link to="/login" style={{ color: 'var(--thieuhoa-primary)', fontWeight: 'bold' }}>Đăng nhập</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
