const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'cms.frontend/src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const stateTarget = `    const [cartCount, setCartCount] = useState(() => {`;
const stateReplace = `    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [cartCount, setCartCount] = useState(() => {`;

content = content.replace(stateTarget, stateReplace);

const logicTarget = /    useEffect\(\(\) => \{\r?\n        const updateCartCount = \(\) => \{/;
const logicReplace = `    useEffect(() => {
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

content = content.replace(logicTarget, logicReplace);

fs.writeFileSync(appPath, content, 'utf8');
console.log("Injected notifications state and logic");
