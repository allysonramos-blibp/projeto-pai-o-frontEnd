import React, { useState } from 'react';
import { useAuth } from "../../contexts/authContext.jsx";
import { apiRequest } from "../../services/auth";
import { User, Shield, Key, X, Loader2 } from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
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
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <div className="bg-[var(--bg-card)] p-8 rounded-[32px] shadow-sm border border-[var(--borda)] transition-colors duration-200">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-[var(--bg-principal)] rounded-3xl flex items-center justify-center text-orange-600 border border-[var(--borda)]">
            <User size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[var(--texto-titulo)]">{user?.nome}</h2>
            <p className="text-[var(--texto-corpo)] font-bold uppercase tracking-widest text-sm">{user?.perfil}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)]">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Shield size={18} /> <span className="font-bold text-xs uppercase">Nível de Acesso</span>
            </div>
            <p className="text-[var(--texto-titulo)] font-bold">
              {user?.perfil === 'ADMIN' ? 'Acesso Total ao Sistema' : 'Acesso Operacional'}
            </p>
          </div>
          <div className="p-6 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)]">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Key size={18} /> <span className="font-bold text-xs uppercase">Segurança</span>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="text-orange-600 font-bold hover:underline"
            >
              Alterar Senha de Acesso
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] p-8 rounded-[40px] w-full max-w-sm border border-[var(--borda)] relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-[var(--texto-corpo)]"><X size={20} /></button>
            <h3 className="text-2xl font-black text-[var(--texto-titulo)] mb-6 uppercase tracking-tighter">Alterar Senha</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {['senhaAtual', 'novaSenha', 'confirmarSenha'].map((field) => (
                <div key={field}>
                  <label className="text-[10px] font-black text-[var(--texto-corpo)] uppercase ml-1 mb-1 block">
                    {field === 'senhaAtual' ? 'Senha Atual' : field === 'novaSenha' ? 'Nova Senha' : 'Confirmar Nova Senha'}
                  </label>
                  <input 
                    type="password" 
                    required
                    value={form[field]}
                    onChange={(e) => setForm({...form, [field]: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-4 bg-[var(--bg-principal)] rounded-2xl border border-[var(--borda)] outline-none focus:ring-2 focus:ring-orange-500 font-medium text-[var(--texto-titulo)]"
                  />
                </div>
              ))}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full p-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl uppercase text-xs shadow-lg mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={16}/> Salvando...</> : "Salvar Nova Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;