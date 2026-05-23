import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [tema, setTema] = useState(localStorage.getItem('app-theme') || 'orange');

  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  useEffect(() => { 
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storageUser = localStorage.getItem('usuario');

        if (!token || !storageUser || storageUser === "undefined") {
          // Apenas remove os dados de auth, preservando o tema
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUser(null);
        } else {
          setUser(JSON.parse(storageUser));
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
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
      return { success: false, error: err.message || "Usuário ou senha inválidos" };
    }
  };

  const logout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, tema, setTema }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};