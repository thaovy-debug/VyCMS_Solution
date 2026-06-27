const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cms.frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `    useEffect(() => {
        const updateCartCount = () => {`;

const replacement = `    useEffect(() => {
        const loadNotifications = async () => {
            const currentCustomer = JSON.parse(localStorage.getItem('customer'));
            if (currentCustomer && currentCustomer.id) {
                try {
                    const data = await notificationService.getNotifications(currentCustomer.id);
                    setNotifications(data);
                } catch (error) {
                    console.error("Lỗi khi tải thông báo:", error);
                }
            } else {
                setNotifications([]);
            }
        };

        loadNotifications();
        const intervalId = setInterval(loadNotifications, 10000);

        return () => clearInterval(intervalId);
    }, [customer]);

    useEffect(() => {
        const updateCartCount = () => {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated App.jsx successfully!");
} else {
    console.log("Target not found!");
}
