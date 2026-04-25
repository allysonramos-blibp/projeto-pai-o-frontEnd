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

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const savedUser = localStorage.getItem('user');
  if (loading) return null; 
  if (user || savedUser) return children;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          <Route path="/login" element={<Login />} />
          
          
          <Route 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
            <Route path="/comandas" element={<Comandas />} />
            <Route path="vendas" element={<Vendas />} />
            <Route path="fornecedores" element={<Fornecedores />} />
          </Route>

          
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;