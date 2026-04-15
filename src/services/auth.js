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


 
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('Token não encontrado no localStorage');
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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Se for 403 (Forbidden), não tentamos ler o JSON, apenas avisamos
    if (response.status === 403) {
      console.warn(`Acesso negado (403) para o endpoint: ${endpoint}. Verifique as Roles do usuário.`);
      return null; // Retorna null para o dashboard não travar
    }

    // Só tentamos transformar em JSON se a resposta não estiver vazia (status 204 No Content)
    const data = response.status !== 204 ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error);
    return null; // Retorna null para evitar que o Promise.all da Home quebre a tela toda
  }
};