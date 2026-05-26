import { useEffect, useState } from "react";
import { apiRequest } from "../../services/auth";
import { useAuth } from "../../contexts/authContext";
import { Trash2, UserPlus, RefreshCw, Search, Pencil, X } from "lucide-react";

const PERFIL_CFG = {
  ADMIN:   { cls: "bg-purple-100 text-purple-700", label: "ADMIN"   },
  GERENTE: { cls: "bg-blue-100 text-blue-700",     label: "GERENTE" },
  USUARIO: { cls: "bg-gray-100 text-gray-600",     label: "USUÁRIO" },
};

const PerfilBadge = ({ perfil }) => {
  const cfg = PERFIL_CFG[perfil] || PERFIL_CFG.USUARIO;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium text-gray-700 placeholder-gray-400 transition-all";

const Modal = ({ titulo, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-gray-100">
      <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" type="button">
        <X size={18} />
      </button>
      <h3 className="text-base font-bold text-gray-800 mb-5">{titulo}</h3>
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", required = false, ...props }) => (
  <div className="text-left">
    <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">{label} {required && "*"}</label>
    <input type={type} className={inputClass} required={required} {...props} />
  </div>
);

const Usuarios = () => {
  const { user: meUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const [formUsuario, setFormUsuario] = useState({
    nome: "", login: "", senha: "", perfil: "USUARIO",
  });

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("api/usuarios");
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (usuarioEditando) {
        await apiRequest(`api/usuarios/${usuarioEditando.id}`, "PUT", formUsuario);
      } else {
        await apiRequest("api/usuarios", "POST", formUsuario);
      }
      setShowModal(false);
      await carregar();
    } catch (err) {
      setErro(err.message || "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirmacao) return;
    setSalvando(true);
    setErro(null);
    try {
      await apiRequest(`api/usuarios/${confirmacao.usuario.id}`, "DELETE");
      setConfirmacao(null);
      await carregar();
    } catch (err) {
      setErro(err.message || "Erro ao excluir usuário");
    } finally {
      setSalvando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome?.toLowerCase().includes(search.toLowerCase()) ||
    u.login?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Usuários</h2>
          <p className="text-gray-400 text-sm mt-0.5">Gerencie os acessos ao sistema</p>
        </div>
        <button
          onClick={() => { setUsuarioEditando(null); setFormUsuario({ nome: "", login: "", senha: "", perfil: "USUARIO" }); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md shadow-orange-100 text-sm"
        >
          <UserPlus size={18} /> Novo Usuário
        </button>
      </header>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-11 pr-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 transition-all"
          />
        </div>
        <button onClick={carregar} className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-10 font-semibold animate-pulse">Carregando...</p>
        ) : usuariosFiltrados.map((u) => (
          <div key={u.id} className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600 text-base">
                {u.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{u.nome}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">@{u.login}</p>
              </div>
            </div>

            <PerfilBadge perfil={u.perfil} />

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setUsuarioEditando(u); setFormUsuario({ ...u, senha: "" }); setShowModal(true); }}
                className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
              >
                <Pencil size={15} />
              </button>
              {u.id !== meUser?.id && (
                <button
                  onClick={() => setConfirmacao({ tipo: "excluir", usuario: u })}
                  className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal titulo={usuarioEditando ? "Editar Usuário" : "Novo Usuário"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSalvar} className="space-y-3">
            <InputField label="Nome" value={formUsuario.nome} onChange={(e) => setFormUsuario(p => ({ ...p, nome: e.target.value }))} required />
            <InputField label="Login" value={formUsuario.login} onChange={(e) => setFormUsuario(p => ({ ...p, login: e.target.value }))} required />
            {!usuarioEditando && (
              <InputField label="Senha" type="password" value={formUsuario.senha} onChange={(e) => setFormUsuario(p => ({ ...p, senha: e.target.value }))} required />
            )}
            <div>
              <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">Perfil</label>
              <select
                className={inputClass}
                value={formUsuario.perfil}
                onChange={(e) => setFormUsuario(p => ({ ...p, perfil: e.target.value }))}
              >
                <option value="USUARIO">Usuário</option>
                <option value="GERENTE">Gerente</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {erro && <p className="text-xs text-red-500 font-bold">❌ {erro}</p>}
            <button type="submit" disabled={salvando} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors mt-2">
              {salvando ? "Salvando..." : "Confirmar"}
            </button>
          </form>
        </Modal>
      )}

      {confirmacao && (
        <Modal titulo="Confirmar Exclusão" onClose={() => setConfirmacao(null)}>
          <p className="text-sm text-gray-600 mb-5">
            Deseja excluir o usuário <span className="font-bold text-gray-800">{confirmacao.usuario.nome}</span>? Esta ação não pode ser desfeita.
          </p>
          {erro && <p className="text-xs text-red-500 font-bold mb-3">❌ {erro}</p>}
          <div className="flex gap-3">
            <button onClick={() => setConfirmacao(null)} className="flex-1 py-3 text-gray-400 font-semibold hover:bg-gray-50 rounded-xl text-sm transition-colors">
              Cancelar
            </button>
            <button onClick={handleExcluir} disabled={salvando} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
              {salvando ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Usuarios;