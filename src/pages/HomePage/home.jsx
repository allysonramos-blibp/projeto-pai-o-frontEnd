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

const AlertaPopup = ({ isOpen, onClose, titulo, mensagem }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
        </div>
        <h3 className="text-xl font-black text-gray-900 text-center">{titulo}</h3>
        <p className="text-gray-500 text-center mt-2 mb-6">{mensagem}</p>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

const ProgressBar = ({ pct, color = 'bg-emerald-500' }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
  </div>
);

const Home = () => {
  const [stats, setStats] = useState({ vendasHoje: 0, comandasCount: 0, comandasValor: 0, estoqueCritico: 0, qtdVendasPagas: 0 });
  const [loading, setLoading] = useState(true);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showModalAlerta, setShowModalAlerta] = useState(false);
  const [temNotificacaoAtiva, setTemNotificacaoAtiva] = useState(false);

  const checarNotificacoesAtivas = async () => {
    try {
      const res = await apiRequest('/api/notificacoes');
      let possuiNotificacoes = Array.isArray(res) ? res.length > 0 : res?.content?.length > 0;
      setTemNotificacaoAtiva(possuiNotificacoes);
    } catch (err) { console.error(err); }
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
      const qtdEstoqueCritico = resEstoque?.total || 0;

      setStats({
        vendasHoje: vendasPagas.reduce((acc, v) => acc + (v.valor_total || 0), 0),
        comandasCount: resComandas?.quantidade || 0,
        comandasValor: resComandas?.valorTotal || 0,
        estoqueCritico: qtdEstoqueCritico,
        qtdVendasPagas: vendasPagas.length,
      });

      await checarNotificacoesAtivas();

      if (qtdEstoqueCritico > 0) {
        setShowModalAlerta(true);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleCloseModal = () => {
    setShowNotificacoes(false);
    checarNotificacoesAtivas();
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-t-orange-500 border-gray-200" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Operação em tempo real</p>
        </div>
        <button onClick={() => setShowNotificacoes(true)} className="p-2.5 bg-white border border-gray-200 rounded-xl relative hover:bg-orange-50 shadow-sm text-gray-600 hover:text-orange-600">
          <Bell size={18} />
          {temNotificacaoAtiva && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Recebido" value={formatBRL(stats.vendasHoje)} sub={`${stats.qtdVendasPagas} finalizadas`} icon={<TrendingUp size={24} />} theme="emerald" />
        <KpiCard label="Mesas Ativas" value={stats.comandasCount} sub={`${formatBRL(stats.comandasValor)} aberto`} icon={<ShoppingCart size={24} />} theme="orange" />
        <KpiCard label="Estoque Crítico" value={stats.estoqueCritico} sub="Itens para reposição" icon={<Package size={24} />} theme="red" pulse={stats.estoqueCritico > 0} />
        <KpiCard label="Ticket Médio" value={formatBRL(stats.qtdVendasPagas > 0 ? stats.vendasHoje / stats.qtdVendasPagas : 0)} sub="Por venda" icon={<Receipt size={24} />} theme="blue" />
      </div>

      <AlertaPopup 
        isOpen={showModalAlerta} 
        onClose={() => setShowModalAlerta(false)} 
        titulo="Atenção no Estoque!" 
        mensagem={`Existem ${stats.estoqueCritico} produtos abaixo do limite mínimo. Verifique o radar operacional.`}
      />

      {showNotificacoes && <NotificacaoModal onClose={handleCloseModal} />}
    </div>
  );
};

export default Home;