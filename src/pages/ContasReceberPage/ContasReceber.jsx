import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { Search, Wallet, Calendar, User, CheckCircle, Trash2, AlertTriangle, Hash, Clock } from 'lucide-react';

const STATUS_THEME = {
  PENDENTE:  { badge: 'bg-orange-50 text-orange-500',  label: 'Pendente'  },
  RECEBIDO:  { badge: 'bg-green-50 text-green-600',    label: 'Recebido'  },
  PAGA:      { badge: 'bg-green-50 text-green-600',    label: 'Paga'      },
  CANCELADA: { badge: 'bg-red-50 text-red-500',        label: 'Cancelada' },
};

const ContasReceber = () => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const hoje = new Date().toISOString().split('T')[0];

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/contas-receber');
      setContas(data || []);
    } catch (err) {
      console.error('Erro ao carregar contas a receber:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleReceber = async (id) => {
    if (!window.confirm('Marcar esta conta como recebida?')) return;
    try {
      await apiRequest(`/contas-receber/${id}/receber`, 'PATCH');
      await carregarDados();
    } catch (err) {
      alert('Erro ao marcar como recebida.');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Deseja excluir esta conta?')) return;
    try {
      await apiRequest(`/contas-receber/${id}`, 'DELETE');
      await carregarDados();
    } catch (err) {
      alert('Erro ao excluir conta.');
    }
  };

  const totalPendente = contas
    .filter(c => c.status === 'PENDENTE')
    .reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);

  const totalRecebido = contas
    .filter(c => c.status === 'RECEBIDO' || c.status === 'PAGA')
    .reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);

  const contasVencidas = contas.filter(c =>
    c.status === 'PENDENTE' && c.dataVencimento && c.dataVencimento < hoje
  );

  const isVencida = (conta) =>
    conta.status === 'PENDENTE' && conta.dataVencimento && conta.dataVencimento < hoje;

  const isVenceHoje = (conta) =>
    conta.status === 'PENDENTE' && conta.dataVencimento === hoje;

  const filtradas = contas.filter(c =>
    c.cliente?.toLowerCase().includes(busca.toLowerCase()) ||
    c.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Contas a Receber</h2>
        <p className="text-[#737791]">Acompanhe os recebimentos das comandas</p>
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
          <p className="text-orange-400 text-sm font-medium mb-2">Total Pendente</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-red-400 text-sm font-medium mb-2">Total Vencido</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {contasVencidas.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-green-500 text-sm font-medium mb-2">Total Recebido</p>
          <h3 className="text-2xl font-bold text-[#151D48]">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4079ED]" size={20} />
        <input
          type="text"
          placeholder="Buscar por cliente ou descrição..."
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-full outline-none focus:ring-2 focus:ring-orange-500"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Lista */}
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
                    <div className={`p-3 rounded-2xl shrink-0 ${vencida ? 'bg-red-50 text-red-500' : conta.status === 'PENDENTE' ? 'bg-orange-50 text-orange-400' : 'bg-teal-50 text-teal-600'}`}>
                      {conta.status === 'PENDENTE' ? <Clock size={22} /> : <Wallet size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
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
                        {conta.cliente && (
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {conta.cliente}
                          </span>
                        )}
                        {conta.dataVencimento && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            Venc.: {new Date(conta.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {conta.dataRecebimento && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={11} />
                            Recebido em: {new Date(conta.dataRecebimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {conta.comandaId && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Hash size={11} />
                            Comanda #{conta.comandaId}
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
                          onClick={() => handleReceber(conta.id)}
                          title="Marcar como recebida"
                          className="p-2 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={16} />
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
    </div>
  );
};

export default ContasReceber;