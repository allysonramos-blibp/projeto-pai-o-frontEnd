import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/auth";

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
      await apiRequest("api/usuarios/redefinir-senha", "POST", { token, novaSenha });
      alert("🎉 Senha alterada com sucesso! Faça login com a nova credencial.");
      navigate("/login");
    } catch (err) {
      setErro(err.message || "Erro ao redefinir senha. O link pode ter expirado.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[32px] shadow-xl w-full max-w-sm text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-2xl mb-4 text-[#E67E22] text-xl font-bold">✓</div>
        <h2 className="text-2xl font-black text-[#151D48] mb-2 uppercase tracking-tighter">Nova Senha</h2>
        <p className="text-xs text-gray-400 mb-6 font-medium">Digite e confirme sua nova senha de acesso abaixo.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Nova Senha</label>
            <input type="password" placeholder="Mínimo 6 caracteres" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none text-[#151D48] font-medium" />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Confirmar Senha</label>
            <input type="password" placeholder="Repita a nova senha" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none text-[#151D48] font-medium" />
          </div>

          {erro && <p className="text-xs text-red-500 font-bold text-left px-1">{erro}</p>}

          <button type="submit" disabled={carregando} className="w-full p-4 bg-[#E67E22] text-white font-black rounded-2xl uppercase tracking-wider hover:bg-[#d35400] transition-all shadow-lg disabled:opacity-50 mt-2">
            {carregando ? "Alterando..." : "Atualizar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}