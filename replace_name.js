const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'cms.frontend/src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/Thiều Hoa/g, 'ZeyChíc');
    newContent = newContent.replace(/THIỀU HOA/g, 'ZEYCHÍc');
    // For specific cases like "THIỀU HOA DESIGN", wait, ZEYCHÍc DESIGN? Let's just fix the casing.
    newContent = newContent.replace(/ZEYCHÍc/g, 'ZEYCHÍC');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Replaced in ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            replaceInFile(fullPath);
        }
    });
}

walkDir(directoryPath);
console.log('Replacement complete.');
