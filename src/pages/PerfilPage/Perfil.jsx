import React, { useState } from 'react';
import { useAuth } from "../../contexts/authContext.jsx";
import { apiRequest } from "../../services/auth";
import { User, Shield, Key, X } from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!form.senhaAtual || !form.novaSenha || !form.confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`api/usuarios/${user.id}/alterar-senha`, "PUT", {
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha
      });
      alert("Senha alterada com sucesso!");
      setShowModal(false);
      setForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (err) {
      alert("Erro ao alterar senha: " + (err.message || "Senha atual incorreta."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center text-[#E67E22]">
            <User size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#151D48]">{user?.nome}</h2>
            <p className="text-[#737791] font-bold uppercase tracking-widest">{user?.perfil}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Shield size={18} /> <span className="font-bold text-xs uppercase">Nível de Acesso</span>
            </div>
            <p className="text-[#151D48] font-bold">{user?.perfil === 'ADMIN' ? 'Acesso Total ao Sistema' : 'Acesso Operacional'}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Key size={18} /> <span className="font-bold text-xs uppercase">Segurança</span>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="text-[#E67E22] font-bold hover:underline"
            >
              Alterar Senha de Acesso
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#D1D5DB] p-8 rounded-[40px] w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-gray-500"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[#151D48] mb-6 uppercase tracking-tighter">Alterar Senha</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Senha Atual</label>
                <input 
                  type="password" 
                  value={form.senhaAtual}
                  onChange={(e) => setForm({...form, senhaAtual: e.target.value})}
                  placeholder="Sua senha atual"
                  className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#E67E22] font-medium text-[#151D48]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Nova Senha</label>
                <input 
                  type="password" 
                  value={form.novaSenha}
                  onChange={(e) => setForm({...form, novaSenha: e.target.value})}
                  placeholder="Nova senha forte"
                  className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#E67E22] font-medium text-[#151D48]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={form.confirmarSenha}
                  onChange={(e) => setForm({...form, confirmarSenha: e.target.value})}
                  placeholder="Repita a nova senha"
                  className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#E67E22] font-medium text-[#151D48]"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full p-4 bg-[#E67E22] hover:bg-[#d35400] text-white font-black rounded-2xl uppercase text-xs shadow-lg mt-2"
              >
                {loading ? "Salvando..." : "Salvar Nova Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;