import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { useAuth } from '../../contexts/authContext';
import { Search, Plus, User, Hash, Calendar } from 'lucide-react';
import NovaComandaModal from "./components/NovaComandaModal";
import DetalheComandaModal from "./components/DetalheComandaModal";

const Comandas = () => {
  const { user } = useAuth();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMesa, setFiltroMesa] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [limiteExibicao, setLimiteExibicao] = useState(6);

  const STATUS_THEME = {
    'ABERTA': { border: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
    'FINALIZADA': { border: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' },
    'CANCELADA': { border: 'border-l-red-500', badge: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
  };

  const carregarComandas = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/comandas');
      setComandas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarComandas(); }, []);

  const comandasFiltradas = comandas
    .filter(c =>
      c.numeroMesa?.toString().includes(filtroMesa) ||
      (c.nomeCliente && c.nomeCliente.toLowerCase().includes(filtroMesa.toLowerCase()))
    )
    .sort((a, b) => b.id - a.id);

  const formatarData = (dataStr) => {
    if (!dataStr) return null;
    const d = new Date(dataStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8 bg-[#F8F9FC] dark:bg-[#0F172A] min-h-screen transition-colors duration-200 animate-fadeIn print:hidden">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-[#151D48] dark:text-white tracking-tighter transition-colors">Comandas</h2>
        <p className="text-gray-400 dark:text-slate-400 font-medium transition-colors">Gerencie o consumo das mesas em tempo real</p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Buscar mesa ou cliente..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1E293B] rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#E67E22] outline-none text-[#151D48] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-medium transition-all"
          value={filtroMesa}
          onChange={(e) => setFiltroMesa(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center text-gray-400 dark:text-slate-500 py-10 font-bold animate-pulse col-span-full">Carregando comandas...</p>
        ) : comandasFiltradas.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-[32px] border border-dashed border-gray-300 dark:border-slate-700 transition-colors col-span-full">
            <p className="text-gray-400 dark:text-slate-500 font-bold">Nenhuma comanda encontrada.</p>
          </div>
        ) : (
          comandasFiltradas.slice(0, limiteExibicao).map((comanda) => {
            const tema = STATUS_THEME[comanda.status] || { border: 'border-l-gray-300 dark:border-l-slate-700', badge: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400' };
            return (
              <div
                key={comanda.id}
                onClick={() => setSelectedComanda(comanda)}
                className={`bg-white dark:bg-[#1E293B] p-6 rounded-[32px] shadow-sm border border-gray-50/50 dark:border-slate-800/40 border-l-8 ${tema.border} hover:shadow-md dark:hover:bg-slate-800/50 transition-all cursor-pointer active:scale-95 group`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-[#151D48] dark:text-white transition-colors">Comanda #{comanda.id}</h4>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-colors ${tema.badge}`}>
                    {comanda.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                    <span className="font-medium">{comanda.nomeCliente || 'Consumidor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                    <span className="font-medium">Mesa {comanda.numeroMesa}</span>
                  </div>
                  {comanda.dataAbertura && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 transition-colors">
                      <Calendar size={13} className="shrink-0" />
                      {formatarData(comanda.dataAbertura)}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex justify-between items-center transition-colors">
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-black tracking-wider">TOTAL</span>
                  <span className="font-bold text-[#151D48] dark:text-white transition-colors">R$ {(comanda.valorTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && comandasFiltradas.length > 6 && (
        <div className="flex justify-center mt-8 pb-10">
          {limiteExibicao >= comandasFiltradas.length ? (
            <button
              onClick={() => { 
                setLimiteExibicao(6);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gray-100 dark:bg-slate-800 px-6 py-3 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              Voltar para 6 comandas
            </button>
          ) : (
            <button
              onClick={() => setLimiteExibicao(comandasFiltradas.length)}
              className="bg-white dark:bg-[#1E293B] px-6 py-3 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 text-[#E67E22] font-black hover:bg-orange-50 dark:hover:bg-slate-800 transition-all text-xs uppercase tracking-wider"
            >
              Ver todas as {comandasFiltradas.length} comandas
            </button>
          )}
        </div>
      )}

      {/* BOTÃO ADICIONAR COM PALETA DO SISTEMA */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 bg-[#E67E22] hover:bg-[#d35400] text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-40 dark:shadow-none"
      >
        <Plus size={32} />
      </button>

      {showAddModal && (
        <NovaComandaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={carregarComandas}
          usuarioId={user?.id}
        />
      )}
      {selectedComanda && (
        <DetalheComandaModal
          comanda={selectedComanda}
          onClose={() => setSelectedComanda(null)}
          refresh={carregarComandas}
        />
      )}
    </div>
  );
};

export default Comandas;