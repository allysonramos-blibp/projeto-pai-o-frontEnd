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
      } catch (err) {
        alert("Erro ao excluir item.");
      }
    }
  };

  const itensFiltrados = useMemo(() =>
    itens.filter(i => i.nomeProduto?.toLowerCase().includes(searchTerm.toLowerCase())),
    [itens, searchTerm]
  );

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-[#151D48] tracking-tighter uppercase italic">Estoque Ó Pai, Ó</h2>
          <p className="text-gray-400 font-medium">Controle de produtos e quantidades</p>
        </div>
        <button
          onClick={() => { setItemParaEditar(null); setShowModal(true); }}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all shadow-lg"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pl-12 bg-white rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#E67E22] outline-none text-[#151D48] font-medium"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10 font-bold animate-pulse">Carregando...</p>
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