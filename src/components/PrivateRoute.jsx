import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

const PrivateRoute = ({children}) => {
    const { user, loading } = useAuth();
    if(loading){
        return (
            <div>
                <div className="loading-conteiner"></div>
                <p className="spinner">Carregando...</p>
            </div>
        );
    }
    if(!user){
        return <Navigate to="/login" />;
    }

    return children
};

export default PrivateRoute;