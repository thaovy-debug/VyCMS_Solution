import React from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

export default function Blog() {
    return (
        <main className="container py-5 flex-grow-1">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent px-0 mb-4">
                    <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                    <li className="breadcrumb-item active text-dark font-weight-bold" aria-current="page">Blog & Tin tức</li>
                </ol>
            </nav>
            <div className="card border-0 shadow-sm mb-4 bg-white p-4">
                <PostList />
            </div>
        </main>
    );
}
