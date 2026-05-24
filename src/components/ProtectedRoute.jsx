import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";


const ProtectedRoute = ({ children, perfisPermitidos = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  if (!perfisPermitidos) return children;

 
  if (perfisPermitidos.includes(user.perfil)) return children;

  
  return <Navigate to="/comandas" replace />;
};

export default ProtectedRoute;