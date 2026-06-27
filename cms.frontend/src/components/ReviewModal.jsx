import React, { useState } from 'react';
import { toast } from 'react-toastify';
import reviewService from '../services/reviewService';

const ReviewModal = ({ isOpen, onClose, order, productDetail, onReviewSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !order || !productDetail) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const customer = JSON.parse(localStorage.getItem('customer'));
            const formData = new FormData();
            formData.append('ProductId', productDetail.productId);
            formData.append('CustomerId', customer.id);
            formData.append('OrderId', order.id);
            formData.append('Rating', rating);
            formData.append('Comment', comment);
            if (imageFile) {
                formData.append('ImageFile', imageFile);
            }

            await reviewService.addReview(formData);
            toast.success("Đánh giá sản phẩm thành công!");
            if (onReviewSuccess) {
                onReviewSuccess(order.id, productDetail.productId);
            }
            onClose();
        } catch (error) {
            console.error("Lỗi đánh giá", error);
            toast.error(error.response?.data || "Có lỗi xảy ra khi gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                    <div className="modal-header border-bottom-0 pb-0">
                        <h5 className="modal-title font-weight-bold">Đánh giá sản phẩm</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="d-flex align-items-center mb-4 bg-light p-2 rounded">
                                <img 
                                    src={productDetail.imageUrl ? (productDetail.imageUrl.split(',')[0].startsWith('http') ? productDetail.imageUrl.split(',')[0] : `${import.meta.env.VITE_API_URL}${productDetail.imageUrl.split(',')[0]}`) : ''} 
                                    alt="Product" 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} 
                                />
                                <div className="ml-3">
                                    <h6 className="font-weight-bold mb-1">{productDetail.productName}</h6>
                                    <p className="small text-muted mb-0">{(productDetail.color || productDetail.size) ? `Phân loại: ${productDetail.color || ''} ${productDetail.size || ''}` : ''}</p>
                                </div>
                            </div>

                            <div className="form-group text-center mb-4">
                                <label className="font-weight-bold mb-2">Chất lượng sản phẩm</label>
                                <div className="d-flex justify-content-center" style={{ gap: '10px', fontSize: '2rem', color: '#ffc107', cursor: 'pointer' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <i 
                                            key={star} 
                                            className={star <= rating ? "fa-solid fa-star" : "fa-regular fa-star"}
                                            onClick={() => setRating(star)}
                                        ></i>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <textarea 
                                    className="form-control shadow-none" 
                                    rows="4" 
                                    placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label 
                                    className="btn btn-outline-secondary w-100 border-dashed text-muted mb-0 d-flex flex-column align-items-center justify-content-center"
                                    style={{ border: '2px dashed #ddd', borderRadius: '8px', height: '100px', cursor: 'pointer' }}
                                >
                                    <i className="fa-solid fa-camera mb-2" style={{ fontSize: '1.5rem' }}></i>
                                    <span>Thêm hình ảnh</span>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="position-relative mt-2" style={{ width: '80px', height: '80px' }}>
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-danger position-absolute" 
                                        style={{ top: '-5px', right: '-5px', borderRadius: '50%', width: '24px', height: '24px', padding: 0, lineHeight: '24px' }}
                                        onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                            )}

                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" onClick={onClose} style={{ borderRadius: '8px' }}>Trở lại</button>
                            <button type="submit" className="btn text-white px-4" style={{ backgroundColor: 'var(--zeychic-primary)', borderRadius: '8px' }} disabled={submitting}>
                                {submitting ? 'Đang gửi...' : 'Hoàn thành'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
