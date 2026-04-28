import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/auth';
import { useAuth } from '../../../contexts/authContext';
import { X, Plus, CheckCircle, XCircle, Trash2, Printer, Loader2, Banknote, CreditCard, Smartphone, Wallet, Clock } from 'lucide-react';

const ICONE_POR_TIPO = {
  DINHEIRO: Banknote,
  DIGITAL:  Smartphone,
  CARTAO:   CreditCard,
};

const ICONE_POR_NOME = {
  'debito': Wallet,
  'debit':  Wallet,
};

const getIcone = (forma) => {
  const porNome = Object.entries(ICONE_POR_NOME).find(([key]) =>
    forma.nome.toLowerCase().includes(key)
  );
  if (porNome) return porNome[1];
  return ICONE_POR_TIPO[forma.tipo] || CreditCard;
};

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
    if (pagarDepois) {
      onConfirmar({ pagarDepois: true, formaPagamentoId: null });
    } else if (formaSelecionada) {
      onConfirmar({ pagarDepois: false, formaPagamentoId: formaSelecionada });
    }
  };

  const podeConfirmar = pagarDepois || formaSelecionada !== null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#151D48]">Forma de Pagamento</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        <div className="bg-[#151D48] rounded-2xl p-4 flex justify-between items-center mb-6">
          <span className="text-sm text-white/60 font-bold uppercase tracking-tight">Total</span>
          <span className="text-2xl font-black text-teal-400">R$ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={() => { setPagarDepois(!pagarDepois); setFormaSelecionada(null); }}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl ring-2 transition-all font-bold text-sm mb-4
            ${pagarDepois
              ? 'bg-orange-50 text-orange-500 ring-orange-200 ring-offset-2'
              : 'bg-gray-50 text-gray-400 ring-gray-100 hover:ring-gray-200'
            }`}
        >
          <Clock size={20} />
          Pagar Depois
          <span className="ml-auto text-xs font-normal opacity-60">Gera conta a receber</span>
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-6 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <div className={`grid grid-cols-2 gap-3 mb-6 transition-opacity ${pagarDepois ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            {formas.map((forma) => {
              const Icone = getIcone(forma);
              return (
                <button
                  key={forma.id}
                  onClick={() => setFormaSelecionada(forma.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl ring-2 transition-all font-bold text-sm text-center
                    ${formaSelecionada === forma.id
                      ? 'bg-teal-50 text-teal-600 ring-teal-200 ring-offset-2 scale-95'
                      : 'bg-gray-50 text-gray-400 ring-gray-100 hover:ring-gray-200'
                    }`}
                >
                  <Icone size={22} />
                  {forma.nome}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleConfirmar}
          disabled={!podeConfirmar}
          className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle size={18} />
          {pagarDepois ? 'CONFIRMAR — PAGAR DEPOIS' : 'CONFIRMAR PAGAMENTO'}
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
        quantidade: parseInt(quantidade)
      });
      setItemSelecionado('');
      setQuantidade(1);
      await atualizarDadosComanda();
    } catch (err) {
      alert("Erro ao lançar item.");
    }
  };

  const handleRemoverItem = async (itemId) => {
    if (!window.confirm("Deseja remover este item?")) return;
    try {
      await apiRequest(`/api/comandas/itens/${itemId}`, 'DELETE');
      await atualizarDadosComanda();
    } catch (err) {
      alert("Erro ao remover item.");
    }
  };

  const handleCancelar = async () => {
    try {
      await apiRequest(`/api/comandas/${comanda.id}`, 'DELETE');
      await refresh();
      onClose();
    } catch (err) {
      console.error("Erro ao cancelar comanda:", err);
      alert(`Erro ao cancelar comanda: ${err?.message || 'Verifique o console'}`);
    }
  };

  const handleFinalizar = async ({ pagarDepois, formaPagamentoId }) => {
  
  if (!user?.id) {
    alert("Erro: Usuário não identificado. Tente fazer login novamente.");
    return;
  }

  if (!comanda?.id) {
    alert("Erro: Comanda não identificada.");
    return;
  }

  try {
    await apiRequest(`/api/comandas/${comanda.id}/finalizar`, 'PATCH', {
      formaPagamentoId,
      pagarDepois,
      usuarioId: user.id,
    });
    await refresh();
    onClose();
  } catch (err) {
    console.error("Erro ao finalizar comanda:", err);
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
            p.sub { text-align: center; color: #666; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            thead tr { border-bottom: 2px dashed #ccc; }
            th { padding: 6px 0; font-size: 11px; color: #999; text-transform: uppercase; }
            tfoot tr { border-top: 2px dashed #ccc; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 8px; }
          </style>
        </head>
        <body>
          <h2>Mesa ${comandaLocal.numeroMesa}</h2>
          <p class="sub">Status: ${comandaLocal.status}</p>
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
        <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl flex flex-col max-h-[90vh]">

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#151D48]">Mesa {comandaLocal.numeroMesa}</h2>
              <button onClick={handlePrint} className="p-2 text-gray-400 hover:text-blue-500">
                <Printer size={20} />
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          {isAberta ? (
            <div className="bg-orange-50 p-4 rounded-2xl mb-6 flex gap-2">
              <select
                className="flex-1 p-2 bg-white rounded-xl text-sm ring-1 ring-orange-200 outline-none"
                value={itemSelecionado}
                onChange={e => setItemSelecionado(e.target.value)}
              >
                <option value="">Lançar Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input
                type="number"
                className="w-16 p-2 bg-white rounded-xl text-sm ring-1 ring-orange-200"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                min="1"
              />
              <button onClick={handleAddProduto} className="bg-[#E67E22] text-white p-2 rounded-xl">
                <Plus />
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-2xl mb-6 text-center text-gray-500 text-sm font-bold border border-dashed border-gray-300 uppercase">
              Comanda {comandaLocal.status}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Itens Lançados</p>
            {comandaLocal.itens && comandaLocal.itens.length > 0 ? (
              comandaLocal.itens.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-[#151D48]">{item.nomeProduto || 'Produto'}</p>
                    <p className="text-xs text-gray-400">{item.quantidade || 0} unidades</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-teal-600 text-sm">
                      R$ {(item.subtotal || 0).toFixed(2)}
                    </span>
                    {isAberta && (
                      <button onClick={() => handleRemoverItem(item.id)} className="text-red-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-4">Nenhum item na conta.</p>
            )}
          </div>

          <div className="bg-[#151D48] p-5 rounded-2xl text-white flex justify-between items-center mb-6">
            <span className="text-sm opacity-60 font-bold uppercase tracking-tighter">Total Acumulado</span>
            <span className="text-2xl font-black text-teal-400">R$ {(comandaLocal.valorTotal || 0).toFixed(2)}</span>
          </div>

          {isAberta && (
            <div className="flex gap-3">
              <button
                onClick={handleCancelar}
                className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> CANCELAR
              </button>
              <button
                onClick={() => setShowPagamento(true)}
                className="flex-1 py-4 bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-100"
              >
                <CheckCircle size={18} /> FINALIZAR
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