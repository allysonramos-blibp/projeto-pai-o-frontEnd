import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import {
  TrendingUp, ShoppingCart, AlertTriangle,
  Clock, Receipt, Wallet, CheckCircle2, Package, Bell, X
} from 'lucide-react';
import NotificacaoModal from '../Configuracoes/NotificacaoModal';

const formatBRL = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const KpiCard = ({ label, value, sub, icon, theme, pulse }) => {
  const themes = {
    emerald: { bg: 'bg-emerald-600', iconColor: 'text-emerald-200', valueColor: 'text-white', labelColor: 'text-emerald-200', subColor: 'text-emerald-300' },
    orange: { bg: 'bg-orange-600', iconColor: 'text-orange-200', valueColor: 'text-white', labelColor: 'text-orange-200', subColor: 'text-orange-300' },
    red: { bg: 'bg-red-700', iconColor: 'text-red-200', valueColor: 'text-white', labelColor: 'text-red-200', subColor: 'text-red-300', pulse: true },
    blue: { bg: 'bg-blue-700', iconColor: 'text-blue-200', valueColor: 'text-white', labelColor: 'text-blue-200', subColor: 'text-blue-300' },
  };
  const t = themes[theme];

  return (
    <div className={`${t.bg} rounded-2xl p-5 relative overflow-hidden ${pulse ? 'animate-pulse' : ''} transition-all hover:scale-[1.02] hover:shadow-lg`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
      <div className={`${t.iconColor} mb-3`}>{icon}</div>
      <p className={`text-2xl font-black ${t.valueColor} tracking-tight`}>{value}</p>
      <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${t.labelColor}`}>{label}</p>
      <p className={`text-[11px] mt-2 ${t.subColor}`}>{sub}</p>
    </div>
  );
};

const ProgressBar = ({ pct, color = 'bg-emerald-500' }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
  </div>
);

const Home = () => {
  const [stats, setStats] = useState({
    vendasHoje: 0,
    comandasCount: 0,
    comandasValor: 0,
    estoqueCritico: 0,
    qtdVendasPagas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [temNotificacaoAtiva, setTemNotificacaoAtiva] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const checarNotificacoesAtivas = async () => {
    try {
      const res = await apiRequest('/api/notificacoes');
      let possuiNotificacoes = false;
      if (Array.isArray(res)) {
        possuiNotificacoes = res.length > 0;
      } else if (res?.content) {
        possuiNotificacoes = res.content.length > 0;
      }
      setTemNotificacaoAtiva(possuiNotificacoes);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [resVendas, resComandas, resEstoque] = await Promise.all([
        apiRequest('/api/vendas').catch(() => []),
        apiRequest('/api/comandas/abertas/resumo').catch(() => ({})),
        apiRequest('/api/estoque/baixo/count').catch(() => ({})),
      ]);

      const listaVendas = Array.isArray(resVendas) ? resVendas : [];
      const vendasPagas = listaVendas.filter((v) => v.status === 'PAGA');
      const totalSomaPaga = vendasPagas.reduce((acc, v) => acc + (v.valor_total || 0), 0);
      const qtdEstoqueCritico = resEstoque?.total || 0;

      setStats({
        vendasHoje: totalSomaPaga,
        comandasCount: resComandas?.quantidade || 0,
        comandasValor: resComandas?.valorTotal || 0,
        estoqueCritico: qtdEstoqueCritico,
        qtdVendasPagas: vendasPagas.length,
      });

      await checarNotificacoesAtivas();

      if (qtdEstoqueCritico > 0) {
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCloseModal = () => {
    setShowNotificacoes(false);
    checarNotificacoesAtivas();
  };

  const ticketMedio = stats.qtdVendasPagas > 0 ? stats.vendasHoje / stats.qtdVendasPagas : 0;
  const totalEsperado = stats.vendasHoje + stats.comandasValor;
  const pctCaixa = totalEsperado > 0 ? Math.round((stats.vendasHoje / totalEsperado) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-t-orange-500 border-gray-200" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Operação em tempo real</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotificacoes(true)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl relative hover:bg-orange-50 transition-all shadow-sm text-gray-600 hover:text-orange-600"
          >
            <Bell size={18} />
            {temNotificacaoAtiva && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />
            )}
          </button>
          
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
            <Clock size={14} className="text-orange-500" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Recebido" value={formatBRL(stats.vendasHoje)} sub={`${stats.qtdVendasPagas} finalizadas`} icon={<TrendingUp size={24} />} theme="emerald" />
        <KpiCard label="Mesas Ativas" value={stats.comandasCount} sub={`${formatBRL(stats.comandasValor)} aberto`} icon={<ShoppingCart size={24} />} theme="orange" />
        <KpiCard label="Estoque Crítico" value={stats.estoqueCritico} sub="Itens para reposição" icon={<Package size={24} />} theme="red" pulse={stats.estoqueCritico > 0} />
        <KpiCard label="Ticket Médio" value={formatBRL(ticketMedio)} sub="Média por venda" icon={<Receipt size={24} />} theme="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-orange-500/10 p-2 rounded-xl"><Wallet size={18} className="text-orange-600" /></div>
            <h2 className="text-base font-bold text-gray-900">Fluxo de Caixa Imediato</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Pendente nas mesas</p>
              <p className="text-2xl font-black text-orange-700">{formatBRL(stats.comandasValor)}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Efetivado (caixa)</p>
              <p className="text-2xl font-black text-emerald-700">{formatBRL(stats.vendasHoje)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Recebido vs. total esperado</span>
              <span className="font-bold text-emerald-600">{pctCaixa}%</span>
            </div>
            <ProgressBar pct={pctCaixa} color="bg-emerald-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-amber-500/10 p-2 rounded-xl"><AlertTriangle size={18} className="text-amber-600" /></div>
              <h2 className="text-base font-bold text-gray-900">Radar Operacional</h2>
            </div>
            
            <div className="space-y-3">
              {stats.estoqueCritico > 0 ? (
                <div onClick={() => setShowNotificacoes(true)} className="flex gap-3 items-start bg-red-50 border-l-4 border-red-500 rounded-r-xl p-3 cursor-pointer hover:bg-red-100 transition-all">
                  <Package size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-600">Atenção no estoque!</p>
                    <p className="text-xs text-gray-600 mt-0.5">{stats.estoqueCritico} itens precisam de reposição.</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-600">Estoque OK</p>
                    <p className="text-xs text-gray-600 mt-0.5">Todos os níveis normais.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Conectado: Ó Pai, Ó</p>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-sm border border-white/10">
          <div className="bg-white/20 p-2 rounded-lg">
            <Package size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black tracking-tight">Estoque Crítico Alerta!</h4>
            <p className="text-xs text-red-100 mt-0.5">Existem {stats.estoqueCritico} produtos abaixo do limite.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-red-200">
            <X size={16} />
          </button>
        </div>
      )}

      {showNotificacoes && (
        <NotificacaoModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Home;