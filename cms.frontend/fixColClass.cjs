const fs = require('fs');

function replaceFile(path, target, replacement) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
}

// 1. Profile.jsx
replaceFile(
    'e:/asp/VyCMS_Solution/cms.frontend/src/pages/Profile.jsx', 
    '<ProductCard key={item.id} item={item} />', 
    '<ProductCard key={item.id} item={item} colClass="col-lg-4 col-md-6 mb-4" />'
);

// 2. ProductList.jsx
replaceFile(
    'e:/asp/VyCMS_Solution/cms.frontend/src/components/ProductList.jsx', 
    '<ProductCard key={item.id} item={item} />', 
    '<ProductCard key={item.id} item={item} colClass="col-lg-4 col-md-6 mb-4" />'
);
