import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { Search, Calendar, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

const ContasPagar = () => {
  const [contas, setContas] = useState([]);
  const [resumo, setResumo] = useState({ TotalPago: 0, TotalVencido: 0 });
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [lista, resumoFinanceiro] = await Promise.all([
        apiRequest('/api/contas'),
        apiRequest('/api/contas/resumo')
      ]);
      setContas(lista || []);
      setResumo(resumoFinanceiro || { TotalPago: 0, TotalVencido: 0 });
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  
  const totalPendente = contas
    .filter(c => c.status !== 'PAGA')
    .reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="p-8 animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Contas a Pagar</h2>
        <p className="text-[#737791]">Gerencie suas contas a pagar</p>
      </header>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-[#4079ED] text-sm font-medium mb-2">Total Pendente</p>
          <h3 className="text-2xl font-bold text-[#151D48]">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-[#4079ED] text-sm font-medium mb-2">Total Vencido</p>
          <h3 className="text-2xl font-bold text-[#151D48]">R$ {resumo.TotalVencido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 text-center">
          <p className="text-[#4079ED] text-sm font-medium mb-2">Contas Pagas</p>
          <h3 className="text-2xl font-bold text-[#151D48]">R$ {resumo.TotalPago?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar Contas"
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-[#737791]"
        />
      </div>

      
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">Carregando contas...</p>
        ) : contas.map((conta) => (
          <div key={conta.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 flex justify-between items-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-[#151D48]">
                <Wallet size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#151D48] text-lg">{conta.descricao}</h4>
                <p className="text-sm text-[#4079ED]">
                  Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#151D48]">
                R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className={`text-xs font-bold uppercase ${conta.status === 'PAGA' ? 'text-green-500' : 'text-orange-500'}`}>
                {conta.status === 'PAGA' ? 'Paga' : 'Aberta'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContasPagar;