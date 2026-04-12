import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!username.trim() || !password.trim()) {
      setLocalError("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setLocalError(result.error || "Usuário ou senha inválidos");
      }
    } catch (err) {
      setLocalError("Erro ao conectar com o servidor");
      console.error("Erro no login:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-black/30">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-4" />
        <p className="text-white font-semibold text-sm tracking-wide">
          Acessando...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-1.5">BAR</p>
          <h1 className="text-4xl font-extrabold text-gray-900">Ó PAI, Ó</h1>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-5">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-sm font-semibold text-gray-900 mb-1.5"
                htmlFor="username"
              >
                Usuário
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-semibold text-gray-900 mb-1.5"
                htmlFor="password"
              >
                Senha
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            {localError && (
              <div className="error-message mt-4 text-red-600 flex items-center">
                <span>⚠️</span> {localError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800
               text-white font-semibold text-sm py-3 rounded-md transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
