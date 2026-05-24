import React, { useState } from 'react';
import { apiRequest } from '../../../services/auth';

const NovaComandaModal = ({ onClose, onSuccess, usuarioId }) => {
  const [nome, setNome] = useState('');
  const [mesa, setMesa] = useState('');

  const handleSalvar = async () => {
    if (!mesa) return alert("Número da mesa é obrigatório");
    try {
      await apiRequest('/api/comandas', 'POST', {
        nomeCliente: nome,
        numeroMesa: parseInt(mesa),
        status: 'ABERTA',
        usuarioId: usuarioId || null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao abrir comanda");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#111827] rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scaleIn transition-colors border border-gray-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-[#151D48] dark:text-white mb-6">
          Abrir Nova Comanda
        </h2>
        
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Nome do Cliente (Opcional)"
            className="w-full p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-[#E67E22] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all"
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
          <input
            type="number"
            placeholder="Número da Mesa"
            className="w-full p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl outline-none ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-[#E67E22] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all"
            value={mesa}
            onChange={e => setMesa(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 text-gray-400 dark:text-slate-500 font-bold hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSalvar} 
            className="flex-1 py-4 bg-[#151D48] dark:bg-[#E67E22] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            ABRIR MESA
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovaComandaModal;