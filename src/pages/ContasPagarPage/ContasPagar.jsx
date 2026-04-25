import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { Search, Plus, Wallet, Calendar, Tag, Building2, CheckCircle, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import ContaModal from './components/ContaModal';

const STATUS_THEME = {
  PENDENTE:  { badge: 'bg-orange-50 text-orange-500',  label: 'Pendente'  },
  PAGA:      { badge: 'bg-green-50 text-green-600',    label: 'Paga'      },
  CANCELADA: { badge: 'bg-red-50 text-red-500',        label: 'Cancelada' },
  RECEBIDO:  { badge: 'bg-blue-50 text-blue-500',      label: 'Recebido'  },
};

const ContasPagar = () => {
  const [contas, setContas] = useState([]);
  const [resumo, setResumo] = useState({ TotalPago: 0, TotalVencido: 0 });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selecionada, setSelecionada] = useState(null);

  const hoje = new Date().toISOString().split('T')[0];

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [lista, resumoFinanceiro] = await Promise.all([
        apiRequest('/api/contas'),
        apiRequest('/api/contas/resumo'),
      ]);
      setContas(lista || []);
      setResumo(resumoFinanceiro || { TotalPago: 0, TotalVencido: 0 });
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handlePagar = async (id) => {
    if (!window.confirm('Marcar esta conta como paga?')) return;
    try {
      await apiRequest(`/api/contas/${id}/pagar`, 'PATCH');
      await carregarDados();
    } catch (err) {
      alert('Erro ao marcar como paga.');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Deseja excluir esta conta?')) return;
    try {
      await apiRequest(`/api/contas/${id}`, 'DELETE');
      await carregarDados();
    } catch (err) {
      alert('Erro ao excluir conta.');
    }
  };

  const handleEditar = (conta) => {
    setSelecionada(conta);
    setShowModal(true);
  };

  const handleNova = () => {
    setSelecionada(null);
    setShowModal(true);
  };

  const totalPendente = contas
    .filter(c => c.status !== 'PAGA' && c.status !== 'CANCELADA')
    .reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);

  const contasVencidas = contas.filter(c =>
    c.status === 'PENDENTE' && c.dataVencimento && c.dataVencimento < hoje
  );

  const isVencida = (conta) =>
    conta.status === 'PENDENTE' && conta.dataVencimento && conta.dataVencimento < hoje;

  const isVenceHoje = (conta) =>
    conta.status === 'PENDENTE' && conta.dataVencimento === hoje;

  const filtradas = contas.filter(c =>
    c.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Contas a Pagar</h2>
        <p className="text-[#737791]">Gerencie suas contas a pagar</p>
      </header>

      {contasVencidas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[24px] p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <p className="text-red-600 font-semibold text-sm">
            Você tem <span className="font-black">{contasVencidas.length}</span> conta{contasVencidas.length > 1 ? 's' : ''} vencida{contasVencidas.length > 1 ? 's' : ''} — total de{' '}
            <span className="font-black">
              R$ {contasVencidas.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-[#4079ED] text-sm font-medium mb-2">Total Pendente</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-red-400 text-sm font-medium mb-2">Total Vencido</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {(parseFloat(resumo.TotalVencido) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-green-500 text-sm font-medium mb-2">Total Pago</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {(parseFloat(resumo.TotalPago) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4079ED]" size={20} />
        <input
          type="text"
          placeholder="Buscar por descrição ou categoria..."
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-full outline-none focus:ring-2 focus:ring-orange-500"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">Carregando contas...</p>
        ) : filtradas.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nenhuma conta encontrada.</p>
        ) : (
          filtradas.map(conta => {
            const tema = STATUS_THEME[conta.status] || STATUS_THEME.PENDENTE;
            const vencida = isVencida(conta);
            const venceHoje = isVenceHoje(conta);

            return (
              <div
                key={conta.id}
                className={`bg-white p-6 rounded-[24px] shadow-sm border transition-shadow hover:shadow-md
                  ${vencida ? 'border-l-4 border-l-red-400 border-gray-50' : venceHoje ? 'border-l-4 border-l-orange-400 border-gray-50' : 'border border-gray-50'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-2xl shrink-0 ${vencida ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-[#151D48]'}`}>
                      <Wallet size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-[#151D48] text-base">{conta.descricao}</h4>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${tema.badge}`}>
                          {tema.label}
                        </span>
                        {vencida && (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-red-100 text-red-600">
                            Vencida
                          </span>
                        )}
                        {venceHoje && (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-orange-100 text-orange-600">
                            Vence hoje
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        {conta.dataVencimento && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            Venc.: {new Date(conta.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {conta.dataPagamento && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={11} />
                            Pago em: {new Date(conta.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {conta.categoria && (
                          <span className="flex items-center gap-1">
                            <Tag size={11} />
                            {conta.categoria}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="text-xl font-bold text-[#151D48]">
                      R$ {(parseFloat(conta.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-2">
                      {conta.status === 'PENDENTE' && (
                        <button
                          onClick={() => handlePagar(conta.id)}
                          title="Marcar como paga"
                          className="p-2 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {conta.status !== 'PAGA' && conta.status !== 'CANCELADA' && (
                        <button
                          onClick={() => handleEditar(conta)}
                          title="Editar"
                          className="p-2 bg-orange-50 text-orange-400 rounded-xl hover:bg-orange-100 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletar(conta.id)}
                        title="Excluir"
                        className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={handleNova}
        className="fixed bottom-10 right-10 bg-[#E67E22] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all z-40"
      >
        <Plus size={32} />
      </button>

      {showModal && (
        <ContaModal
          conta={selecionada}
          onClose={() => { setShowModal(false); setSelecionada(null); }}
          onSuccess={carregarDados}
        />
      )}
    </div>
  );
};

export default ContasPagar;