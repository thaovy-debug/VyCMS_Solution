import axiosClient from '../api/axiosClient';

const notificationService = {
    getNotifications: (customerId) => {
        return axiosClient.get(`/NotificationsApi/customer/${customerId}`);
    },
    markAsRead: (id) => {
        return axiosClient.put(`/NotificationsApi/${id}/read`);
    },
    markAllAsRead: (customerId) => {
        return axiosClient.put(`/NotificationsApi/customer/${customerId}/readAll`);
    }
};

export default notificationService;
