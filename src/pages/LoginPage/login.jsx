import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext.jsx";
import { apiRequest } from "../../services/auth";
import { X } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({ nome: "", username: "", email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ username: "", email: "" }); 

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
      if (result && result.success) {
        setTimeout(() => navigate(from, { replace: true }), 150);
      } else {
        setLocalError(result.error || "Usuário ou senha inválidos");
      }
    } catch (err) {
      setLocalError("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.nome.trim() || !registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      alert("Preencha todos os campos para se cadastrar.");
      return;
    }
    setModalLoading(true);
    try {
      await apiRequest("/auth/register", "POST", {
        nome: registerForm.nome.trim(),
        login: registerForm.username.trim(), 
        email: registerForm.email.trim(),
        senha: registerForm.password,
        perfil: "USER"
      });
      alert("Usuário criado com sucesso! Agora você já pode fazer login.");
      setShowRegisterModal(false);
      setRegisterForm({ nome: "", username: "", email: "", password: "" });
    } catch (err) {
      alert("Erro ao criar usuário: " + (err.message || "Tente outro nome de usuário"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotForm.username.trim() || !forgotForm.email.trim()) {
      alert("Por favor, preencha o usuário e o e-mail.");
      return;
    }
    setModalLoading(true);
    try {
      await apiRequest("/api/usuarios/esqueci-senha", "POST", {
        login: forgotForm.username.trim(),
        email: forgotForm.email.trim()
      });
      alert("📬 Se as informações estiverem corretas, o link de recuperação foi enviado para o e-mail informado!");
      setShowForgotModal(false);
      setForgotForm({ username: "", email: "" });
    } catch (err) {
      alert("Erro ao processar solicitação: " + (err.message || "Dados inválidos"));
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-principal)]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E67E22] border-t-transparent mb-4" />
        <p className="text-[var(--texto-titulo)] font-semibold text-sm tracking-wide">Acessando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-principal)] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E67E22] rounded-[20px] shadow-lg shadow-orange-200 mb-4">
            <span className="text-white font-black text-2xl">Ó</span>
          </div>
          <p className="text-xs font-black text-[var(--texto-corpo)] uppercase tracking-widest mb-1">Bar</p>
          <h1 className="text-3xl font-black text-[var(--texto-titulo)] tracking-tighter">Ó PAI, Ó</h1>
        </div>

        <div className="bg-[var(--bg-card)] rounded-[32px] shadow-sm border border-[var(--borda)] p-8">
          <h2 className="text-xl font-black text-[var(--texto-titulo)] mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Usuário ou E-mail</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário ou e-mail"
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
                className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[var(--texto-titulo)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isSubmitting}
                autoComplete="current-password"
                className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[var(--texto-titulo)]"
              />
            </div>

            <div className="flex justify-between items-center px-1 text-xs">
              <button type="button" onClick={() => setShowForgotModal(true)} className="text-[#E67E22] font-bold hover:underline">Esqueceu a senha?</button>
              <button type="button" onClick={() => setShowRegisterModal(true)} className="text-[var(--texto-titulo)] font-black uppercase tracking-tight hover:text-[#E67E22]">Criar conta</button>
            </div>

            {localError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-500 font-medium flex items-center gap-2">
                <span>⚠️</span> {localError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white font-black py-4 rounded-2xl transition-all shadow-lg mt-2 disabled:opacity-60">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] p-8 rounded-[32px] w-full max-w-sm shadow-2xl border border-[var(--borda)] relative animate-fadeIn">
            <button onClick={() => setShowRegisterModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-[var(--texto-titulo)] transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[var(--texto-titulo)] mb-6 uppercase tracking-tighter">Nova Conta</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Nome Completo</label>
                <input type="text" value={registerForm.nome} onChange={(e) => setRegisterForm({...registerForm, nome: e.target.value})} placeholder="Seu nome" className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Nome de Usuário (Login)</label>
                <input type="text" value={registerForm.username} onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})} placeholder="Ex: allyson.admin" className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">E-mail de Recuperação</label>
                <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} placeholder="Ex: nome@email.com" className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Senha</label>
                <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} placeholder="Crie uma senha forte" className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" />
              </div>
              <button type="submit" disabled={modalLoading} className="w-full p-4 bg-[#E67E22] hover:bg-[#d35400] text-white font-black rounded-2xl uppercase text-xs shadow-lg transition-all disabled:opacity-60 mt-2">
                {modalLoading ? "Cadastrando..." : "Confirmar Cadastro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] p-8 rounded-[32px] w-full max-w-sm shadow-2xl border border-[var(--borda)] relative animate-fadeIn">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-[var(--texto-titulo)] transition-colors"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[var(--texto-titulo)] mb-2 uppercase tracking-tighter">Recuperar Acesso</h3>
            <p className="text-xs text-[var(--texto-corpo)] mb-6 font-medium">Informe o usuário que deseja alterar e o e-mail de destino.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Nome de Usuário (Login)</label>
                <input 
                  type="text" 
                  required
                  value={forgotForm.username} 
                  onChange={(e) => setForgotForm({...forgotForm, username: e.target.value})} 
                  placeholder="Digite o usuário da conta" 
                  className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">E-mail para Envio</label>
                <input 
                  type="email" 
                  required
                  value={forgotForm.email} 
                  onChange={(e) => setForgotForm({...forgotForm, email: e.target.value})} 
                  placeholder="Digite o e-mail onde deseja receber o link" 
                  className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none font-medium text-[var(--texto-titulo)] focus:ring-2 focus:ring-[#E67E22]" 
                />
              </div>
              <button type="submit" disabled={modalLoading} className="w-full p-4 bg-[#E67E22] hover:bg-[#d35400] text-white font-black rounded-2xl uppercase text-xs shadow-lg transition-all disabled:opacity-60 mt-2">
                {modalLoading ? "Enviando e-mail..." : "Solicitar Nova Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
