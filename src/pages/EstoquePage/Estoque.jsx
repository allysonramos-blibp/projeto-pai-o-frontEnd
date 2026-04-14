import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  History, 
  Search, 
  ArrowUpCircle 
} from 'lucide-react';

const Estoque = () => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  
  const [novoItem, setNovoItem] = useState({
    produtoId: '',
    quantidade: '',
    minimo: ''
  });

  const carregarEstoque = async () => {
    try {
      setLoading(true);
      
      const data = await apiRequest('/api/estoque');
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
      
      await apiRequest('/api/estoque', 'POST', {
        produtoId: parseInt(novoItem.produtoId),
        quantidade: parseInt(novoItem.quantidade),
        minimo: parseInt(novoItem.minimo)
      });
      setShowModal(false);
      setNovoItem({ produtoId: '', quantidade: '', minimo: '' });
      carregarEstoque();
    } catch (err) {
      alert("Erro ao cadastrar. Verifique se o ID do produto existe e se você tem permissão.");
    }
  };

  return (
    <div className="p-8 animate-fadeIn">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#151D48]">Gestão de Estoque</h2>
          <p className="text-[#737791]">Monitoramento de insumos e níveis críticos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} />
          Cadastrar Registro
        </button>
      </header>

      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[#737791] font-semibold">Produto</th>
              <th className="p-6 text-[#737791] font-semibold">Qtd. Atual</th>
              <th className="p-6 text-[#737791] font-semibold">Mínimo</th>
              <th className="p-6 text-[#737791] font-semibold">Status</th>
              <th className="p-6 text-[#737791] font-semibold">Última Mov.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Buscando dados no servidor...</td></tr>
            ) : itens.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-6 font-bold text-[#151D48]">{item.nomeProduto}</td>
                <td className="p-6 font-medium text-lg">{item.quantidade}</td>
                <td className="p-6 text-[#737791] font-medium">{item.minimo}</td>
                <td className="p-6">
                  {item.status === 'BAIXO' || item.status === 'CRITICO' ? (
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <AlertTriangle size={12} /> {item.status}
                    </span>
                  ) : item.status === 'ESGOTADO' ? (
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
                  {new Date(item.dataUltimaMovimentacao).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[30px] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-[#151D48] mb-6">Novo Registro de Estoque</h3>
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-2 uppercase">ID do Produto</label>
                <input 
                  type="number" required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                  value={novoItem.produtoId}
                  onChange={(e) => setNovoItem({...novoItem, produtoId: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-2 uppercase">Qtd. Inicial</label>
                  <input 
                    type="number" required
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem({...novoItem, quantidade: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-2 uppercase">Qtd. Mínima</label>
                  <input 
                    type="number" required
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                    value={novoItem.minimo}
                    onChange={(e) => setNovoItem({...novoItem, minimo: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 text-gray-400 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 p-4 bg-[#E67E22] text-white font-bold rounded-2xl">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;