const fs = require('fs');

let contentProf = fs.readFileSync('cms.frontend/src/pages/Profile.jsx', 'utf8');

contentProf = contentProf.replace(
    /import axios from 'axios';\r?\nimport ProductCard from '\.\.\/components\/ProductCard';\r?\nimport { toast } from 'react-toastify';/,
    `import axios from 'axios';\nimport ProductCard from '../components/ProductCard';\nimport { toast } from 'react-toastify';\nimport ReviewModal from '../components/ReviewModal';\nimport reviewService from '../services/reviewService';`
);

contentProf = contentProf.replace(
    /    const \[orders, setOrders\] = useState\(\[\]\);\r?\n    const \[loadingOrders, setLoadingOrders\] = useState\(true\);\r?\n    const \[expandedOrderId, setExpandedOrderId\] = useState\(null\);/,
    `    const [orders, setOrders] = useState([]);\n    const [loadingOrders, setLoadingOrders] = useState(true);\n    const [expandedOrderId, setExpandedOrderId] = useState(null);\n    const [reviewedProducts, setReviewedProducts] = useState({});\n    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);\n    const [reviewOrder, setReviewOrder] = useState(null);\n    const [reviewProductDetail, setReviewProductDetail] = useState(null);`
);

contentProf = contentProf.replace(
    /            const fetchOrders = async \(\) => {\r?\n                try {\r?\n                    const response = await axios\.get\(`\${import\.meta\.env\.VITE_API_URL}\/api\/Orders\/customer\/\${storedCustomer\.id}`\);\r?\n                    setOrders\(response\.data\);\r?\n                } catch \(error\) {/,
    `            const fetchOrders = async () => {\n                try {\n                    const response = await axios.get(\`\${import.meta.env.VITE_API_URL}/api/Orders/customer/\${storedCustomer.id}\`);\n                    setOrders(response.data);\n                    const orderIds = response.data.map(o => o.id);\n                    const reviewed = {};\n                    for (const oid of orderIds) {\n                        try {\n                            const revRes = await reviewService.getOrderReviews(oid);\n                            revRes.data.forEach(r => {\n                                reviewed[\`\${r.orderId}_\${r.productId}\`] = true;\n                            });\n                        } catch(e) {}\n                    }\n                    setReviewedProducts(reviewed);\n                } catch (error) {`
);

contentProf = contentProf.replace(
    /        } finally {\r?\n            setUpdating\(false\);\r?\n        }\r?\n    };/,
    `        } finally {\n            setUpdating(false);\n        }\n    };\n\n    const handleOpenReviewModal = (order, detail) => {\n        setReviewOrder(order);\n        setReviewProductDetail(detail);\n        setIsReviewModalOpen(true);\n    };\n\n    const handleReviewSuccess = (orderId, productId) => {\n        setReviewedProducts(prev => ({...prev, [\`\${orderId}_\${productId}\`]: true}));\n    };`
);

const newReviewButton = `                                                            <div className="d-flex flex-column align-items-end ml-4" style={{ gap: '10px', minWidth: '150px' }}>
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

contentProf = contentProf.replace(
    /<div className="d-flex align-items-center justify-content-end text-right ml-4" style={{ gap: '30px', minWidth: '300px' }}>[\s\S]*?\{\(d\.unitPrice \* d\.quantity\)\.toLocaleString\('vi-VN'\)\} VNĐ\r?\n\s*<\/div>\r?\n\s*<\/div>/g,
    newReviewButton
);

const totalAmountBlock = `                                                    <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
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
                                                                return <span className="text-success font-weight-bold"><i className="fa-solid fa-check-circle mr-1"></i> Đã đánh giá</span>;
                                                            })()}
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="mr-3 text-dark">Tổng số tiền:</span>
                                                            <span className="h5 mb-0 font-weight-bold" style={{ color: 'var(--thieuhoa-primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                                                        </div>
                                                    </div>`;

contentProf = contentProf.replace(
    /<div className="border-top pt-3 mt-2 d-flex justify-content-end align-items-center">\r?\n\s*<span className="mr-3 text-dark">Tổng số tiền:<\/span>\r?\n\s*<span className="h5 mb-0 font-weight-bold" style={{ color: 'var\(--thieuhoa-primary\)' }}>\{order\.totalAmount\?\.toLocaleString\('vi-VN'\)\} VNĐ<\/span>\r?\n\s*<\/div>/g,
    totalAmountBlock
);

contentProf = contentProf.replace(
    /            <\/div>\r?\n        <\/div>\r?\n    \);\r?\n}\r?\n\r?\nexport default Profile;/,
    `            </div>\n            <ReviewModal \n                isOpen={isReviewModalOpen} \n                onClose={() => setIsReviewModalOpen(false)} \n                order={reviewOrder} \n                productDetail={reviewProductDetail} \n                onReviewSuccess={handleReviewSuccess}\n            />\n        </div>\n    );\n}\n\nexport default Profile;`
);

fs.writeFileSync('cms.frontend/src/pages/Profile.jsx', contentProf);
console.log('Profile updated');
