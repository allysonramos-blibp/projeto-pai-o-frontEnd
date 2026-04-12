import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Bem-vindo, {user?.name || user?.username}!</span>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="welcome-card">
          <h2>🎉 Login realizado com sucesso!</h2>
          <p>Você está autenticado com JWT.</p>
          
          <div className="token-info">
            <h3>Informações do Token:</h3>
            <pre>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;