// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Erro de conexão com o servidor');
            return Promise.reject(new Error('Servidor não está respondendo. Verifique se o backend está rodando.'));
        }
        return Promise.reject(error);
    }
);

export default api;