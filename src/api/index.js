import axios from 'axios';

//const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://steez-shop-backend.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------- PRODUCTS ---------
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => api.get(`/products?category=${categoryId}`);
export const getProductsByBrand = (brandId) => api.get(`/products?brand=${brandId}`);

export const createProduct = (productData) => {
  const formData = new FormData();
  
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price.toString());
  formData.append('stock', productData.stock.toString());
  
  if (productData.category_id) {
    formData.append('category_id', productData.category_id.toString());
  }
  
  if (productData.brand_id) {
    formData.append('brand_id', productData.brand_id.toString());
  }
  
  if (productData.sizes && productData.sizes.length > 0) {
    formData.append('sizes', JSON.stringify(productData.sizes));
  }
  
  if (productData.image) {
    formData.append('image', productData.image);
  }

  return api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = (id, productData) => {
  const formData = new FormData();
  
  // Append all fields with proper type conversion
  formData.append('name', productData.name);
  formData.append('description', productData.description || '');
  formData.append('price', productData.price.toString());
  formData.append('stock', productData.stock.toString());
  
  if (productData.category_id) {
    formData.append('category_id', productData.category_id.toString());
  }
  
  if (productData.brand_id) {
    formData.append('brand_id', productData.brand_id.toString());
  }
  
  // Append sizes if they exist
  if (productData.sizes) {
    formData.append('sizes', JSON.stringify(productData.sizes));
  }
  
  // Append new image file if exists
  if (productData.image && productData.image instanceof File) {
    formData.append('image', productData.image);
  }

  return api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProduct = (productId) => api.delete(`/products/${productId}`);

// --------- CATEGORIES ---------
export const getCategories = () => api.get('/categories');

// --------- BRANDS ---------
export const getBrands = () => api.get('/brands');

// --------- USERS ---------
export const register = (userData) => api.post('/users/register', userData, {
  headers: {
    'Content-Type': 'application/json'
  }
});
export const login = (credentials) => api.post('/users/login', credentials);
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);

// --------- ORDERS ---------
export const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return await axios.post(`${API_URL}/orders`, orderData, { headers });
};

export const getMyOrders = () => api.get('/orders/my-orders');
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);