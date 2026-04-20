import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/auth';
import { Plus, Trash2, Receipt, CheckCircle, XCircle } from 'lucide-react';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (value) =>
  Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);

  const carregarHistorico = async () => {
  try {
    
    const data = await apiRequest('/api/vendas?size=100'); 
    
    const ordenadas = data ? [...data].sort((a, b) => b.id - a.id) : [];
    setVendas(ordenadas);
  } catch (err) {
    console.error("Erro ao buscar vendas:", err);
  }
};

  useEffect(() => {
    carregarHistorico();
  }, []);

  return (
    <div className="bg-transparent p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#151D48]">Vendas</h2>
        <p className="text-[#737791] text-sm">Registre e gerencie suas vendas</p>
      </header>

      <section>
        <h3 className="text-lg font-bold text-[#151D48] mb-4">Histórico de Vendas</h3>

        <div className="space-y-4">
          {vendas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-[#718EBF] text-sm border border-gray-100">
              Nenhuma venda encontrada.
            </div>
          ) : (
            vendas.map((venda) => {
              const status = venda.status || 'ABERTA';
              let statusClasses = 'bg-orange-50 text-orange-500';
              if (status === 'PAGA') statusClasses = 'bg-teal-50 text-teal-400';
              if (status === 'CANCELADA') statusClasses = 'bg-red-50 text-red-400';

              return (
                <div
                  key={venda.id}
                  onClick={() => setSelectedVenda(venda)}
                  className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-1/4">
                    <p className="font-bold text-[#151D48]">Venda #{venda.id}</p>
                    <p className="text-[#4FBDBA] text-xs font-medium">{venda.formasPagamento?.nome || '-'}</p>
                  </div>

                  <div className="w-1/4 text-[#737791] font-medium">
                    {venda.usuario?.nome || '-'}
                  </div>

                  <div className="w-1/6 text-[#737791] text-center uppercase text-[10px] font-bold">
                    {venda.formasPagamento?.tipo || '-'}
                  </div>

                  <div className="w-1/6 flex justify-center">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClasses}`}>
                      {status}
                    </span>
                  </div>

                  <div className="w-1/6 text-right font-black text-[#151D48] text-lg">
                    {formatPrice(venda.valor_total)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-[#E67E22] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-orange-100 hover:bg-[#d35400] transition-colors"
        >
          <Plus size={28} />
        </button>
      </div>

      {showFormModal && (
        <NovaVendaModal
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            carregarHistorico();
          }}
        />
      )}

      {selectedVenda && (
        <VendaDetailModal 
          venda={selectedVenda} 
          onClose={() => setSelectedVenda(null)} 
          refresh={carregarHistorico}
        />
      )}
    </div>
  );
};

const VendaDetailModal = ({ venda, onClose, refresh }) => {
  const status = venda.status || 'ABERTA';
  let statusClasses = 'bg-orange-100 text-orange-600';
  if (status === 'CANCELADA') statusClasses = 'bg-red-100 text-red-600';
  if (status === 'PAGA') statusClasses = 'bg-teal-50 text-teal-500';

  const itens = venda.itens || [];

  
  const handleStatusUpdate = async (acao) => {
  try {
    let body = null;

    if (acao === 'finalizar') {
      
      body = {
        
        formasPagamentosId: venda.formasPagamento?.id || venda.formasPagamentosId,
        valor_total: venda.valor_total || 0,
        statusVenda: "PAGA", 
        itens: venda.itens?.map(item => ({
          produtoId: item.produto?.id || item.produtoId,
          quantidade: item.quantidade
        })) || []
      };
    }

    
    await apiRequest(`/api/vendas/${venda.id}/${acao}`, 'PATCH', body);

    alert(`Venda ${acao === 'finalizar' ? 'finalizada' : 'cancelada'} com sucesso!`);
    refresh();
    onClose();
  } catch (err) {
    
    if (err.message?.includes("Unexpected token") || err.message?.includes("Cancelamento")) {
      refresh();
      onClose();
    } else {
      console.error("Erro detalhado:", err);
      alert("O servidor recusou a requisição (Erro 400). Verifique os nomes dos campos no Console.");
    }
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#718EBF] font-bold hover:text-red-500">X</button>

        <h2 className="text-xl font-bold text-[#151D48] mb-6">Detalhes da Venda #{venda.id}</h2>

        <div className="space-y-3 text-sm mb-8 bg-slate-50 p-5 rounded-2xl">
          <p><span className="text-[#737791]">Vendedor:</span> <span className="font-bold text-[#151D48]">{venda.usuario?.nome || '-'}</span></p>
          <p>
            <span className="text-[#737791]">Status: </span>
            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusClasses}`}>{status}</span>
          </p>
          <p><span className="text-[#737791]">Data:</span> <span className="font-medium">{formatDate(venda.data_criacao || venda.dataVenda)}</span></p>
        </div>

        <div className="mb-8">
          <p className="font-bold text-[#151D48] mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Receipt size={16} className="text-[#E67E22]" /> Itens do Pedido
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {itens.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">Nenhum produto vinculado.</p>
            ) : (
              itens.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#151D48]">{item.produto?.nome || item.produtoNome || 'Produto'}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{item.quantidade} unidade(s)</span>
                  </div>
                  <span className="font-bold text-teal-500">{formatPrice(item.precoTotal || item.sub_total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#151D48] p-7 rounded-[28px] flex justify-between items-center text-white mb-8 shadow-xl shadow-blue-50">
          <span className="opacity-50 text-[10px] uppercase font-bold tracking-widest">Valor Total</span>
          <span className="text-3xl font-black text-[#16DBCC]">{formatPrice(venda.valor_total)}</span>
        </div>

        {status === 'ABERTA' && (
          <div className="flex gap-4">
            <button 
              onClick={() => handleStatusUpdate('cancelar')}
              className="flex-1 bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={18} /> CANCELAR
            </button>
            <button 
              onClick={() => handleStatusUpdate('finalizar')}
              className="flex-1 bg-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> FINALIZAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


const NovaVendaModal = ({ onClose, onSuccess }) => {
  const [produtos, setProdutos] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resProd, resPgto] = await Promise.all([
          apiRequest('/api/produtos'),
          apiRequest('/api/formasdepagamento')
        ]);
        setProdutos(resProd || []);
        setFormasPagamento(resPgto || []);
      } catch (err) { console.error("Erro ao carregar dados do modal:", err); }
    };
    carregarDados();
  }, []);

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado || quantidade <= 0) return;
    
    const prod = produtos.find(p => p.id === parseInt(produtoSelecionado));
    if (!prod) return;

    const itemExistenteIndex = carrinho.findIndex(item => item.produtoId === prod.id);

    if (itemExistenteIndex > -1) {
      
      const novoCarrinho = [...carrinho];
      novoCarrinho[itemExistenteIndex].quantidade += parseInt(quantidade);
      novoCarrinho[itemExistenteIndex].total = novoCarrinho[itemExistenteIndex].quantidade * prod.preco;
      setCarrinho(novoCarrinho);
    } else {
      
      setCarrinho([...carrinho, { 
        produtoId: prod.id, 
        nome: prod.nome, 
        preco: prod.preco, 
        quantidade: parseInt(quantidade),
        total: prod.preco * quantidade 
      }]);
    }

   
    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const removerDoCarrinho = (index) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const totalGeral = carrinho.reduce((acc, item) => acc + item.total, 0);

  const salvarVenda = async () => {
  if (carrinho.length === 0) return alert("Carrinho vazio");
  
  const total = carrinho.reduce((acc, item) => acc + item.total, 0);

  const payload = {
    formasPagamentosId: parseInt(formaPagamentoSelecionada),
    valor_total: total,
    statusVenda: "ABERTA", 
    itens: carrinho.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade }))
  };

  try {
    await apiRequest('/api/vendas', 'POST', payload);
    onSuccess(); 
  } catch (err) { 
    alert("Erro ao salvar. Verifique se o status 'ABERTA' existe no Java."); 
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#151D48]">Nova Venda</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold">FECHAR</button>
        </div>
        
        <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Produto</label>
            <select 
              className="w-full p-3 bg-white border-none ring-1 ring-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
              value={produtoSelecionado} 
              onChange={e => setProdutoSelecionado(e.target.value)}
            >
              <option value="">Selecione...</option>
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - {formatPrice(p.preco)}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Qtd</label>
            <input 
              type="number" 
              className="w-full p-3 bg-white border-none ring-1 ring-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
            />
          </div>
          <button 
            onClick={adicionarAoCarrinho} 
            className="self-end bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Itens Selecionados</p>
          {carrinho.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm italic">Carrinho vazio...</p>
          ) : (
            <div className="space-y-2">
              {carrinho.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-[#151D48] text-sm">{item.nome}</p>
                    <p className="text-[10px] text-gray-400">{item.quantidade}x {formatPrice(item.preco)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-teal-600">{formatPrice(item.total)}</span>
                    <button onClick={() => removerDoCarrinho(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div className="w-1/2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Pagamento</label>
              <select 
                className="w-full p-3 bg-slate-50 border-none ring-1 ring-gray-100 rounded-xl"
                value={formaPagamentoSelecionada}
                onChange={e => setFormaPagamentoSelecionada(e.target.value)}
              >
                <option value="">Selecione...</option>
                {formasPagamento.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Geral</p>
              <p className="text-3xl font-black text-[#151D48]">{formatPrice(totalGeral)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 text-[#737791] font-bold hover:bg-gray-50 rounded-2xl transition-all">CANCELAR</button>
            <button 
              onClick={salvarVenda} 
              disabled={carrinho.length === 0}
              className="flex-1 py-4 bg-[#151D48] text-white rounded-[20px] font-bold shadow-xl shadow-blue-100 hover:bg-[#0a0f29] transition-all disabled:opacity-50"
            >
              FINALIZAR VENDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendas;