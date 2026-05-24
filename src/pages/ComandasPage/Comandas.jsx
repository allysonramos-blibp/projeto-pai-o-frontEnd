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
    'ABERTA':     { border: 'border-l-blue-500',  badge: 'bg-blue-50 text-blue-600' },
    'FINALIZADA': { border: 'border-l-teal-500',  badge: 'bg-teal-50 text-teal-600' },
    'CANCELADA':  { border: 'border-l-red-500',   badge: 'bg-red-50 text-red-600' },
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
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-fadeIn">

      
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Comandas</h2>
        <p className="text-gray-400 text-sm mt-0.5">Gerencie o consumo das mesas em tempo real</p>
      </header>

      
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar mesa ou cliente..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none text-gray-800 placeholder-gray-400 text-sm font-medium transition-all"
          value={filtroMesa}
          onChange={(e) => setFiltroMesa(e.target.value)}
        />
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="col-span-full text-center text-gray-400 py-10 font-semibold animate-pulse">
            Carregando comandas...
          </p>
        ) : comandasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-semibold">Nenhuma comanda encontrada.</p>
          </div>
        ) : (
          comandasFiltradas.slice(0, limiteExibicao).map((comanda) => {
            const tema = STATUS_THEME[comanda.status] || {
              border: 'border-l-gray-300',
              badge: 'bg-gray-100 text-gray-500',
            };
            return (
              <div
                key={comanda.id}
                onClick={() => setSelectedComanda(comanda)}
                className={`
                  bg-white p-5 rounded-2xl shadow-sm border border-gray-100
                  border-l-4 ${tema.border}
                  hover:shadow-md hover:-translate-y-0.5
                  transition-all cursor-pointer active:scale-95
                `}
              >
                
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-gray-800 text-sm">Comanda #{comanda.id}</h4>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${tema.badge}`}>
                    {comanda.status}
                  </span>
                </div>

                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium truncate">{comanda.nomeCliente || 'Consumidor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium">Mesa {comanda.numeroMesa}</span>
                  </div>
                  {comanda.dataAbertura && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} className="shrink-0" />
                      {formatarData(comanda.dataAbertura)}
                    </div>
                  )}
                </div>

                
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total</span>
                  <span className="font-black text-gray-800 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comanda.valorTotal || 0)}
                  </span>
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
              onClick={() => { setLimiteExibicao(6); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-gray-100 px-6 py-2.5 rounded-full border border-gray-200 text-gray-500 font-bold hover:bg-gray-200 transition-all text-xs uppercase tracking-wider"
            >
              Voltar para 6 comandas
            </button>
          ) : (
            <button
              onClick={() => setLimiteExibicao(comandasFiltradas.length)}
              className="bg-white px-6 py-2.5 rounded-full shadow-sm border border-gray-200 text-orange-500 font-black hover:bg-orange-50 transition-all text-xs uppercase tracking-wider"
            >
              Ver todas as {comandasFiltradas.length} comandas
            </button>
          )}
        </div>
      )}

      
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
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