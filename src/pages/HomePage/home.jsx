import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { 
  TrendingUp, ShoppingCart, AlertTriangle, 
  Clock, Beer, Receipt, Wallet
} from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    vendasHoje: 0,
    comandasCount: 0,
    comandasValor: 0,
    estoqueCritico: 0,
    qtdVendasPagas: 0
  });
  const [loading, setLoading] = useState(true);

  const formatBRL = (val) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [resVendas, resComandas, resEstoque] = await Promise.all([
          apiRequest('/api/vendas'),
          apiRequest('/api/comandas/abertas/resumo'),
          apiRequest('/api/estoque/baixo/count')
        ]);

        const listaVendas = Array.isArray(resVendas) ? resVendas : [];
        const vendasPagas = listaVendas.filter(v => v.status === 'PAGA');

        const totalSomaPaga = vendasPagas.reduce((acc, v) => {
          return acc + (v.valor_total || 0); 
        }, 0);

        setStats({
          vendasHoje: totalSomaPaga,
          comandasCount: resComandas?.quantidade || 0,
          comandasValor: resComandas?.valorTotal || 0,
          estoqueCritico: resEstoque?.total || 0,
          qtdVendasPagas: vendasPagas.length
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const ticketMedioValue = stats.qtdVendasPagas > 0 
    ? stats.vendasHoje / stats.qtdVendasPagas 
    : 0;
    
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-600" />
    </div>
  );

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-[#151D48] tracking-tight">Dashboard</h2>
          <p className="text-[#737791] font-medium">Operação em tempo real</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
          <Clock size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-[#151D48]">{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Recebido" 
          value={formatBRL(stats.vendasHoje)} 
          sub={`${stats.qtdVendasPagas} vendas finalizadas`}
          icon={<TrendingUp size={22} />} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          label="Mesas Ativas" 
          value={stats.comandasCount} 
          sub={`Total em aberto: ${formatBRL(stats.comandasValor)}`}
          icon={<ShoppingCart size={22} />} 
          color="bg-orange-50 text-orange-600"
        />
        <StatCard 
          label="Estoque Crítico" 
          value={stats.estoqueCritico} 
          sub="Itens para Reposição"
          icon={<Beer size={22} />} 
          color="bg-red-50 text-red-600"
          alert={stats.estoqueCritico > 0}
        />
        <StatCard 
          label="Ticket Médio" 
          value={formatBRL(ticketMedioValue)} 
          sub="Média de gasto por mesa"
          icon={<Receipt size={22} />} 
          color="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Wallet size={20}/></div>
            <h3 className="text-xl font-bold text-[#151D48]">Fluxo de Caixa Imediato</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-gray-50 rounded-2xl bg-gray-50/50">
              <p className="text-xs text-[#737791] font-bold uppercase mb-2">Pendente nas Mesas</p>
              <p className="text-2xl font-black text-orange-600">{formatBRL(stats.comandasValor)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Soma de todas as comandas abertas</p>
            </div>
            <div className="p-6 border border-gray-50 rounded-2xl bg-emerald-50/30">
              <p className="text-xs text-[#737791] font-bold uppercase mb-2">Efetivado (Caixa)</p>
              <p className="text-2xl font-black text-emerald-600">{formatBRL(stats.vendasHoje)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total de vendas com status PAGA</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[32px] text-[#737791] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 text-orange-500">
              <AlertTriangle />
              <h3 className="text-lg font-bold italic text-[#737791]">Radar Operacional</h3>
            </div>
            <div className="space-y-4">
              {stats.estoqueCritico > 0 ? (
                <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-2xl">
                  <p className="text-sm font-bold">Atenção no Estoque!</p>
                  <p className="text-xs text-red-100 mt-1">Há {stats.estoqueCritico} itens precisando de reposição.</p>
                </div>
              ) : (
                <div className="bg-green-500/20 border border-green-500/40 p-4 rounded-2xl">
                  <p className="text-sm font-bold">Tudo sob controle</p>
                  <p className="text-xs text-black-100 mt-1">Níveis de estoque estão normais.</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-blue-300 font-bold mt-4 uppercase">Conectado: Ó Pai, Ó - Backend</p>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, color, alert }) => (
  <div className={`bg-white p-6 rounded-[32px] shadow-sm transition-all border-2 ${alert ? 'border-red-500 animate-pulse' : 'border-transparent'} hover:shadow-md`}>
    <div className={`p-4 w-fit rounded-2xl mb-4 ${color}`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-[#151D48] tracking-tight">{value}</h3>
    <p className="text-[#737791] text-sm font-bold">{label}</p>
    <p className="text-blue-500 text-[10px] font-black mt-2 uppercase tracking-tighter">{sub}</p>
  </div>
);

export default Home;