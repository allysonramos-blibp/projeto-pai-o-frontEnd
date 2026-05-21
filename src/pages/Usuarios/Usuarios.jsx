import { useEffect, useState } from "react";
import { apiRequest } from "../../services/auth";
import { useAuth } from "../../contexts/authContext";
import { Trash2, UserPlus, RefreshCw, Search, Pencil } from "lucide-react";

const PERFIL_CFG = {
  ADMIN:    { cls: "bg-purple-100 text-purple-700", label: "ADMIN" },
  GERENTE:  { cls: "bg-blue-100 text-blue-700",    label: "GERENTE" },
  USUARIO:  { cls: "bg-gray-100 text-gray-600",    label: "USUÁRIO" },
};

const PerfilBadge = ({ perfil }) => {
  const cfg = PERFIL_CFG[perfil] || PERFIL_CFG.USUARIO;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};


const Modal = ({ titulo, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-150">
      <h3 className="text-xl font-black text-[#151D48] mb-6 uppercase tracking-tighter">{titulo}</h3>
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", required = false, ...props }) => (
  <div className="text-left">
    <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">{label} {required && "*"}</label>
    <input type={type} className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[#151D48]" required={required} {...props} />
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
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModalCadastro = () => {
    setUsuarioEditando(null);
    setFormUsuario({ nome: "", login: "", senha: "", perfil: "USUARIO" });
    setErro(null);
    setShowModal(true);
  };

  const abrirModalEdicao = (usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nome: usuario.nome,
      login: usuario.login,
      senha: "", 
      perfil: usuario.perfil
    });
    setErro(null);
    setShowModal(true);
  };

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
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-[#151D48] tracking-tighter">Usuários</h2>
          <p className="text-gray-400 font-medium">Gerencie os acessos ao sistema</p>
        </div>
        <button
          onClick={abrirModalCadastro}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all shadow-lg shadow-orange-100"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 bg-white rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#E67E22] outline-none text-[#151D48] font-medium"
          />
        </div>
        <button onClick={carregar} className="p-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <RefreshCw size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10 font-bold animate-pulse">Carregando...</p>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
            <p className="text-gray-400 font-bold">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          usuariosFiltrados.map((u) => (
            <div key={u.id} className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F3F9] flex items-center justify-center font-black text-[#151D48] text-lg">
                  {u.nome?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#151D48] text-lg leading-tight">{u.nome}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">@{u.login}</p>
                </div>
              </div>

              <PerfilBadge perfil={u.perfil} />

              <div className="flex items-center gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => abrirModalEdicao(u)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                  title="Editar Usuário"
                >
                  <Pencil size={16} />
                </button>

                {u.id !== meUser?.id && (
                  <button
                    onClick={() => setConfirmacao({ tipo: "excluir", usuario: u })}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      
      {showModal && (
        <Modal titulo={usuarioEditando ? "Editar Usuário" : "Novo Usuário"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSalvar} className="space-y-4">
            <InputField label="Nome" value={formUsuario.nome}
              onChange={(e) => setFormUsuario(p => ({ ...p, nome: e.target.value }))} required />
            
            <InputField label="Login" value={formUsuario.login}
              onChange={(e) => setFormUsuario(p => ({ ...p, login: e.target.value }))} required />
            
            {!usuarioEditando && (
              <InputField label="Senha" type="password" value={formUsuario.senha}
                onChange={(e) => setFormUsuario(p => ({ ...p, senha: e.target.value }))} required />
            )}
            
            <div>
              <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">Perfil</label>
              <select
                className="w-full p-4 bg-[#F0F3F9] rounded-2xl border-none focus:ring-2 focus:ring-[#E67E22] outline-none font-medium text-[#151D48]"
                value={formUsuario.perfil}
                onChange={(e) => setFormUsuario(p => ({ ...p, perfil: e.target.value }))}
              >
                <option value="USUARIO">Usuário (Comandas, Estoque, Vendas)</option>
                <option value="GERENTE">Gerente (Acesso parcial a Finanças)</option>
                <option value="ADMIN">Admin (Acesso Total)</option>
              </select>
            </div>
            
            {erro && <p className="text-xs text-red-500 font-bold">❌ {erro}</p>}
            
            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 font-black text-gray-500 uppercase text-[10px]">Cancelar</button>
              <button type="submit" disabled={salvando}
                className="flex-1 p-4 bg-[#E67E22] text-white font-black rounded-2xl uppercase text-xs disabled:opacity-50">
                {salvando ? "Salvar..." : usuarioEditando ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      
      {confirmacao && confirmacao.tipo === "excluir" && (
        <Modal titulo="Excluir Usuário" onClose={() => setConfirmacao(null)}>
          <p className="text-sm text-gray-600 mb-6">
            Tem certeza que deseja excluir o usuário <span className="font-black text-[#151D48]">{confirmacao.usuario.nome}</span>? Esta ação não pode ser desfeita.
          </p>
          {erro && <p className="text-xs text-red-500 font-bold mb-4">❌ {erro}</p>}
          <div className="flex gap-4">
            <button type="button" onClick={() => setConfirmacao(null)}
              className="flex-1 font-black text-gray-500 uppercase text-[10px]">Cancelar</button>
            <button type="button" onClick={handleExcluir} disabled={salvando}
              className="flex-1 p-4 bg-red-500 text-white font-black rounded-2xl uppercase text-xs disabled:opacity-50">
              {salvando ? "Excluindo..." : "Confirmar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Usuarios;