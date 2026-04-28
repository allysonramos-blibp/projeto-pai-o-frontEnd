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
    'ABERTA': { border: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-600' },
    'FINALIZADA': { border: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-600' },
    'CANCELADA': { border: 'border-l-red-500', badge: 'bg-red-50 text-red-600' },
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
    <div className="p-8 animate-fadeIn print:hidden">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Comandas</h2>
        <p className="text-[#737791]">Gerencie o consumo das mesas em tempo real</p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4079ED]" size={20} />
        <input
          type="text"
          placeholder="Buscar mesa ou cliente..."
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-full outline-none focus:ring-2 focus:ring-orange-500"
          value={filtroMesa}
          onChange={(e) => setFiltroMesa(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-400">Carregando comandas...</p>
        ) : (
          comandasFiltradas.slice(0, limiteExibicao).map((comanda) => {
            const tema = STATUS_THEME[comanda.status] || { border: 'border-l-gray-300', badge: 'bg-gray-100' };
            return (
              <div
                key={comanda.id}
                onClick={() => setSelectedComanda(comanda)}
                className={`bg-white p-6 rounded-[30px] shadow-sm border-l-8 ${tema.border} hover:shadow-md transition-all cursor-pointer active:scale-95`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-[#151D48]">Comanda #{comanda.id}</h4>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${tema.badge}`}>
                    {comanda.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 shrink-0" />
                    {comanda.nomeCliente || 'Consumidor'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400 shrink-0" />
                    Mesa {comanda.numeroMesa}
                  </div>
                  {comanda.dataAbertura && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={13} className="shrink-0" />
                      {formatarData(comanda.dataAbertura)}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-semibold">TOTAL</span>
                  <span className="font-bold text-[#151D48]">R$ {(comanda.valorTotal || 0).toFixed(2)}</span>
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
              className="bg-gray-100 px-6 py-2 rounded-full border border-gray-200 text-gray-500 font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              Voltar para 6 comandas

            </button>
          ) : (
            <button
              onClick={() => setLimiteExibicao(comandasFiltradas.length)}
              className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 text-[#4079ED] font-bold hover:bg-blue-50 transition-all"
            >
              Ver todas as {comandasFiltradas.length} comandas
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 bg-[#E67E22] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all z-40"
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