const fs = require('fs');

// Update ProductDetail.jsx
let contentPD = fs.readFileSync('cms.frontend/src/pages/ProductDetail.jsx', 'utf8');

contentPD = contentPD.replace(
    /import productService from '\.\.\/services\/productService';\r?\nimport { toast } from 'react-toastify';/,
    `import productService from '../services/productService';\nimport reviewService from '../services/reviewService';\nimport { toast } from 'react-toastify';`
);

contentPD = contentPD.replace(
    /const \[product, setProduct\] = useState\(null\);\r?\n    const \[loading, setLoading\] = useState\(true\);/,
    `const [product, setProduct] = useState(null);\n    const [loading, setLoading] = useState(true);\n    const [reviews, setReviews] = useState([]);`
);

contentPD = contentPD.replace(
    /                }\r?\n            } catch \(err\) {/,
    `                }\n                try {\n                    const revRes = await reviewService.getProductReviews(id);\n                    setReviews(revRes.data);\n                } catch(e) {\n                    console.error('Lỗi lấy đánh giá', e);\n                }\n            } catch (err) {`
);

contentPD = contentPD.replace(
    /    if \(!product\) {\r?\n        return <div className="text-center py-5 my-5 text-danger font-weight-bold">Không tìm thấy sản phẩm!<\/div>;\r?\n    }\r?\n\r?\n    return \(/,
    `    if (!product) {\n        return <div className="text-center py-5 my-5 text-danger font-weight-bold">Không tìm thấy sản phẩm!</div>;\n    }\n\n    const totalReviews = reviews.length;\n    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '0.0';\n    const ratingCounts = { 5:0, 4:0, 3:0, 2:0, 1:0 };\n    reviews.forEach(r => ratingCounts[r.rating]++);\n\n    return (`
);

contentPD = contentPD.replace(
    /                            <i className="fa-solid fa-star text-secondary"><\/i><i className="fa-solid fa-star text-secondary"><\/i><i className="fa-solid fa-star text-secondary"><\/i><i className="fa-solid fa-star text-secondary"><\/i><i className="fa-solid fa-star text-secondary"><\/i> \r?\n                            <span className="ml-1">\(0\) 0 Nhận xét<\/span>/,
    `                            {[1,2,3,4,5].map(star => (\n                                <i key={star} className={star <= Math.round(avgRating) ? "fa-solid fa-star text-secondary" : "fa-regular fa-star text-secondary"}></i>\n                            ))}\n                            <span className="ml-1\">({avgRating}) {totalReviews} Nhận xét</span>`
);

const newReviewSection = `                <div className="col-12">
                    <h5 className="font-weight-bold mb-1 text-dark">Đánh giá sản phẩm</h5>
                    <p className="text-muted mb-4">{totalReviews} đánh giá</p>
                    <div className="p-4 bg-light d-flex align-items-center justify-content-center mb-5" style={{ borderRadius: '0' }}>
                        <div className="text-center pr-5 border-right" style={{ borderColor: '#ccc' }}>
                            <h2 className="font-weight-bold m-0" style={{ fontSize: '3rem' }}>{avgRating} <span className="text-muted" style={{ fontSize: '1.5rem' }}>/ 5</span></h2>
                            <div className="text-secondary mt-2" style={{ fontSize: '1.2rem' }}>
                                {[1,2,3,4,5].map(star => (
                                    <i key={star} className={star <= Math.round(avgRating) ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                ))}
                            </div>
                        </div>
                        <div className="pl-5" style={{ minWidth: '400px' }}>
                            <p className="mb-3 font-weight-bold">Sản phẩm được đánh giá</p>
                            {[5,4,3,2,1].map(star => (
                                <div key={star} className="d-flex align-items-center mb-2">
                                    <span style={{ width: '50px' }}>{star} sao</span>
                                    <div className="progress flex-grow-1 mx-3" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-secondary" role="progressbar" style={{ width: \`\${totalReviews > 0 ? (ratingCounts[star] / totalReviews) * 100 : 0}%\` }}></div>
                                    </div>
                                    <span style={{ width: '30px' }}>({ratingCounts[star]})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {reviews.length > 0 && (
                        <div className="mb-5">
                            {reviews.map(review => (
                                <div key={review.id} className="d-flex border-bottom pb-4 mb-4">
                                    <img src={review.customerAvatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(review.customerName)}&background=random&color=fff\`} alt={review.customerName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div className="ml-3 flex-grow-1">
                                        <h6 className="font-weight-bold mb-1">{review.customerName}</h6>
                                        <div className="text-warning mb-2" style={{ fontSize: '0.85rem' }}>
                                            {[1,2,3,4,5].map(star => (
                                                <i key={star} className={star <= review.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                            ))}
                                        </div>
                                        <p className="mb-2">{review.comment}</p>
                                        {review.imageUrl && (
                                            <img src={review.imageUrl.startsWith('http') ? review.imageUrl : \`\${import.meta.env.VITE_API_URL}\${review.imageUrl}\`} alt="Review" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />
                                        )}
                                        <p className="text-muted small mt-2 mb-0">{new Date(review.createdDate).toLocaleDateString('vi-VN')} {new Date(review.createdDate).toLocaleTimeString('vi-VN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h4 className="font-weight-bold text-center mb-5 text-dark text-uppercase mt-5">CÓ THỂ BẠN SẼ THÍCH</h4>`;

contentPD = contentPD.replace(
    /<div className="col-12">\r?\n\s+<h5 className="font-weight-bold mb-1 text-dark">Đánh giá sản phẩm<\/h5>[\s\S]*?CÓ THỂ BẠN SẼ THÍCH<\/h4>/,
    newReviewSection
);

fs.writeFileSync('cms.frontend/src/pages/ProductDetail.jsx', contentPD);
console.log('ProductDetail updated');

// Update Profile.jsx
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

const newReviewButton = `                                                                <div className="d-flex flex-column align-items-end ml-4" style={{ gap: '10px', minWidth: '150px' }}>
                                                                    <div className="d-flex align-items-center justify-content-end text-right" style={{ gap: '20px' }}>
                                                                        <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                                                                            {d.unitPrice.toLocaleString('vi-VN')} VNĐ <span className="mx-1">x</span> {d.quantity}
                                                                        </div>
                                                                        <div className="font-weight-bold" style={{ color: 'var(--thieuhoa-primary)', fontSize: '1.05rem' }}>
                                                                            {(d.unitPrice * d.quantity).toLocaleString('vi-VN')} VNĐ
                                                                        </div>
                                                                    </div>
                                                                    {(order.status === 1 || order.status === 2) && !reviewedProducts[\`\${order.id}_\${d.productId}\`] && (
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
    /<div className="d-flex align-items-center justify-content-end text-right ml-4" style={{ gap: '30px', minWidth: '300px' }}>[\s\S]*?{\(d\.unitPrice \* d\.quantity\)\.toLocaleString\('vi-VN'\)} VNĐ\r?\n                                                                    <\/div>\r?\n                                                                <\/div>/g,
    newReviewButton
);

contentProf = contentProf.replace(
    /            <\/div>\r?\n        <\/div>\r?\n    \);\r?\n}\r?\n\r?\nexport default Profile;/,
    `            </div>\n            <ReviewModal \n                isOpen={isReviewModalOpen} \n                onClose={() => setIsReviewModalOpen(false)} \n                order={reviewOrder} \n                productDetail={reviewProductDetail} \n                onReviewSuccess={handleReviewSuccess}\n            />\n        </div>\n    );\n}\n\nexport default Profile;`
);

fs.writeFileSync('cms.frontend/src/pages/Profile.jsx', contentProf);
console.log('Profile updated');
