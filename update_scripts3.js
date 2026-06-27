const fs = require('fs');
let content = fs.readFileSync('cms.frontend/src/pages/Profile.jsx', 'utf8');

const target1 = `                                                            <div className="d-flex align-items-center justify-content-end text-right ml-4" style={{ gap: '30px', minWidth: '300px' }}>
                                                                <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                                                                    {d.unitPrice.toLocaleString('vi-VN')} VNĐ
                                                                </div>
                                                                <div className="font-weight-bold text-dark" style={{ width: '30px', textAlign: 'center', fontSize: '1.05rem' }}>
                                                                    {d.quantity}
                                                                </div>
                                                                <div className="font-weight-bold" style={{ color: 'var(--thieuhoa-primary)', minWidth: '120px', fontSize: '1.05rem' }}>
                                                                    {(d.unitPrice * d.quantity).toLocaleString('vi-VN')} VNĐ
                                                                </div>
                                                            </div>`;

const rep1 = `                                                            <div className="d-flex flex-column align-items-end ml-4" style={{ gap: '10px', minWidth: '150px' }}>
                                                                <div className="d-flex align-items-center justify-content-end text-right" style={{ gap: '20px' }}>
                                                                    <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                                                                        {d.unitPrice.toLocaleString('vi-VN')} VNĐ <span className="mx-1">x</span> {d.quantity}
                                                                    </div>
                                                                    <div className="font-weight-bold" style={{ color: 'var(--thieuhoa-primary)', fontSize: '1.05rem' }}>
                                                                        {(d.unitPrice * d.quantity).toLocaleString('vi-VN')} VNĐ
                                                                    </div>
                                                                </div>
                                                                {(order.status === 1 || order.status === 2 || order.status === 3) && !reviewedProducts[\`\${order.id}_\${d.productId}\`] && (
                                                                    <button 
                                                                        className="btn btn-sm text-white mt-2" 
                                                                        style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '4px', fontSize: '0.85rem' }}
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenReviewModal(order, d); }}
                                                                    >
                                                                        Đánh giá sản phẩm
                                                                    </button>
                                                                )}
                                                                {reviewedProducts[\`\${order.id}_\${d.productId}\`] && (
                                                                    <span className="badge badge-success mt-2 p-2" style={{ borderRadius: '4px' }}>Đã đánh giá</span>
                                                                )}
                                                            </div>`;

content = content.split(target1).join(rep1);

const target1Crlf = target1.replace(/\n/g, '\r\n');
content = content.split(target1Crlf).join(rep1);

const target2 = `                                                    <div className="border-top pt-3 mt-2 d-flex justify-content-end align-items-center">
                                                        <span className="mr-3 text-dark">Tổng số tiền:</span>
                                                        <span className="h5 mb-0 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                                                    </div>`;

const rep2 = `                                                    <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                                                        <div>
                                                            {(order.status === 1 || order.status === 2 || order.status === 3) && (() => {
                                                                const allReviewed = order.details && order.details.every(d => reviewedProducts[\`\${order.id}_\${d.productId}\`]);
                                                                if (!allReviewed) {
                                                                    return (
                                                                        <button 
                                                                            className="btn btn-sm text-white font-weight-bold" 
                                                                            style={{ backgroundColor: 'var(--thieuhoa-primary)', borderRadius: '4px', padding: '8px 20px', fontSize: '0.9rem' }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (order.details && order.details.length === 1) {
                                                                                    handleOpenReviewModal(order, order.details[0]);
                                                                                } else {
                                                                                    if (expandedOrderId !== order.id) {
                                                                                        setExpandedOrderId(order.id);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            Đánh giá sản phẩm
                                                                        </button>
                                                                    );
                                                                }
                                                                return <span className="text-success font-weight-bold"><i className="fa-solid fa-check-circle mr-1"></i> Đã đánh giá toàn bộ</span>;
                                                            })()}
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="mr-3 text-dark">Tổng số tiền:</span>
                                                            <span className="h5 mb-0 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                                                        </div>
                                                    </div>`;

content = content.split(target2).join(rep2);
const target2Crlf = target2.replace(/\n/g, '\r\n');
content = content.split(target2Crlf).join(rep2);

fs.writeFileSync('cms.frontend/src/pages/Profile.jsx', content);
console.log('Profile updated completely via split/join');
