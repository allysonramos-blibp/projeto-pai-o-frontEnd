import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { Search, Plus, User, Hash, ShoppingBag, X, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const Comandas = () => {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMesa, setFiltroMesa] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState(null);

  const carregarComandas = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/comandas');
      setComandas(data || []);
    } catch (err) {
      console.error("Erro ao buscar comandas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComandas();
  }, []);

  const comandasFiltradas = comandas
    .filter(c => c.numeroMesa.toString().includes(filtroMesa))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="p-8 animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Comandas</h2>
        <p className="text-[#737791]">Gerencie as comandas do seu bar</p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4079ED]" size={20} />
        <input 
          type="text" 
          placeholder="Buscar Mesa"
          value={filtroMesa}
          onChange={(e) => setFiltroMesa(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-full border-none focus:ring-2 focus:ring-orange-500 outline-none text-[#737791]"
        />
      </div>

      <h3 className="text-xl font-bold text-[#151D48] mb-6">
        Comandas Ativas ({comandasFiltradas.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : (
          comandasFiltradas.map((comanda) => (
            <div 
              key={comanda.id} 
              onClick={() => setSelectedComanda(comanda)}
              className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-lg font-bold text-[#151D48]">Comanda #{comanda.id.toString().padStart(3, '0')}</h4>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  comanda.status === 'ABERTA' ? 'bg-blue-50 text-blue-500' : 
                  comanda.status === 'FINALIZADA' ? 'bg-teal-50 text-teal-500' : 'bg-red-50 text-red-500'
                }`}>
                  {comanda.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-[#151D48]">
                  <User size={18} className="text-gray-400" />
                  <span className="font-semibold text-sm">Cliente:</span>
                  <span className="text-gray-600 text-sm truncate">{comanda.nomeCliente || `Mesa ${comanda.numeroMesa}`}</span>
                </div>
                <div className="flex items-center gap-2 text-[#151D48]">
                  <Hash size={18} className="text-gray-400" />
                  <span className="font-semibold text-sm">Mesa:</span>
                  <span className="text-gray-600 text-sm">{comanda.numeroMesa}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-center">
                <p className="text-lg font-bold text-[#151D48]">
                  Total: <span className="underline decoration-2 decoration-orange-400 underline-offset-4">
                    R$ {comanda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 bg-[#E67E22] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {showAddModal && <NovaComandaModal onClose={() => setShowAddModal(false)} onSuccess={carregarComandas} />}
      {selectedComanda && <DetalheComandaModal comanda={selectedComanda} onClose={() => setSelectedComanda(null)} refresh={carregarComandas} />}
    </div>
  );
};

const NovaComandaModal = ({ onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [mesa, setMesa] = useState('');

  const handleSalvar = async () => {
    if (!mesa) return alert("Número da mesa é obrigatório");
    try {
      await apiRequest('/api/comandas', 'POST', { 
        nomeCliente: nome, 
        numeroMesa: parseInt(mesa), 
        status: 'ABERTA' 
      });
      onSuccess();
      onClose();
    } catch (err) { alert("Erro ao abrir comanda"); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#151D48] mb-6">Abrir Nova Comanda</h2>
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome do Cliente (Opcional)</label>
            <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-500" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Número da Mesa</label>
            <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-500" value={mesa} onChange={e => setMesa(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold">CANCELAR</button>
          <button onClick={handleSalvar} className="flex-1 py-4 bg-[#151D48] text-white rounded-2xl font-bold">CONFIRMAR</button>
        </div>
      </div>
    </div>
  );
};

const DetalheComandaModal = ({ comanda, onClose, refresh }) => {
  const [produtos, setProdutos] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    apiRequest('/api/produtos').then(setProdutos).catch(console.error);
  }, []);

  const handleAddProduto = async () => {
    if (!itemSelecionado) return;
    try {
      await apiRequest(`/api/comandas/${comanda.id}/itens`, 'POST', {
        produtoId: parseInt(itemSelecionado),
        quantidade: parseInt(quantidade)
      });
      refresh();
      onClose();
    } catch (err) { alert("Erro ao lançar item."); }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await apiRequest(`/api/comandas/${comanda.id}/${status.toLowerCase()}`, 'PATCH');
      refresh();
      onClose();
    } catch (err) { 
        if (err.message?.includes("Unexpected token")) {
            refresh();
            onClose();
        } else {
            alert("Erro ao atualizar status");
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#151D48]">Mesa {comanda.numeroMesa}</h2>
            <p className="text-xs text-[#737791]">Consumo de {comanda.nomeCliente || 'Cliente s/ nome'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="text-gray-400" size={24} /></button>
        </div>

        {comanda.status === 'ABERTA' && (
          <div className="bg-orange-50 p-5 rounded-2xl mb-6 border border-orange-100">
            <p className="text-[10px] font-bold text-orange-400 uppercase mb-3 tracking-widest text-center">Lançar Produto</p>
            <div className="flex gap-2">
              <select className="flex-1 p-3 bg-white rounded-xl text-sm outline-none ring-1 ring-orange-100 focus:ring-2 focus:ring-orange-500" value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)}>
                <option value="">Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>)}
              </select>
              <input type="number" className="w-16 p-3 bg-white rounded-xl text-sm ring-1 ring-orange-100" value={quantidade} onChange={e => setQuantidade(e.target.value)} min="1" />
              <button onClick={handleAddProduto} className="bg-[#E67E22] text-white p-3 rounded-xl hover:bg-[#d35400]"><Plus size={20}/></button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
            <ShoppingBag size={14} /> Itens Lançados
          </p>
          <div className="space-y-3">
            {(!comanda.itens || comanda.itens.length === 0) ? (
              <p className="text-center py-6 text-gray-400 text-sm italic">Nenhum consumo registrado.</p>
            ) : (
              comanda.itens.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#151D48]">{item.produto?.nome || 'Item'}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{item.quantidade}x unidades</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-teal-600">R$ {item.subTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#151D48] p-6 rounded-[24px] text-white flex justify-between items-center mb-6 shadow-lg shadow-blue-100">
          <div>
            <span className="text-[10px] opacity-60 uppercase font-bold block">Total Atual</span>
            <span className="text-2xl font-black text-[#16DBCC]">R$ {comanda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <ShoppingBag className="opacity-20" size={32} />
        </div>

        {comanda.status === 'ABERTA' && (
          <div className="flex gap-3">
            <button onClick={() => handleUpdateStatus('CANCELAR')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
              <XCircle size={18}/> CANCELAR
            </button>
            <button onClick={() => handleUpdateStatus('FINALIZAR')} className="flex-1 py-4 bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all">
              <CheckCircle size={18}/> FINALIZAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comandas;