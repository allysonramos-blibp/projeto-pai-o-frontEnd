import { useEffect, useState, useMemo } from "react";
import { apiRequest } from "../../services/auth";
import { Plus, Search } from "lucide-react";
import EstoqueCard, { calcularStatus } from "./EstoqueCard";
import EstoqueModal from "./EstoqueModal";

const extrairArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const Estoque = () => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [opcoes, setOpcoes] = useState({ produtos: [], categorias: [], fornecedores: [] });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resEstoque, resProdutos, resCategorias, resFornecedores] = await Promise.all([
        apiRequest("/api/estoque").catch(() => null),
        apiRequest("/api/produtos").catch(() => null),
        apiRequest("/api/categorias").catch(() => null),
        apiRequest("/api/fornecedor").catch(() => null),
      ]);

      const estoque = extrairArray(resEstoque).map((e) => ({
        id: e.id,
        produtoId: e.produtoId,
        nomeProduto: e.nomeProduto || "Sem nome",
        preco: Number(e.preco ?? 0),
        fornecedor: e.fornecedor || "",
        quantidade: Number(e.quantidade) || 0,
        minimo: Number(e.minimo) || 0,
        status: calcularStatus(e.quantidade, e.minimo),
      }));

      setItens(estoque);
      setOpcoes({
        produtos: extrairArray(resProdutos),
        categorias: extrairArray(resCategorias),
        fornecedores: extrairArray(resFornecedores),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleEditar = (item) => {
    setItemParaEditar(item);
    setShowModal(true);
  };

  const handleExcluir = async (item) => {
    if (window.confirm(`Excluir ${item.nomeProduto} do estoque?`)) {
      try {
        await apiRequest(`/api/estoque/${item.id}`, "DELETE");
        carregarDados();
      } catch {
        alert("Erro ao excluir item.");
      }
    }
  };

  const itensFiltrados = useMemo(() =>
    itens.filter(i => i.nomeProduto?.toLowerCase().includes(searchTerm.toLowerCase())),
    [itens, searchTerm]
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Estoque</h2>
          <p className="text-gray-500 text-sm mt-0.5">Controle de produtos e quantidades em tempo real</p>
        </div>
        <button
          onClick={() => { setItemParaEditar(null); setShowModal(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <Plus size={18} /> Novo Registro
        </button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar produto por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 pl-11 pr-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium transition-all"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">
             <p className="text-gray-500 animate-pulse font-medium">Atualizando dados...</p>
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Nenhum item encontrado no estoque.</p>
          </div>
        ) : (
          itensFiltrados.map((item) => (
            <EstoqueCard
              key={item.id}
              item={item}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
            />
          ))
        )}
      </div>

      {showModal && (
        <EstoqueModal
          opcoes={opcoes}
          itemParaEditar={itemParaEditar}
          onClose={() => { setShowModal(false); setItemParaEditar(null); }}
          onSucesso={carregarDados}
        />
      )}
    </div>
  );
};

export default Estoque;