import React, { useState } from 'react';
import { apiRequest } from '../../../services/auth';

const NovaComandaModal = ({ onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [mesa, setMesa] = useState('');

  const handleSalvar = async () => {
    if (!mesa) return alert("Número da mesa é obrigatório");
    try {
      await apiRequest('/api/comandas', 'POST', { 
        nomeCliente: nome, 
        numeroMesa: parseInt(mesa), 
        status: 'ABERTA' 
      });
      onSuccess();
      onClose();
    } catch (err) { alert("Erro ao abrir comanda"); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scaleIn">
        <h2 className="text-2xl font-bold text-[#151D48] mb-6">Abrir Nova Comanda</h2>
        <div className="space-y-4 mb-8">
          <input 
            type="text" 
            placeholder="Nome do Cliente (Opcional)"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-500" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Número da Mesa"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-500" 
            value={mesa} 
            onChange={e => setMesa(e.target.value)} 
          />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold">CANCELAR</button>
          <button onClick={handleSalvar} className="flex-1 py-4 bg-[#151D48] text-white rounded-2xl font-bold">ABRIR MESA</button>
        </div>
      </div>
    </div>
  );
};

export default NovaComandaModal;