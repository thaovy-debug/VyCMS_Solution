const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // replace alert( with toast(
            // but let's try to be smart
            // alert("thành công") -> toast.success("thành công")
            // alert("lỗi") -> toast.error("lỗi")
            
            if (content.includes('alert(')) {
                content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
                    const str = p1.toLowerCase();
                    if (str.includes('thành công') || str.includes('đã thêm') || str.includes('thành công!')) {
                        return `toast.success(${p1})`;
                    } else if (str.includes('lỗi') || str.includes('không đủ') || str.includes('vui lòng') || str.includes('trống')) {
                        return `toast.warning(${p1})`;
                    } else {
                        return `toast(${p1})`;
                    }
                });
                
                if (!content.includes("import { toast }")) {
                    // insert import
                    const lines = content.split('\n');
                    let lastImportIdx = -1;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].trim().startsWith('import ')) {
                            lastImportIdx = i;
                        }
                    }
                    if (lastImportIdx !== -1) {
                        lines.splice(lastImportIdx + 1, 0, "import { toast } from 'react-toastify';");
                        content = lines.join('\n');
                    } else {
                        content = "import { toast } from 'react-toastify';\n" + content;
                    }
                }
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(dir);
