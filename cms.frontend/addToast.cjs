const fs = require('fs');
const appPath = 'e:/asp/VyCMS_Solution/cms.frontend/src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

if (!content.includes('ToastContainer')) {
    content = content.replace("import { toast } from 'react-toastify';", "import { ToastContainer, toast } from 'react-toastify';\nimport 'react-toastify/dist/ReactToastify.css';");
    content = content.replace("<div className=\"w-100 min-vh-100 d-flex flex-column\"", "<div className=\"w-100 min-vh-100 d-flex flex-column\">\n            <ToastContainer position=\"top-right\" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme=\"light\" />");
    fs.writeFileSync(appPath, content, 'utf8');
}
