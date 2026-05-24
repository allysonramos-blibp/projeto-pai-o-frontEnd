import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/auth';
import { useAuth } from '../../../contexts/authContext';
import {
  X, Plus, CheckCircle, XCircle, Trash2, Printer,
  Loader2, Banknote, CreditCard, Smartphone, Wallet,
  Clock, Calendar, User
} from 'lucide-react';


const ICONE_POR_TIPO = {
  DINHEIRO: Banknote,
  DIGITAL:  Smartphone,
  CARTAO:   CreditCard,
};
const ICONE_POR_NOME = { debito: Wallet, debit: Wallet };

const getIcone = (forma) => {
  const match = Object.entries(ICONE_POR_NOME).find(([key]) =>
    forma.nome.toLowerCase().includes(key)
  );
  return match ? match[1] : (ICONE_POR_TIPO[forma.tipo] || CreditCard);
};

const formatarData = (dataStr) => {
  if (!dataStr) return null;
  return new Date(dataStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatBRL = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);


const ModalPagamento = ({ total, onConfirmar, onFechar }) => {
  const [formas, setFormas] = useState([]);
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [pagarDepois, setPagarDepois] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/formasdepagamento')
      .then(data => setFormas(data.filter(f => f.ativo)))
      .catch(() => setFormas([]))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmar = () => {
    if (pagarDepois) onConfirmar({ pagarDepois: true, formaPagamentoId: null });
    else if (formaSelecionada) onConfirmar({ pagarDepois: false, formaPagamentoId: formaSelecionada });
  };

  const podeConfirmar = pagarDepois || formaSelecionada !== null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">

        
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-gray-800">Forma de Pagamento</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex justify-between items-center mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Total</span>
          <span className="text-2xl font-black text-teal-600">{formatBRL(total)}</span>
        </div>

        
        <button
          onClick={() => { setPagarDepois(!pagarDepois); setFormaSelecionada(null); }}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all font-semibold text-sm mb-4 ${
            pagarDepois
              ? 'bg-orange-50 border-orange-400 text-orange-600'
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <Clock size={18} />
          Pagar Depois
          <span className="ml-auto text-xs font-normal text-gray-400">Gera conta a receber</span>
        </button>

        
        {loading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className={`grid grid-cols-2 gap-3 mb-5 transition-opacity ${pagarDepois ? 'opacity-30 pointer-events-none' : ''}`}>
            {formas.map((forma) => {
              const Icone = getIcone(forma);
              return (
                <button
                  key={forma.id}
                  onClick={() => setFormaSelecionada(forma.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                    formaSelecionada === forma.id
                      ? 'bg-teal-50 border-teal-400 text-teal-600 scale-95'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icone size={20} />
                  {forma.nome}
                </button>
              );
            })}
          </div>
        )}

        
        <button
          onClick={handleConfirmar}
          disabled={!podeConfirmar}
          className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle size={17} />
          {pagarDepois ? 'Confirmar — Pagar Depois' : 'Confirmar Pagamento'}
        </button>
      </div>
    </div>
  );
};


const DetalheComandaModal = ({ comanda, onClose, refresh }) => {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [comandaLocal, setComandaLocal] = useState(comanda);
  const [showPagamento, setShowPagamento] = useState(false);

  const atualizarDadosComanda = async () => {
    try {
      const data = await apiRequest(`/api/comandas/${comanda.id}`);
      setComandaLocal(data);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    apiRequest('/api/produtos').then(setProdutos).catch(console.error);
    atualizarDadosComanda();
  }, []);

  const handleAddProduto = async () => {
    if (!itemSelecionado) return;
    try {
      await apiRequest(`/api/comandas/${comanda.id}/itens`, 'POST', {
        produtoId: parseInt(itemSelecionado),
        quantidade: parseInt(quantidade),
      });
      setItemSelecionado('');
      setQuantidade(1);
      await atualizarDadosComanda();
    } catch {
      alert('Erro ao lançar item.');
    }
  };

  const handleRemoverItem = async (itemId) => {
    if (!window.confirm('Deseja remover este item?')) return;
    try {
      await apiRequest(`/api/comandas/itens/${itemId}`, 'DELETE');
      await atualizarDadosComanda();
    } catch {
      alert('Erro ao remover item.');
    }
  };

  const handleCancelar = async () => {
    try {
      await apiRequest(`/api/comandas/${comanda.id}`, 'DELETE');
      await refresh();
      onClose();
    } catch (err) {
      alert(`Erro ao cancelar comanda: ${err?.message || 'Verifique o console'}`);
    }
  };

  const handleFinalizar = async ({ pagarDepois, formaPagamentoId }) => {
    try {
      await apiRequest(`/api/comandas/${comanda.id}/finalizar`, 'PATCH', {
        formaPagamentoId,
        pagarDepois,
        usuarioId: user.id,
      });
      await refresh();
      onClose();
    } catch (err) {
      alert(`Erro ao finalizar comanda: ${err?.message || 'Verifique o console'}`);
    }
  };

  const handlePrint = () => {
    const itensHtml = (comandaLocal.itens || []).map(item => `
      <tr>
        <td style="padding:6px 0; font-weight:bold">${item.nomeProduto || 'Produto'}</td>
        <td style="padding:6px 0; text-align:center">${item.quantidade || 0}</td>
        <td style="padding:6px 0; text-align:right; color:#0d9488">R$ ${(item.subtotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Comanda - Mesa ${comandaLocal.numeroMesa}</title>
          <style>
            body { font-family: monospace; padding: 24px; max-width: 400px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 4px; font-size: 20px; }
            p.sub { text-align: center; color: #666; font-size: 12px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; }
            thead tr { border-bottom: 2px dashed #ccc; }
            th { padding: 6px 0; font-size: 11px; color: #999; text-transform: uppercase; }
            tfoot tr { border-top: 2px dashed #ccc; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 8px; }
          </style>
        </head>
        <body>
          <h2>Mesa ${comandaLocal.numeroMesa}</h2>
          <p class="sub">Cliente: ${comandaLocal.nomeCliente || 'Consumidor'}</p>
          ${comandaLocal.dataAbertura ? `<p class="sub">Abertura: ${formatarData(comandaLocal.dataAbertura)}</p>` : ''}
          <p class="sub">Status: ${comandaLocal.status}</p>
          <br/>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">Produto</th>
                <th style="text-align:center">Qtd</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itensHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="total">TOTAL</td>
                <td class="total">R$ ${(comandaLocal.valorTotal || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const anterior = document.getElementById('iframe-impressao');
    if (anterior) anterior.remove();
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe-impressao';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 1000);
    };
  };

  const isAberta = comandaLocal.status === 'ABERTA';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh] border border-gray-100">

          
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Mesa {comandaLocal.numeroMesa}</h2>
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Printer size={17} />
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {comandaLocal.nomeCliente && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User size={11} /> {comandaLocal.nomeCliente}
                  </span>
                )}
                {comandaLocal.dataAbertura && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} /> {formatarData(comandaLocal.dataAbertura)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          
          {isAberta ? (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-5 flex gap-2">
              <select
                className="flex-1 p-2 bg-white rounded-lg text-sm border border-gray-200 outline-none text-gray-700 focus:ring-2 focus:ring-orange-400 transition"
                value={itemSelecionado}
                onChange={e => setItemSelecionado(e.target.value)}
              >
                <option value="">Lançar Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input
                type="number"
                className="w-16 p-2 bg-white rounded-lg text-sm border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 transition"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                min="1"
              />
              <button
                onClick={handleAddProduto}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 p-3 rounded-xl mb-5 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
              Comanda {comandaLocal.status}
            </div>
          )}

          
          <div className="flex-1 overflow-y-auto space-y-2 mb-5 pr-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Itens Lançados</p>

            {comandaLocal.itens && comandaLocal.itens.length > 0 ? (
              comandaLocal.itens.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.nomeProduto || 'Produto'}</p>
                    <p className="text-xs text-gray-400">{item.quantidade || 0} unidades</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-teal-600 text-sm">{formatBRL(item.subtotal)}</span>
                    {isAberta && (
                      <button
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-6">Nenhum item na conta.</p>
            )}
          </div>

          
          <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex justify-between items-center mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Total Acumulado</span>
            <span className="text-2xl font-black text-teal-600">{formatBRL(comandaLocal.valorTotal)}</span>
          </div>

          
          {isAberta && (
            <div className="flex gap-3">
              <button
                onClick={handleCancelar}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-100 transition-colors text-sm"
              >
                <XCircle size={17} /> Cancelar
              </button>
              <button
                onClick={() => setShowPagamento(true)}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-200 transition-colors text-sm"
              >
                <CheckCircle size={17} /> Finalizar
              </button>
            </div>
          )}
        </div>
      </div>

      {showPagamento && (
        <ModalPagamento
          total={comandaLocal.valorTotal || 0}
          onConfirmar={handleFinalizar}
          onFechar={() => setShowPagamento(false)}
        />
      )}
    </>
  );
};

export default DetalheComandaModal;