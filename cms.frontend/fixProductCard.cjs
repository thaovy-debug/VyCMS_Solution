const fs = require('fs');
const path = 'e:/asp/VyCMS_Solution/cms.frontend/src/components/ProductCard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. replace alert with toast
content = content.replace(/alert\('Số lượng sản phẩm trong kho không đủ!'\);/g, "toast.warning('Số lượng sản phẩm trong kho không đủ!');");
if (!content.includes("import { toast }")) {
    content = content.replace("import VariantModal", "import { toast } from 'react-toastify';\nimport VariantModal");
}

// 2. fix color xanh đá
content = content.replace("if (n.includes('xám') || n.includes('ghi')) return '#95a5a6';", "if (n.includes('xám') || n.includes('ghi') || n.includes('xanh đá')) return '#95a5a6';");

// 3. add colClass prop
content = content.replace("const ProductCard = ({ item }) => {", "const ProductCard = ({ item, colClass = 'col-lg-3 col-md-4 col-sm-6 mb-4' }) => {");
content = content.replace("<div className=\"col-lg-3 col-md-4 col-sm-6 mb-4\">", "<div className={colClass}>");

fs.writeFileSync(path, content, 'utf8');
