const fs = require('fs');
let c = fs.readFileSync('src/pages/Shop.jsx', 'utf8');
c = c.replace(/bannerUrl = cat\.imageUrl\.startsWith\('http'\) \? cat\.imageUrl \: \\\\;/g, 'bannerUrl = cat.imageUrl.startsWith(\'http\') ? cat.imageUrl : `${import.meta.env.VITE_API_URL}${cat.imageUrl}`;');
fs.writeFileSync('src/pages/Shop.jsx', c, 'utf8');
