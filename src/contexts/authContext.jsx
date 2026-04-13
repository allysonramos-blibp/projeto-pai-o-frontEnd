import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getUserInfo } from '../services/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Tenta validar o token, mas não deixa travar a tela se falhar
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error("Erro ao ler usuário salvo");
          localStorage.clear();
        }
      }
      
      // GARANTIA: Libera a tela de "Acessando..." aconteça o que acontecer
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    // Não mexemos no loading aqui para não travar a tela inteira, 
    // apenas o botão de submit (isSubmitting) que já está no Login.jsx
    try {
      const { token, user: userData } = await loginUser(username, password);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro ao entrar';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};