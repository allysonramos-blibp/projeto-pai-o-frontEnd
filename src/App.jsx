import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext.jsx';
import Login from './pages/LoginPage/login.jsx';
import Home from './pages/HomePage/home.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const savedUser = localStorage.getItem('user');

  if (loading) return null; // Evita flashes de tela

  // Se existe usuário no estado OU no armazenamento local, permite o acesso
  if (user || savedUser) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;