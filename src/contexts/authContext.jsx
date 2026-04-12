import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getUserInfo } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await getUserInfo(token);
          setUser(userData);
        } catch (err) {
          console.error('Token inválido:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const { token, user: userData } = await loginUser(username, password);

      localStorage.setItem('token', token);
      
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message || 'Falha na autenticação' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};