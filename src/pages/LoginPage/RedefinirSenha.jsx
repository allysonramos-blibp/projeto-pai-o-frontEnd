import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/auth";
import { Check, Loader2 } from 'lucide-react';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); 

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErro("❌ As senhas não coincidem!");
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      await apiRequest("/api/usuarios/redefinir-senha", "POST", { token, novaSenha });
      alert("🎉 Senha alterada com sucesso! Faça login com a nova credencial.");
      navigate("/login");
    } catch (err) {
      setErro(err.message || "Erro ao redefinir senha. O link pode ter expirado.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-principal)] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-[var(--bg-card)] p-10 rounded-[32px] shadow-xl w-full max-w-sm text-center border border-[var(--borda)] transition-colors duration-200">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-2xl mb-4 text-orange-600">
          <Check size={24} />
        </div>
        <h2 className="text-2xl font-black text-[var(--texto-titulo)] mb-2 uppercase tracking-tighter">Nova Senha</h2>
        <p className="text-xs text-[var(--texto-corpo)] mb-6 font-medium">Digite e confirme sua nova senha de acesso abaixo.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Nova Senha</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              required 
              value={novaSenha} 
              onChange={(e) => setNovaSenha(e.target.value)} 
              className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none text-[var(--texto-titulo)] font-medium focus:ring-2 focus:ring-orange-500 transition-colors" 
            />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">Confirmar Senha</label>
            <input 
              type="password" 
              placeholder="Repita a nova senha" 
              required 
              value={confirmarSenha} 
              onChange={(e) => setConfirmarSenha(e.target.value)} 
              className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none text-[var(--texto-titulo)] font-medium focus:ring-2 focus:ring-orange-500 transition-colors" 
            />
          </div>

          {erro && <p className="text-xs text-red-500 font-bold text-left px-1">{erro}</p>}

          <button 
            type="submit" 
            disabled={carregando} 
            className="w-full p-4 bg-orange-600 text-white font-black rounded-2xl uppercase tracking-wider hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {carregando ? <><Loader2 className="animate-spin" size={18}/> Alterando...</> : "Atualizar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}