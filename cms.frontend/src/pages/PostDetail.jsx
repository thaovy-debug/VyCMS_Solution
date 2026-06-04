import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogService from '../services/blogService';

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const data = await blogService.getPostById(id);
                setPost(data);
            } catch (err) {
                console.error('Lỗi khi tải chi tiết bài viết:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return <div className="text-center py-5 my-5 text-muted">Đang tải bài viết...</div>;
    }

    if (!post) {
        return <div className="text-center py-5 my-5 text-danger font-weight-bold">Không tìm thấy bài viết!</div>;
    }

    return (
        <main className="container py-5 flex-grow-1">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent px-0 mb-4">
                    <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                    <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">Tin tức</li>
                </ol>
            </nav>

            <article className="card border-0 shadow-sm rounded-lg overflow-hidden p-4 p-md-5 mx-auto" style={{ maxWidth: '900px', backgroundColor: '#fff' }}>
                <div className="mb-4 text-center">
                    <span className="badge px-3 py-2 rounded-pill font-weight-bold text-uppercase mb-3" style={{ backgroundColor: '#F8F6F2', color: 'var(--thieuhoa-primary)', letterSpacing: '1px' }}>
                        Tin tức thời trang
                    </span>
                    <h1 className="font-weight-bold text-dark mb-3" style={{ lineHeight: '1.4', fontSize: '2rem' }}>{post.title}</h1>
                    <div className="text-muted small">
                        <i className="fa-regular fa-calendar mr-2"></i>
                        {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                {post.imageUrl && (
                    <div className="mb-5 text-center">
                        <img src={post.imageUrl} alt={post.title} className="img-fluid rounded shadow-sm" style={{ maxHeight: '500px', objectFit: 'cover' }} />
                    </div>
                )}

                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content || '<p>Đang cập nhật nội dung chi tiết...</p>' }} style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#444' }}>
                </div>
            </article>
        </main>
    );
}
