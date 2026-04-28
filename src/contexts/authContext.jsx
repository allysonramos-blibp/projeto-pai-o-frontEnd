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
        const storageUser = localStorage.getItem('user');

        
        if (!token || storageUser === "undefined" || !storageUser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          
          setUser(JSON.parse(storageUser));
        }
      } catch (err) {
        console.error("Erro ao carregar sessão guardada:", err);
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
      
      const data = await loginUser(username, password);
      
      
      const userData = {
        id: data.id,
        nome: data.nome,
        perfil: data.perfil
      };

      const token = data.token;

      
      if (token && userData.id) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      } else {
        throw new Error("Resposta do servidor inválida.");
      }

    } catch (err) {
      console.error("Erro no processo de login:", err);
      const message = err.response?.data?.message || err.message || 'Erro ao entrar';
      return { success: false, error: message };
    }
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};