import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor για να προσθέσει token σε όσα endpoints το χρειάζονται
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------- ΠΡΟΪΟΝΤΑ ---------
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => api.get(`/products?category=${categoryId}`);
export const getProductsByBrand = (brandId) => api.get(`/products?brand=${brandId}`);

// --------- ΚΑΤΗΓΟΡΙΕΣ ---------
export const getCategories = () => api.get('/categories');

// --------- ΜΑΡΚΕΣ ---------
export const getBrands = () => api.get('/brands');

// --------- ΧΡΗΣΤΕΣ ---------
export const register = (userData) => api.post('/users/register', userData);
export const login = (credentials) => api.post('/users/login', credentials);
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);

// --------- ΠΑΡΑΓΓΕΛΙΕΣ ---------

// 🆕 Guest-friendly παραγγελία – στέλνει token ΜΟΝΟ αν υπάρχει
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
