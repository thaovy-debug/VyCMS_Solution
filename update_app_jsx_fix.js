const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cms.frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetEffect = `    useEffect(() => {
        const updateCartCount = () => {`;
const replaceEffect = `    useEffect(() => {
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

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Lỗi cập nhật thông báo:", error);
        }
    };

    useEffect(() => {
        const updateCartCount = () => {`;

content = content.replace(targetEffect, replaceEffect);

const targetNav = `                                                                if (!n.isRead) handleMarkAsRead(n.id);
                                                                setShowNotifications(false);
                                                                if (n.type === 'Order') navigate('/profile');
                                                                if (n.type === 'Review') navigate('/profile');`;
const replaceNav = `                                                                if (!n.isRead) handleMarkAsRead(n.id);
                                                                setShowNotifications(false);
                                                                if (n.type === 'Order' || n.type === 'AdminMessage') navigate('/profile', { state: { tab: 'orders' } });
                                                                if (n.type === 'Review') navigate(\`/san-pham/\${n.relatedId}\`);`;

content = content.replace(targetNav, replaceNav);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated App.jsx successfully!");
