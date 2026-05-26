import { useEffect, useState } from "react";
import { apiRequest } from "../../services/auth";
import { useAuth } from "../../contexts/authContext";
import { Trash2, UserPlus, RefreshCw, Search, Pencil, X } from "lucide-react";

const PERFIL_CFG = {
  ADMIN:   { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", label: "ADMIN" },
  GERENTE: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",        label: "GERENTE" },
  USUARIO: { cls: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",           label: "USUÁRIO" },
};

const PerfilBadge = ({ perfil }) => {
  const cfg = PERFIL_CFG[perfil] || PERFIL_CFG.USUARIO;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const Modal = ({ titulo, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-[#1E293B] rounded-[32px] w-full max-w-sm shadow-2xl p-8 relative border border-gray-200 dark:border-slate-700/50">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        type="button"
      >
        <X size={20} />
      </button>
      <h3 className="text-xl font-black text-[#151D48] dark:text-white mb-6 uppercase tracking-tighter">{titulo}</h3>
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", required = false, ...props }) => (
  <div className="text-left">
    <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 mb-1 block uppercase ml-1">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      className="w-full p-4 bg-gray-100 dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-transparent focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[#151D48] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all"
      required={required}
      {...props}
    />
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
    <div className="p-8 bg-gray-100 dark:bg-[#0F172A] min-h-screen transition-colors duration-200">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-[#151D48] dark:text-white tracking-tighter">Usuários</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Gerencie os acessos ao sistema</p>
        </div>
        <button
          onClick={() => {
            setUsuarioEditando(null);
            setFormUsuario({ nome: "", login: "", senha: "", perfil: "USUARIO" });
            setShowModal(true);
          }}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 bg-white dark:bg-[#1E293B] rounded-full shadow-sm border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-[#E67E22] outline-none text-[#151D48] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all"
          />
        </div>
        <button
          onClick={carregar}
          className="p-4 bg-white dark:bg-[#1E293B] rounded-full shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={20} className="text-gray-400 dark:text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 dark:text-slate-500 py-10 font-bold">Carregando...</p>
        ) : usuariosFiltrados.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-6 rounded-[32px] shadow-sm border border-gray-200 dark:border-slate-800 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#0F172A] flex items-center justify-center font-black text-[#151D48] dark:text-white text-lg">
                {u.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[#151D48] dark:text-white text-lg">{u.nome}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-wider">@{u.login}</p>
              </div>
            </div>
            <PerfilBadge perfil={u.perfil} />
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setUsuarioEditando(u);
                  setFormUsuario({ ...u, senha: "" });
                  setShowModal(true);
                }}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Pencil size={16} />
              </button>
              {u.id !== meUser?.id && (
                <button
                  onClick={() => setConfirmacao({ tipo: "excluir", usuario: u })}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal titulo={usuarioEditando ? "Editar Usuário" : "Novo Usuário"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSalvar} className="space-y-4">
            <InputField
              label="Nome"
              value={formUsuario.nome}
              onChange={(e) => setFormUsuario(p => ({ ...p, nome: e.target.value }))}
              required
            />
            <InputField
              label="Login"
              value={formUsuario.login}
              onChange={(e) => setFormUsuario(p => ({ ...p, login: e.target.value }))}
              required
            />
            {!usuarioEditando && (
              <InputField
                label="Senha"
                type="password"
                value={formUsuario.senha}
                onChange={(e) => setFormUsuario(p => ({ ...p, senha: e.target.value }))}
                required
              />
            )}
            <div>
              <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 mb-1 block uppercase ml-1">Perfil</label>
              <select
                className="w-full p-4 bg-gray-100 dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-transparent text-[#151D48] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#E67E22]"
                value={formUsuario.perfil}
                onChange={(e) => setFormUsuario(p => ({ ...p, perfil: e.target.value }))}
              >
                <option value="USUARIO">Usuário</option>
                <option value="GERENTE">Gerente</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {erro && <p className="text-xs text-red-500 font-bold">❌ {erro}</p>}
            <button
              type="submit"
              disabled={salvando}
              className="w-full p-4 bg-[#E67E22] hover:bg-[#d35400] text-white font-black rounded-2xl uppercase text-xs transition-colors disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Confirmar"}
            </button>
          </form>
        </Modal>
      )}

      {confirmacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] w-full max-w-sm shadow-2xl p-8 border border-gray-200 dark:border-slate-700/50">
            <h3 className="text-xl font-black text-[#151D48] dark:text-white mb-2 uppercase tracking-tighter">Excluir Usuário</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
              Tem certeza que deseja excluir <span className="font-bold text-[#151D48] dark:text-white">{confirmacao.usuario.nome}</span>? Esta ação não pode ser desfeita.
            </p>
            {erro && <p className="text-xs text-red-500 font-bold mb-4">❌ {erro}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmacao(null)}
                className="flex-1 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-bold text-xs uppercase hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={salvando}
                className="flex-1 p-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl uppercase text-xs transition-colors disabled:opacity-60"
              >
                {salvando ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;