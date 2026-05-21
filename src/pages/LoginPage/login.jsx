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

  const [registerForm, setRegisterForm] = useState({ nome: "", username: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState(""); 

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
    if (!registerForm.nome.trim() || !registerForm.username.trim() || !registerForm.password.trim()) {
      alert("Preencha todos os campos para se cadastrar.");
      return;
    }
    setModalLoading(true);
    try {
      await apiRequest("/auth/register", "POST", {
        nome: registerForm.nome.trim(),
        login: registerForm.username.trim(), 
        senha: registerForm.password,
        perfil: "USER"
      });
      alert("Usuário criado com sucesso! Agora você já pode fazer login.");
      setShowRegisterModal(false);
      setRegisterForm({ nome: "", username: "", password: "" });
    } catch (err) {
      alert("Erro ao criar usuário: " + (err.message || "Tente outro e-mail de usuário"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      alert("Por favor, digite seu e-mail.");
      return;
    }
    setModalLoading(true);
    try {
      await apiRequest("/api/usuarios/esqueci-senha", "POST", {
        login: forgotEmail.trim()
      });
      alert("📬 Se este e-mail estiver cadastrado no sistema, um link seguro de recuperação foi enviado!");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      alert("Erro ao processar solicitação: " + (err.message || "E-mail não encontrado"));
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1a2e]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E67E22] border-t-transparent mb-4" />
        <p className="text-white font-semibold text-sm tracking-wide">Acessando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E67E22] rounded-[20px] shadow-lg shadow-orange-200 mb-4">
            <span className="text-white font-black text-2xl">Ó</span>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Bar</p>
          <h1 className="text-3xl font-black text-[#151D48] tracking-tighter">Ó PAI, Ó</h1>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black text-[#151D48] mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">E-mail de Usuário</label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu e-mail"
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
                className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[#151D48]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isSubmitting}
                autoComplete="current-password"
                className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[#151D48]"
              />
            </div>

            <div className="flex justify-between items-center px-1 text-xs">
              <button type="button" onClick={() => setShowForgotModal(true)} className="text-[#E67E22] font-bold hover:underline">Esqueceu a senha?</button>
              <button type="button" onClick={() => setShowRegisterModal(true)} className="text-[#151D48] font-black uppercase tracking-tight hover:text-[#E67E22]">Criar conta</button>
            </div>

            {localError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600 font-medium flex items-center gap-2">
                <span>⚠️</span> {localError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 disabled:opacity-60 mt-2">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#D1D5DB] p-8 rounded-[40px] w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowRegisterModal(false)} className="absolute right-6 top-6 text-gray-500"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[#151D48] mb-6 uppercase tracking-tighter">Nova Conta</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Nome Completo</label>
                <input type="text" value={registerForm.nome} onChange={(e) => setRegisterForm({...registerForm, nome: e.target.value})} placeholder="Seu nome" className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none font-medium text-[#151D48]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">E-mail de Acesso</label>
                <input type="email" value={registerForm.username} onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})} placeholder="Ex: nome@email.com" className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none font-medium text-[#151D48]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Senha</label>
                <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} placeholder="Crie uma senha forte" className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none font-medium text-[#151D48]" />
              </div>
              <button type="submit" disabled={modalLoading} className="w-full p-4 bg-[#7B3F00] hover:bg-[#5c2f00] text-white font-black rounded-2xl uppercase text-xs shadow-lg mt-2">{modalLoading ? "Cadastrando..." : "Confirmar Cadastro"}</button>
            </form>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#D1D5DB] p-8 rounded-[40px] w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-6 top-6 text-gray-500"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[#151D48] mb-2 uppercase tracking-tighter">Recuperar Acesso</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Insira o e-mail da sua conta para receber o link de redefinição real.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Seu E-mail</label>
                <input 
                  type="email" 
                  required
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  placeholder="Digite seu e-mail cadastrado" 
                  className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none font-medium text-[#151D48]" 
                />
              </div>
              <button type="submit" disabled={modalLoading} className="w-full p-4 bg-[#E67E22] hover:bg-[#d35400] text-white font-black rounded-2xl uppercase text-xs shadow-lg mt-2">
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