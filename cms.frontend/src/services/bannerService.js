import axiosClient from '../api/axiosClient';

const bannerService = {
    getAllBanners: () => {
        return axiosClient.get('/Banners');
    }
};

export default bannerService;
