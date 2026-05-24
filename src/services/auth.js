import axios from 'axios';

const api = axios.create({
    baseURL: '/'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
    try {
        const config = {
            url: endpoint,
            method: method
        };

    
        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            config.data = data;
        }

        const response = await api(config);
        return response.data;
    } catch (error) {
        
        console.error("Erro na requisição API:", error);

        let message = "Erro ao processar solicitação";
        
        if (error.response && error.response.data) {
            
            message = typeof error.response.data === 'string' 
                ? error.response.data 
                : (error.response.data.mensagem || error.response.data.message || message);
        } else {
            message = error.message;
        }

        throw new Error(message);
    }
};


export const loginUser = async ({ login, senha }) => {
    const response = await api.post('/auth/login', { login, senha });
    const { token, usuario } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
};

export default api;