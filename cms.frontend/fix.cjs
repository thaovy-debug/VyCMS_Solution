const fs = require('fs');
let c = fs.readFileSync('src/components/VariantModal.jsx', 'utf8');
// Fix the bad characters and formatting
c = c.replace(/\{new Intl\.NumberFormat\('vi-VN'\)\.format\(item\.discountPercent > 0 \? item\.price \* \(1 - item\.discountPercent \/ 100\) \+ ' VN' : item\.price\)\}/g, "{(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}");

// Wait, what if the character is not strictly ''? Let's just regex match the ' VN.*?'
c = c.replace(/\{new Intl\.NumberFormat\('vi-VN'\)\.format\(item\.discountPercent \> 0 \? item\.price \* \(1 \- item\.discountPercent \/ 100\) \+ ' VN.*?' \: item\.price\)\}/g, "{(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}");

fs.writeFileSync('src/components/VariantModal.jsx', c, 'utf8');
