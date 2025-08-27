import { apiCall } from "./utils/api.js";

export const ProductAPI = {

    getAllProducts: async() => {
        return await apiCall({ endpoint: "/products/get-all-products" });
    },

    // Lấy sản phẩm chờ duyệt
    getPendingProducts: async() => {
        return await apiCall({ endpoint: "/products/get-pending-products" });
    },

    // Lấy sản phẩm đã duyệt
    getApprovedProducts: async(page = 1, limit = 15) => {
        return await apiCall({ endpoint: `/products/get-approved-products?page=${page}&limit=${limit}` });
    },

    // Lấy sản phẩm bị từ chối
    getRejectedProducts: async() => {
        return await apiCall({ endpoint: "/products/get-rejected-products" });
    },

    // Lấy sản phẩm theo ID
    getProductById: async(id) => {
        return await apiCall({ endpoint: `/products/${id}` });
    },

    // Tạo sản phẩm mới
    createProduct: async(data) => {
        return await apiCall({
            endpoint: "/products",
            method: "POST",
            data,
        });
    },

    // Duyệt sản phẩm
    approveProduct: async(id) => {
        return await apiCall({
            endpoint: `/products/approve-product/${id}`,
            method: "PUT",
            data: { status: "approved" },
        });
    },

    // Từ chối sản phẩm
    rejectProduct: async(id, reason) => {
        return await apiCall({
            endpoint: `/products/reject-product/${id}`,
            method: "PUT",
            data: {
                status: "rejected",
                rejectionReason: reason
            },
        });
    },

    // Cập nhật sản phẩm
    updateProduct: async(id, data) => {
        return await apiCall({
            endpoint: `/products/${id}`,
            method: "PATCH",
            data,
        });
    },

    // Xoá sản phẩm
    deleteProduct: async(id) => {
        return await apiCall({
            endpoint: `/products/${id}`,
            method: "DELETE",
        });
    },

    // Lấy sản phẩm theo shop ID và trạng thái 
    getProductsByShopId: async(shopId) => {
        return await apiCall({ endpoint: `/products/by-shop/${shopId}` });
    },

    getApprovedProductsByShopId: async(shopId) => {
        return await apiCall({ endpoint: `/products/by-shop/${shopId}/approved` });
    },

    getPendingProductsByShopId: async(shopId) => {
        return await apiCall({ endpoint: `/products/by-shop/${shopId}/pending` });
    },

    getRejectedProductsByShopId: async(shopId) => {
        return await apiCall({ endpoint: `/products/by-shop/${shopId}/rejected` });
    },

    getFeaturedProducts: async () => {
        return await apiCall({ endpoint: "/products/featured" });
    },

    getProductsByShop: async(shopId, status = 'all', searchTerm = '', sortBy = 'createdAt-desc') => {
        let endpoint = `/products/by-shop/${shopId}`;
        const queryParams = new URLSearchParams();

        if (status && status !== 'all') {
            queryParams.append('status', status);
        }
        if (searchTerm) {
            queryParams.append('keyword', searchTerm);
        }
        if (sortBy) {
            queryParams.append('sortBy', sortBy);
        }

        if (queryParams.toString()) {
            endpoint += `?${queryParams.toString()}`;
        }

        return await apiCall({
            endpoint,
            method: 'GET',
            expectedStatusCodes: [200],
        });
    },

    getPriceRange: async() => {
        return await apiCall({
            endpoint: "/products/price-range",
            method: "GET",
        });
    },

    getAllProductsByFilter: async({ name, category, minPrice, maxPrice, page = 1, limit = 15 }) => {
        const queryParams = [];

        if (Array.isArray(category) && category.length > 0) {
            const validCategoryIds = category.filter(id => /^[a-f\d]{24}$/i.test(id));
            if (validCategoryIds.length > 0) {
                queryParams.push(`category=${validCategoryIds.join(",")}`);
            }
        }

        if (typeof name !== "undefined" && name !== null && name !== "") queryParams.push(`name=${encodeURIComponent(name)}`);
        if (typeof minPrice !== "undefined") queryParams.push(`minPrice=${minPrice}`);
        if (typeof maxPrice !== "undefined") queryParams.push(`maxPrice=${maxPrice}`);

        if (page) queryParams.push(`page=${page}`);
        if (limit) queryParams.push(`limit=${limit}`);

        const endpoint = `/products/filter?${queryParams.join("&")}`;
        return await apiCall({ endpoint });
    },

    // Lấy sản phẩm liên quan theo danh mục (trừ chính nó)
    getRelatedProducts: async (productId, limit = 10) => {
        return await apiCall({
            endpoint: `/products/${productId}/related?limit=${limit}`,
            method: "GET",
        });
    },

    getApprovedProductCountByShopId: async (shopId) => {
    return await apiCall({
        endpoint: `/products/by-shop/${shopId}/approved/count`,
        method: "GET",
    });
},
};