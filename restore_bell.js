const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cms.frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                            )}

                            {/* Giỏ hàng mua sắm */}`;

const replaceStr = `                            )}

                            {/* Chuông thông báo */}
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
                                                                if (n.type === 'Order' || n.type === 'AdminMessage') navigate('/profile', { state: { tab: 'orders' } });
                                                                if (n.type === 'Review') navigate(\`/san-pham/\${n.relatedId}\`);
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

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Restored Notification Bell successfully!");
