import React, { useState } from 'react';
import { apiRequest } from '../../../services/auth';
import { X, Building2, Phone, Mail, MapPin, Hash } from 'lucide-react';

const EMPTY_FORM = { nome: '', cnpj: '', telefone: '', email: '', endereco: '' };

const FornecedorModal = ({ fornecedor, onClose, onSuccess }) => {
  const [form, setForm] = useState(fornecedor ? {
    nome: fornecedor.nome || '',
    cnpj: fornecedor.cnpj || '',
    telefone: fornecedor.telefone || '',
    email: fornecedor.email || '',
    endereco: fornecedor.endereco || '',
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const isEditing = !!fornecedor;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = async () => {
    if (!form.nome) return alert('Nome é obrigatório');
    if (!form.telefone) return alert('Telefone é obrigatório');
    setLoading(true);
    try {
      if (isEditing) {
        await apiRequest(`/api/fornecedor/${fornecedor.id}`, 'PATCH', form);
      } else {
        await apiRequest('/api/fornecedor', 'POST', form);
      }
      await onSuccess();
      onClose();
    } catch (err) {
      alert(`Erro ao ${isEditing ? 'editar' : 'cadastrar'} fornecedor.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#151D48]">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 mb-8">
          <div className="relative">
            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="nome"
              placeholder="Nome do Fornecedor *"
              value={form.nome}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="relative">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="cnpj"
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="telefone"
              placeholder="Telefone *"
              value={form.telefone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="endereco"
              placeholder="Endereço"
              value={form.endereco}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-bold rounded-2xl hover:bg-gray-50"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="flex-1 py-4 bg-[#151D48] text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {loading ? 'SALVANDO...' : isEditing ? 'SALVAR' : 'CADASTRAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FornecedorModal;