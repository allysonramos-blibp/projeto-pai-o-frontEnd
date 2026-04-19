import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/auth";
import {
  Package,
  Plus,
  AlertTriangle,
  History,
  Search,
  ArrowUpCircle,
} from "lucide-react";

const Estoque = () => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [produtos, setProdutos] = useState([]);

  const [novoItem, setNovoItem] = useState({
    produtoId: "",
    quantidade: "",
    minimo: "",
  });

  const carregarEstoque = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/api/estoque");
      const prod = await apiRequest("/api/produtos");
      setProdutos(prod || []);
      setItens(data || []);
    } catch (err) {
      console.error("Erro ao carregar estoque:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstoque();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/api/estoque", "POST", {
        produtoId: parseInt(novoItem.produtoId),
        quantidade: parseInt(novoItem.quantidade),
        minimo: parseInt(novoItem.minimo),
      });
      setShowModal(false);
      setNovoItem({ produtoId: "", quantidade: "", minimo: "" });
      carregarEstoque();
    } catch (err) {
      alert(
        "Erro ao cadastrar. Verifique se o ID do produto existe e se você tem permissão." +
          " Erro: " +
          err.message,
      );
    }
  };

  return (
    <div className="p-8 animate-fadeIn">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#151D48]">
            Gestão de Estoque
          </h2>
          <p className="text-[#737791]">Controle seus produtos e inventário</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} />
          Cadastrar Registro
        </button>
      </header>
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar por produto..."
          className="flex-1 p-4 bg-[#F0F3F9] rounded-full border-none focus:ring-2 focus:ring-orange-500 outline-none text-[#737791]"
        />
        <button className="bg-[#4079ED] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#346ac0] transition-all">
          <Search size={20} />
          Buscar
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[#151D48] mb-6">
        Produtos({itens.length})
      </h1>

      <div className="bg-transparent">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Buscando dados no servidor...
                </td>
              </tr>
            ) : (
              itens.map((item) => (
                <tr
                  key={item.id}
                  className="flex items-center justify-between bg-white p-4 rounded-4xl shadow-2xl border border-gray-1 mb-7"
                >
                  <td className="p-2 font-bold text-[#151D48]">
                    <div className="flex items-center gap-4">
                      {item.nomeProduto}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-xs text-gray-400 font-medium">
                        {" "}
                        Estoque: {item.quantidade}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        {" "}
                        Mínimo: {item.minimo}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-medium text-lg">
                    
                  </td>
                  <td className="p-6">
                    {item.status === "BAIXO" || item.status === "CRITICO" ? (
                      <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle size={12} /> {item.status}
                      </span>
                    ) : item.status === "ESGOTADO" ? (
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold w-fit">
                        ESGOTADO
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold w-fit">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-xs text-gray-400">
                    {new Date(item.dataUltimaMovimentacao).toLocaleString(
                      "pt-BR",
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[30px] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-[#151D48] mb-6">
              Novo Registro de Estoque
            </h3>
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-2 uppercase">
                  ID do Produto
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                  value={novoItem.produtoId}
                  onChange={(e) =>
                    setNovoItem({ ...novoItem, produtoId: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-2 uppercase">
                    Qtd. Inicial
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                    value={novoItem.quantidade}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, quantidade: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-2 uppercase">
                    Qtd. Mínima
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                    value={novoItem.minimo}
                    onChange={(e) =>
                      setNovoItem({ ...novoItem, minimo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-4 text-gray-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-[#E67E22] text-white font-bold rounded-2xl"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;
