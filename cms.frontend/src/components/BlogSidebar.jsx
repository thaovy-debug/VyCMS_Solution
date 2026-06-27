import React, { useState, useEffect } from 'react';
import blogService from '../services/blogService';

function BlogSidebar({ activeCategory, onFilterChange }) {
    // 2. State lưu trữ danh sách danh mục nạp từ Database
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 3. useEffect gọi API ngay khi component vừa nạp lên màn hình
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                setLoading(true);
                const response = await blogService.getAllCategories();
                setCategories(response.data || response);
            } catch (error) {
                console.error("Thất bại khi lấy danh mục bài viết động:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoriesData();
    }, []);

    return (
        <div className="card p-3 shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <h6 className="font-weight-bold text-uppercase mb-3" style={{ color: 'var(--zeychic-primary)', letterSpacing: '1px' }}>
                <i className="fas fa-folder-open mr-2"></i>Chủ đề Blog
            </h6>

            <div className="list-group list-group-flush">
                {/* Nút xem tất cả: Bắn giá trị null về hàm onCategoryChange ở trang Cha */}
                <button
                    className={`list-group-item list-group-item-action border-0 px-2 d-flex align-items-center ${activeCategory === null ? 'text-primary font-weight-bold bg-light' : 'text-secondary'}`}
                    onClick={() => onFilterChange(null)}
                    style={{ borderRadius: '8px', transition: 'all 0.2s', backgroundColor: activeCategory === null ? '#f8f9fa' : 'transparent', color: activeCategory === null ? 'var(--zeychic-primary)' : 'inherit' }}
                >
                    <i className={`fas fa-chevron-right mr-2 small ${activeCategory === null ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'var(--zeychic-primary)' }}></i>
                    Tất cả bản tin
                </button>

                {loading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ color: 'var(--zeychic-primary)' }}></div>
                    </div>
                ) : (
                    categories.map(cat => (
                        /* Nút danh mục động: Bắn chính xác ID khóa chính (cat.id) về trang Cha */
                        <button
                            key={cat.id}
                            className={`list-group-item list-group-item-action border-0 px-2 d-flex align-items-center ${activeCategory === cat.id ? 'text-primary font-weight-bold bg-light' : 'text-secondary'}`}
                            onClick={() => onFilterChange({ categoryId: cat.id })}
                            style={{ borderRadius: '8px', transition: 'all 0.2s', fontSize: '15px', backgroundColor: activeCategory === cat.id ? '#f8f9fa' : 'transparent', color: activeCategory === cat.id ? 'var(--zeychic-primary)' : 'inherit' }}
                        >
                            <i className={`fas fa-chevron-right mr-2 small ${activeCategory === cat.id ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'var(--zeychic-primary)' }}></i>
                            {cat.name}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export default BlogSidebar;
