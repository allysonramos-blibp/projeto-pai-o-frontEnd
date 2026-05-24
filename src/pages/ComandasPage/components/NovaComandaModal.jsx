import React, { useState } from 'react';
import { apiRequest } from '../../../services/auth';
import { X, User, Hash } from 'lucide-react';

const NovaComandaModal = ({ onClose, onSuccess, usuarioId }) => {
  const [nome, setNome] = useState('');
  const [mesa, setMesa] = useState('');

  const handleSalvar = async () => {
    if (!mesa) return alert('Número da mesa é obrigatório');
    try {
      await apiRequest('/api/comandas', 'POST', {
        nomeCliente: nome,
        numeroMesa: parseInt(mesa),
        status: 'ABERTA',
        usuarioId: usuarioId || null,
      });
      onSuccess();
      onClose();
    } catch {
      alert('Erro ao abrir comanda');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100">

        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Abrir Nova Comanda</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        
        <div className="space-y-3 mb-6">
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nome do Cliente (Opcional)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>
          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              placeholder="Número da Mesa"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              value={mesa}
              onChange={e => setMesa(e.target.value)}
            />
          </div>
        </div>

        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-400 font-semibold hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-orange-100"
          >
            Abrir Mesa
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovaComandaModal;