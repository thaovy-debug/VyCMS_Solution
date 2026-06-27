const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cms.frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
const importTarget = "import menuService from './services/menuService';";
const importRep = "import menuService from './services/menuService';\nimport notificationService from './services/notificationService';";
content = content.replace(importTarget, importRep);

// Add state
const stateTarget = "const [menus, setMenus] = useState([]);";
const stateRep = "const [menus, setMenus] = useState([]);\n    const [notifications, setNotifications] = useState([]);\n    const [showNotifications, setShowNotifications] = useState(false);";
content = content.replace(stateTarget, stateRep);

// Add useEffect
const useEffectTarget = "loadMenus(); // Thực thi tải menu động\n    }, []); // Chỉ chạy 1 lần khi render";
const useEffectRep = `loadMenus(); // Thực thi tải menu động
    }, []); // Chỉ chạy 1 lần khi render

    useEffect(() => {
        if (customer) {
            const fetchNotifications = async () => {
                try {
                    const res = await notificationService.getNotifications(customer.id);
                    setNotifications(res || []);
                } catch(e) {}
            };
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [customer]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch(e) {}
    };`;
content = content.replace(useEffectTarget, useEffectRep);

// Add bell icon
const cartTarget = "{/* Giỏ hàng mua sắm */}";
const cartRep = `{/* Chuông thông báo */}
                            {customer && (
                                <div className="position-relative" style={{ cursor: 'pointer' }}>
                                    <div onClick={() => setShowNotifications(!showNotifications)} className="d-flex align-items-center text-dark hover-link position-relative">
                                        <i className="fa-regular fa-bell text-danger" style={{ fontSize: '1.3rem', color: 'var(--thieuhoa-primary)' }}></i>
                                        {notifications.filter(n => !n.isRead).length > 0 && (
                                            <span className="position-absolute badge badge-danger badge-pill font-weight-bold" style={{ top: '-8px', right: '-8px', backgroundColor: 'var(--thieuhoa-primary)', fontSize: '0.65rem' }}>
                                                {notifications.filter(n => !n.isRead).length}
                                            </span>
                                        )}
                                    </div>
                                    {showNotifications && (
                                        <div className="dropdown-menu dropdown-menu-right show shadow p-0" style={{ position: 'absolute', right: 0, top: '40px', width: '320px', zIndex: 1000, borderRadius: '8px', border: '1px solid #eee' }}>
                                            <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                                <h6 className="m-0 font-weight-bold">Thông báo</h6>
                                                <span 
                                                    style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--thieuhoa-primary)' }} 
                                                    onClick={async () => {
                                                        try {
                                                            await notificationService.markAllAsRead(customer.id);
                                                            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                                                        } catch(e) {}
                                                    }}
                                                >
                                                    Đánh dấu đã đọc
                                                </span>
                                            </div>
                                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div className="p-4 text-center text-muted">Không có thông báo nào</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div 
                                                            key={n.id} 
                                                            className={\`p-3 border-bottom \${!n.isRead ? 'bg-white' : ''}\`}
                                                            style={{ cursor: 'pointer', backgroundColor: !n.isRead ? '#fff9f9' : '#fff', transition: 'background-color 0.2s' }}
                                                            onClick={() => {
                                                                if (!n.isRead) handleMarkAsRead(n.id);
                                                                setShowNotifications(false);
                                                                if (n.type === 'Order') navigate('/profile');
                                                                if (n.type === 'Review') navigate('/profile');
                                                            }}
                                                        >
                                                            <h6 className="font-weight-bold mb-1" style={{ fontSize: '0.9rem', color: !n.isRead ? 'var(--thieuhoa-primary)' : '#333' }}>{n.title}</h6>
                                                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>{n.message}</p>
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(n.createdDate).toLocaleString('vi-VN')}</small>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Giỏ hàng mua sắm */}`;

content = content.replace(cartTarget, cartRep);

fs.writeFileSync(filePath, content, 'utf8');
console.log("App.jsx updated!");
