import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/auth';
import { Plus, Trash2, Receipt, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatPrice = (value) =>
  Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [expandido, setExpandido] = useState(false);

  const carregarHistorico = async () => {
    try {
      const data = await apiRequest('/api/vendas?size=100');
      setVendas(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { carregarHistorico(); }, []);

  const vendasExibidas = expandido ? vendas : vendas.slice(0, 4);

  return (
    <div className="p-8 bg-gray-50 dark:bg-[#0F172A] min-h-screen transition-colors">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#151D48] dark:text-white">Vendas</h2>
        <p className="text-[#737791] dark:text-slate-400 text-sm">Registre e gerencie suas vendas</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#151D48] dark:text-white">Histórico de Vendas</h3>
          {vendas.length > 4 && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="text-sm font-semibold text-[#E67E22] hover:text-[#d35400] flex items-center gap-1.5 transition-colors"
            >
              {expandido ? (
                <><ChevronUp size={16} /> Ver menos</>
              ) : (
                <><ChevronDown size={16} /> Ver tudo ({vendas.length})</>
              )}
            </button>
          )}
        </div>

        {vendas.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-10 text-center border border-gray-100 dark:border-slate-800 shadow-sm">
            <Receipt size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-[#718EBF] dark:text-slate-500 text-sm font-medium">Nenhuma venda registrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vendasExibidas.map((venda) => {
              const status = venda.status || 'ABERTA';
              let statusBadge = 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 ring-orange-100 dark:ring-orange-800';
              if (status === 'PAGA') statusBadge = 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 ring-teal-100 dark:ring-teal-800';
              if (status === 'CANCELADA') statusBadge = 'bg-red-50 dark:bg-red-900/20 text-red-500 ring-red-100 dark:ring-red-800';

              const categoriaPrimaria = venda.itens && venda.itens.length > 0 
                ? venda.itens[0].produto.nomeCategoria || "Consumível"
                : "Geral";

              const nomeExibicao = venda.itens?.length > 1 
                ? `${categoriaPrimaria} (+${venda.itens.length - 1} itens)` 
                : categoriaPrimaria;

              return (
                <div
                  key={venda.id}
                  onClick={() => setSelectedVenda(venda)}
                  className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-100 dark:hover:border-orange-900 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r"></div>
                  
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-[#151D48] dark:text-white text-base group-hover:text-[#E67E22] transition-colors uppercase truncate max-w-[200px]">
                        {nomeExibicao}
                      </p>
                      <p className="text-[#737791] dark:text-slate-400 text-sm font-medium mt-0.5">
                        {venda.formasPagamento?.nome || 'Não definida'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 font-mono">
                        🕒 {formatDate(venda.data_criacao)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${statusBadge}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-50 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-500">Valor Total</span>
                    <span className="text-xl font-extrabold text-teal-500">
                      {formatPrice(venda.valor_total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-[#E67E22] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-none hover:bg-[#d35400] transition-colors"
        >
          <Plus size={28} />
        </button>
      </div>

      {showFormModal && (
        <NovaVendaModal
          onClose={() => setShowFormModal(false)}
          onSuccess={() => { setShowFormModal(false); carregarHistorico(); }}
        />
      )}

      {selectedVenda && (
        <VendaDetailModal
          venda={selectedVenda}
          onClose={() => setSelectedVenda(null)}
          onUpdate={carregarHistorico}
        />
      )}
    </div>
  );
};

const VendaDetailModal = ({ venda, onClose, onUpdate }) => {
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [pagamentoId, setPagamentoId] = useState(venda.formasPagamento?.id || '');
  const [loading, setLoading] = useState(false);

  const status = venda.status || 'ABERTA';
  const isPaga = status === 'PAGA';
  const isAberta = status === 'ABERTA';
  const itens = venda.itens || [];

  useEffect(() => {
    apiRequest('/api/formasdepagamento').then(setFormasPagamento).catch(console.error);
  }, []);

  const handleTrocarPagamento = async (novoId) => {
    setPagamentoId(novoId);
    if (!novoId) return;
    try {
      await apiRequest(`/api/vendas/${venda.id}/pagamento`, 'PATCH', { formaPagamentosId: parseInt(novoId) });
      onUpdate();
    } catch (err) { console.error(err); }
  };

  const handleFinalizar = async () => {
    if (!pagamentoId) return alert('Selecione uma forma de pagamento.');
    setLoading(true);
    try {
      await apiRequest(`/api/vendas/${venda.id}/finalizar`, 'PATCH', { formasPagamentosId: parseInt(pagamentoId) });
      onUpdate();
      onClose();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCancelar = async () => {
    if (!window.confirm('Deseja cancelar esta venda?')) return;
    setLoading(true);
    try {
      await apiRequest(`/api/vendas/${venda.id}/cancelar`, 'PATCH');
      onUpdate();
      onClose();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#F4F6FA] dark:bg-[#0F172A] rounded-[28px] w-full max-w-md shadow-2xl relative overflow-hidden border border-gray-200 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-5 right-5 text-[#151D48] dark:text-white font-bold text-lg hover:text-red-400">✕</button>
        <div className="p-7">
          <h2 className="text-xl font-bold text-[#151D48] dark:text-white mb-5">Venda #{venda.id}</h2>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 mb-5 space-y-2 text-sm border border-gray-100 dark:border-slate-800">
            <p><span className="text-[#737791] dark:text-slate-400">Vendedor: </span><span className="font-bold text-[#151D48] dark:text-white">{venda.usuario?.nome || '-'}</span></p>
            <p className="flex items-center gap-2">
              <span className="text-[#737791] dark:text-slate-400">Status:</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${isAberta ? 'bg-orange-100 text-orange-500' : isPaga ? 'bg-teal-50 text-teal-500' : 'bg-red-100 text-red-500'}`}>{status}</span>
            </p>
            {isAberta ? (
              <div className="pt-1">
                <p className="text-[#737791] dark:text-slate-400 mb-1">Forma de Pagamento:</p>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-slate-700 text-sm text-[#151D48] dark:text-white font-medium" value={pagamentoId} onChange={(e) => handleTrocarPagamento(e.target.value)}>
                  <option value="">Selecionar...</option>
                  {formasPagamento.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
            ) : (
              <p><span className="text-[#737791] dark:text-slate-400">Pagamento: </span><span className="font-medium text-[#151D48] dark:text-white">{venda.formasPagamento?.nome || '-'}</span></p>
            )}
          </div>
          <div className="mb-5">
            <p className="flex items-center gap-2 text-xs font-bold text-[#E67E22] uppercase mb-3"><ShoppingBag size={14} /> Itens</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {itens.map((item, index) => (
                <div key={index} className="bg-white dark:bg-[#1E293B] rounded-xl px-4 py-3 flex justify-between items-center border border-gray-100 dark:border-slate-800">
                  <div><p className="font-semibold text-[#151D48] dark:text-white text-sm">{item.produto?.nome}</p><p className="text-xs text-[#737791] dark:text-slate-400">{item.quantidade} UN</p></div>
                  <p className="font-bold text-teal-500 text-sm">{formatPrice(item.precoTotal)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#151D48] rounded-2xl px-6 py-4 flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
            <span className="text-2xl font-bold text-teal-400">{formatPrice(venda.valor_total)}</span>
          </div>
          {isAberta && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleCancelar} disabled={loading} className="bg-red-50 dark:bg-red-900/20 text-red-500 font-bold p-4 rounded-2xl disabled:opacity-50">CANCELAR</button>
              <button onClick={handleFinalizar} disabled={loading || !pagamentoId} className="bg-teal-500 text-white font-bold p-4 rounded-2xl disabled:opacity-50">FINALIZAR</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NovaVendaModal = ({ onClose, onSuccess }) => {
  const [produtos, setProdutos] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [pagamentoId, setPagamentoId] = useState('');
  const [itemAtual, setItemAtual] = useState({ produtoId: '', quantidade: 1, precoUnitario: 0, nome: '' });

  useEffect(() => {
    Promise.all([apiRequest('/api/produtos'), apiRequest('/api/formasdepagamento')])
      .then(([p, f]) => { setProdutos(p || []); setFormasPagamento(f || []); })
      .catch(console.error);
  }, []);

  const finalizarVenda = async () => {
    const body = {
      formasPagamentosId: parseInt(pagamentoId),
      itens: carrinho.map(i => ({ produtoId: parseInt(i.produtoId), quantidade: parseInt(i.quantidade), precoUnitario: i.precoUnitario })),
    };
    try { await apiRequest('/api/vendas', 'POST', body); onSuccess(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-[28px] w-full max-w-5xl h-[90vh] overflow-y-auto relative border border-gray-100 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 dark:text-slate-500 font-bold text-lg">✕</button>
        <h2 className="text-2xl font-bold text-[#151D48] dark:text-white mb-8 flex items-center gap-3"><Receipt className="text-[#E67E22]" /> Registrar Venda</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-50 dark:bg-[#0F172A] p-6 rounded-2xl">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <select className="p-3 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-[#151D48] dark:text-white" value={itemAtual.produtoId} onChange={e => {
                const p = produtos.find(x => x.id === parseInt(e.target.value));
                setItemAtual({...itemAtual, produtoId: e.target.value, precoUnitario: p?.preco || 0, nome: p?.nome || ''});
              }}>
                <option value="">Produto</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input type="number" min="1" className="p-3 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-[#151D48] dark:text-white" value={itemAtual.quantidade} onChange={e => setItemAtual({...itemAtual, quantidade: parseInt(e.target.value) || 1})} />
            </div>
            <button onClick={() => { if(itemAtual.produtoId) setCarrinho([...carrinho, {...itemAtual, precoTotal: itemAtual.precoUnitario * itemAtual.quantidade}]); setItemAtual({produtoId: '', quantidade: 1, precoUnitario: 0, nome: ''}) }} className="w-full bg-[#E67E22] text-white p-3 rounded-xl font-semibold mb-6">Adicionar</button>
            <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <tbody>
                  {carrinho.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-slate-700">
                      <td className="p-4 font-semibold text-[#151D48] dark:text-white">{item.nome}</td>
                      <td className="p-4 text-[#737791] dark:text-slate-400">{item.quantidade} UN</td>
                      <td className="p-4 font-bold text-teal-500">R$ {item.precoTotal.toFixed(2)}</td>
                      <td className="p-4 text-right"><button onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold mb-5 dark:text-white">Finalização</h3>
            <select className="w-full p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-slate-700 mb-5 text-[#151D48] dark:text-white" value={pagamentoId} onChange={e => setPagamentoId(e.target.value)}>
              <option value="">Pagamento</option>
              {formasPagamento.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl mb-6">
              <p className="text-2xl font-bold text-[#E67E22]">R$ {carrinho.reduce((a, b) => a + b.precoTotal, 0).toFixed(2)}</p>
            </div>
            <button onClick={finalizarVenda} disabled={carrinho.length === 0 || !pagamentoId} className="w-full bg-[#151D48] dark:bg-white text-white dark:text-[#151D48] p-4 rounded-xl font-bold disabled:opacity-40">Finalizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendas;