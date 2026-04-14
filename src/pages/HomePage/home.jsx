import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    vendas: "R$ 0,00",
    comandas: 0,
    estoque: 0,
    ticket: "R$ 0,00"
  });
  const [contasPagar, setContasPagar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      
      const [resVendas, resComandas, resEstoque, resContas] = await Promise.all([
        apiRequest('/api/vendas/total-hoje'), 
        apiRequest('/api/comandas/abertas/count'),
        apiRequest('/api/estoque/baixo/count'),
        apiRequest('/api/contas/resumo') 
      ]);

      
      setStats({
        vendas: resVendas.total || "R$ 0,00",
        comandas: resComandas.quantidade || 0,
        estoque: resEstoque.total || 0,
        ticket: resVendas.ticketMedio || "R$ 0,00"
      });
      
  
      
      const listaContas = await apiRequest('/api/contas');
      setContasPagar(listaContas.slice(0, 5)); 

    } catch (err) {
      console.error("Erro ao sincronizar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  const cards = [
    { label: "Total Sales", value: stats.vendas, sub: "+8% que ontem", color: "bg-[#FFE2E5]", iconColor: "text-[#FA5A7D]", icon: TrendingUp },
    { label: "Comandas Abertas", value: stats.comandas, sub: "Atendimento ativo", color: "bg-[#FFF4DE]", iconColor: "text-[#FF947A]", icon: ShoppingCart },
    { label: "Estoque Baixo", value: stats.estoque, sub: "Itens críticos", color: "bg-[#DCFCE7]", iconColor: "text-[#3CD856]", icon: Package },
    { label: "Ticket Médio", value: stats.ticket, sub: "Por cliente", color: "bg-[#F3E8FF]", iconColor: "text-[#BF83FF]", icon: Users },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      <span className="ml-3 text-gray-500 font-medium">Sincronizando com a API...</span>
    </div>
  );

  return (
    <div className="animate-fadeIn">
    
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Dashboard</h2>
        <p className="text-[#737791]">Bem-vindo ao sistema de gestão Ó PAI, Ó</p>
      </header>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all`}>
            <div className="bg-white p-3 w-fit rounded-full mb-4 shadow-sm">
              <card.icon className={card.iconColor} size={24} />
            </div>
            <h3 className="text-2xl font-bold text-[#151D48]">{card.value}</h3>
            <p className="text-[#425166] font-semibold text-sm">{card.label}</p>
            <p className="text-[#4079ED] text-xs mt-1 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#151D48]">Contas a Pagar Próximas</h3>
            <button className="text-orange-600 text-sm font-bold hover:underline">Ver tudo</button>
          </div>
          
          <div className="space-y-4">
            {contasPagar.length > 0 ? contasPagar.map((conta, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <ArrowDownRight size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#151D48]">{conta.descricao}</p>
                    <p className="text-xs text-gray-400">Vence em: {conta.dataVencimento}</p>
                  </div>
                </div>
                <span className="font-bold text-red-500">R$ {conta.valor}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-10">Nenhuma conta pendente para os próximos dias.</p>
            )}
          </div>
        </div>

        
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#151D48] mb-6">Status do Sistema</h3>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="text-green-500 bg-green-50 p-3 rounded-full mb-2">
              <TrendingUp size={32} />
            </div>
            <p className="text-gray-500 font-medium">API Local conectada com sucesso</p>
            <p className="text-xs text-gray-400">Porta: 8080 | Status: Online</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;