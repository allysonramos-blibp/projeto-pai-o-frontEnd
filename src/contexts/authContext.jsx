import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storageUser = localStorage.getItem('usuario');

        if (!token || !storageUser || storageUser === "undefined") {
          localStorage.clear();
          setUser(null);
        } else {
          setUser(JSON.parse(storageUser));
        }
      } catch (err) {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // 💡 GARANTIA: Mapeamos 'username' para 'login' e 'password' para 'senha'
      // para bater exatamente com o seu AutenticacaoDTO do Spring Boot
      const data = await loginUser({ 
        login: username.trim(), 
        senha: password 
      });
      
      const userData = data.usuario || data; 

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      throw new Error("Token não recebido do servidor");
    } catch (err) {
      // Retorna a mensagem amigável vinda do servidor ou o erro padrão
      return { success: false, error: err.message || "Usuário ou senha inválidos" };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};