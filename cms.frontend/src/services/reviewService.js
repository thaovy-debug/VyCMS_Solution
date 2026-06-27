import axiosClient from '../api/axiosClient';

const reviewService = {
    // Thêm đánh giá mới
    addReview: (reviewData) => {
        // reviewData có thể là FormData để hỗ trợ upload ảnh
        return axiosClient.post('/ReviewsApi', reviewData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Lấy danh sách đánh giá của sản phẩm
    getProductReviews: (productId) => {
        return axiosClient.get(`/ReviewsApi/product/${productId}`);
    },

    // Lấy danh sách đánh giá của user cho một đơn hàng (để biết đã đánh giá chưa)
    getOrderReviews: (orderId) => {
        return axiosClient.get(`/ReviewsApi/order/${orderId}`);
    }
};

export default reviewService;
