const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cms.frontend/src/pages/ProductDetail.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add ProductCard import
if (!content.includes('import ProductCard')) {
    content = content.replace(
        `import { toast } from 'react-toastify';`,
        `import { toast } from 'react-toastify';\r\nimport ProductCard from '../components/ProductCard';`
    );
}

// 2. Add relatedProducts state
if (!content.includes('const [relatedProducts, setRelatedProducts]')) {
    content = content.replace(
        `    const [reviews, setReviews] = useState([]);`,
        `    const [reviews, setReviews] = useState([]);\r\n    const [relatedProducts, setRelatedProducts] = useState([]);`
    );
}

// 3. Add fetching related products
const fetchTarget = `                try {
                    const revRes = await reviewService.getProductReviews(id);
                    setReviews(revRes || []);
                } catch(e) {
                    console.error('Lỗi lấy đánh giá', e);
                }`;
const fetchReplacement = `                try {
                    const revRes = await reviewService.getProductReviews(id);
                    setReviews(revRes || []);
                } catch(e) {
                    console.error('Lỗi lấy đánh giá', e);
                }

                if (data.categoryId) {
                    try {
                        const relatedData = await productService.getProductsByCategory(data.categoryId);
                        const filtered = relatedData.filter(p => p.id.toString() !== id.toString()).slice(0, 4);
                        setRelatedProducts(filtered);
                    } catch (e) {
                        console.error('Lỗi lấy sản phẩm liên quan:', e);
                    }
                }`;
if (!content.includes('productService.getProductsByCategory(data.categoryId)')) {
    content = content.replace(fetchTarget, fetchReplacement);
}

// 4. Update the render section
const renderTarget = `                    <h4 className="font-weight-bold text-center mb-5 text-dark text-uppercase mt-5">CÓ THỂ BẠN SẼ THÍCH</h4>
                    <div className="row text-center mb-5 text-muted">
                        <div className="col-12 py-5">
                            Hiện chưa có sản phẩm gợi ý
                        </div>
                    </div>`;
const renderReplacement = `                    <h4 className="font-weight-bold text-center mb-5 text-dark text-uppercase mt-5">CÓ THỂ BẠN SẼ THÍCH</h4>
                    {relatedProducts && relatedProducts.length > 0 ? (
                        <div className="row mb-5">
                            {relatedProducts.map(item => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="row text-center mb-5 text-muted">
                            <div className="col-12 py-5">
                                Hiện chưa có sản phẩm gợi ý
                            </div>
                        </div>
                    )}`;

if (content.includes('Hiện chưa có sản phẩm gợi ý') && !content.includes('relatedProducts.map(item =>')) {
    content = content.replace(renderTarget, renderReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('ProductDetail.jsx updated successfully.');
