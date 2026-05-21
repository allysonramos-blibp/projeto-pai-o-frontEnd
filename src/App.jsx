import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext.jsx';
import Login from './pages/LoginPage/login.jsx';
import Home from './pages/HomePage/home.jsx';
import Estoque from './pages/EstoquePage/Estoque.jsx'; 
import Layout from './components/Layout.jsx'; 
import ContasPagar from './pages/ContasPagarPage/ContasPagar';
import Comandas from './pages/ComandasPage/Comandas';
import Vendas from './pages/VendasPage/Vendas.jsx';
import Fornecedores from './pages/FornecedoresPage/Fornecedores.jsx';
import ContasReceber from './pages/ContasReceberPage/ContasReceber.jsx';
import Relatorios from './pages/RelatoriosPage/Relatorios.jsx';
import ProtectedRoute from "./components/ProtectedRoute";
import Usuarios from "./pages/Usuarios/Usuarios.jsx";
import Perfil from "./pages/PerfilPage/Perfil.jsx";
import Configuracoes from './pages/Configuracoes/Configuracoes.jsx';
import RedefinirSenha from './pages/LoginPage/RedefinirSenha.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const savedUser = localStorage.getItem('usuario');
  
  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>; 
  if (user || savedUser) return children;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          <Route path="/login" element={<Login />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
            <Route path="/comandas" element={<ProtectedRoute><Comandas /></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/contas-receber" element={<ContasReceber />} />

            <Route path="/relatorios" element={
              <ProtectedRoute perfisPermitidos={["ADMIN", "GERENTE"]}>
                <Relatorios />
              </ProtectedRoute>
            } />

            <Route path="/usuarios" element={
              <ProtectedRoute perfisPermitidos={["ADMIN"]}>
                <Usuarios />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;