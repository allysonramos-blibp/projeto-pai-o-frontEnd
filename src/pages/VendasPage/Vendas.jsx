import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/auth';
import { Plus, Trash2, Receipt, ShoppingBag, ChevronDown, ChevronUp, X } from 'lucide-react';

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

const STATUS_BADGE = {
  PAGA:      'bg-teal-50 text-teal-600 ring-1 ring-teal-100',
  CANCELADA: 'bg-red-50 text-red-500 ring-1 ring-red-100',
  ABERTA:    'bg-orange-50 text-orange-500 ring-1 ring-orange-100',
};

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vendas</h2>
        <p className="text-gray-400 text-sm mt-0.5">Registre e gerencie suas vendas</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">Histórico de Vendas</h3>
          {vendas.length > 4 && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
            >
              {expandido ? <><ChevronUp size={15} /> Ver menos</> : <><ChevronDown size={15} /> Ver tudo ({vendas.length})</>}
            </button>
          )}
        </div>

        {vendas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200">
            <Receipt size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Nenhuma venda registrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendasExibidas.map((venda) => {
              const status = venda.status || 'ABERTA';
              const badgeClass = STATUS_BADGE[status] || STATUS_BADGE.ABERTA;

              const categoriaPrimaria = venda.itens?.length > 0
                ? venda.itens[0].produto.nomeCategoria || 'Consumível'
                : 'Geral';

              const nomeExibicao = venda.itens?.length > 1
                ? `${categoriaPrimaria} (+${venda.itens.length - 1} itens)`
                : categoriaPrimaria;

              return (
                <div
                  key={venda.id}
                  onClick={() => setSelectedVenda(venda)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r" />

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-gray-800 text-sm group-hover:text-orange-500 transition-colors uppercase truncate max-w-[200px]">
                        {nomeExibicao}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {venda.formasPagamento?.nome || 'Não definida'}
                      </p>
                      <p className="text-xs text-gray-300 mt-1.5 font-mono">
                        🕒 {formatDate(venda.data_criacao)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${badgeClass}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">Valor Total</span>
                    <span className="text-lg font-black text-teal-600">
                      {formatPrice(venda.valor_total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={() => setShowFormModal(true)}
        className="fixed right-6 bottom-6 z-50 bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-orange-100 transition-colors"
      >
        <Plus size={26} />
      </button>

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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-800">Venda #{venda.id}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Vendedor: </span>
              <span className="font-semibold text-gray-800">{venda.usuario?.nome || '-'}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Status:</span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black ${STATUS_BADGE[status] || STATUS_BADGE.ABERTA}`}>
                {status}
              </span>
            </div>
            {isAberta ? (
              <div className="pt-1">
                <p className="text-gray-400 text-xs mb-1">Forma de Pagamento:</p>
                <select
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 transition"
                  value={pagamentoId}
                  onChange={(e) => handleTrocarPagamento(e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {formasPagamento.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
            ) : (
              <p>
                <span className="text-gray-400">Pagamento: </span>
                <span className="font-medium text-gray-800">{venda.formasPagamento?.nome || '-'}</span>
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase mb-2">
              <ShoppingBag size={13} /> Itens
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {itens.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.produto?.nome}</p>
                    <p className="text-xs text-gray-400">{item.quantidade} UN</p>
                  </div>
                  <p className="font-bold text-teal-600 text-sm">{formatPrice(item.precoTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl px-5 py-4 flex justify-between items-center mb-5">
            <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
            <span className="text-2xl font-black text-teal-400">{formatPrice(venda.valor_total)}</span>
          </div>

          {isAberta && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCancelar}
                disabled={loading}
                className="bg-red-50 text-red-500 font-bold py-3 rounded-xl text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizar}
                disabled={loading || !pagamentoId}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Finalizar
              </button>
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

  const adicionarItem = () => {
    if (!itemAtual.produtoId) return;
    setCarrinho([...carrinho, { ...itemAtual, precoTotal: itemAtual.precoUnitario * itemAtual.quantidade }]);
    setItemAtual({ produtoId: '', quantidade: 1, precoUnitario: 0, nome: '' });
  };

  const finalizarVenda = async () => {
    const body = {
      formasPagamentosId: parseInt(pagamentoId),
      itens: carrinho.map(i => ({
        produtoId: parseInt(i.produtoId),
        quantidade: parseInt(i.quantidade),
        precoUnitario: i.precoUnitario,
      })),
    };
    try {
      await apiRequest('/api/vendas', 'POST', body);
      onSuccess();
    } catch (err) { alert(err.message); }
  };

  const totalCarrinho = carrinho.reduce((a, b) => a + b.precoTotal, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Receipt size={20} className="text-orange-500" /> Registrar Venda
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-50 border border-gray-100 p-5 rounded-2xl">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                className="p-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 transition"
                value={itemAtual.produtoId}
                onChange={e => {
                  const p = produtos.find(x => x.id === parseInt(e.target.value));
                  setItemAtual({ ...itemAtual, produtoId: e.target.value, precoUnitario: p?.preco || 0, nome: p?.nome || '' });
                }}
              >
                <option value="">Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input
                type="number"
                min="1"
                className="p-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 transition"
                value={itemAtual.quantidade}
                onChange={e => setItemAtual({ ...itemAtual, quantidade: parseInt(e.target.value) || 1 })}
              />
            </div>
            <button
              onClick={adicionarItem}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm mb-5 transition-colors"
            >
              Adicionar
            </button>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  {carrinho.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-300 text-xs">Nenhum item adicionado.</td>
                    </tr>
                  ) : carrinho.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-none">
                      <td className="p-4 font-semibold text-gray-800">{item.nome}</td>
                      <td className="p-4 text-gray-400">{item.quantidade} UN</td>
                      <td className="p-4 font-bold text-teal-600">{formatPrice(item.precoTotal)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-800">Finalização</h3>
            <select
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 transition"
              value={pagamentoId}
              onChange={e => setPagamentoId(e.target.value)}
            >
              <option value="">Pagamento...</option>
              {formasPagamento.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs text-orange-400 font-bold uppercase mb-1">Total</p>
              <p className="text-2xl font-black text-orange-600">{formatPrice(totalCarrinho)}</p>
            </div>

            <button
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || !pagamentoId}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-colors mt-auto"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendas;