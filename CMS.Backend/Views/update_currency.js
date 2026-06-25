const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.cshtml')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = content;
            
            modified = modified.replace(/\.ToString\("N0"\)\s*₫/g, '.ToString("N0") VNĐ');
            modified = modified.replace(/\.ToString\("N0"\)\s*đ/g, '.ToString("N0") VNĐ');
            
            if (content !== modified) {
                fs.writeFileSync(fullPath, modified, 'utf8');
                console.log('Updated ' + fullPath);
            }
        }
    }
}
processDir('.');
