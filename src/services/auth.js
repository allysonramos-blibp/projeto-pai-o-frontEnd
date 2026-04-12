const API_URL = 'https://o-pai-o-api.onrender.com';

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        login: username,  
        senha: password 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erro ao fazer login');
    }
    return {
      token: data.token || data.accessToken,
      user: data.user || data.usuario
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};


export const getUserInfo = async (token) => {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token inválido ou expirado');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

/**
 * Faz requisições autenticadas para sua API
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Não autenticado');
  }

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
};