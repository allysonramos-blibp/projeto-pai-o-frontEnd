import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/auth';
import { useAuth } from '../../../contexts/authContext';
import { X, FileText, DollarSign, Calendar, Tag, Building2 } from 'lucide-react';

const EMPTY_FORM = {
  descricao: '',
  valor: '',
  dataVencimento: '',
  categoria: '',
  fornecedorId: '',
};

const ContaModal = ({ conta, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(conta ? {
    descricao: conta.descricao || '',
    valor: conta.valor || '',
    dataVencimento: conta.dataVencimento || '',
    categoria: conta.categoria || '',
    fornecedorId: conta.fornecedorId || '',
  } : EMPTY_FORM);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!conta;

  useEffect(() => {
    apiRequest('/api/fornecedor?page=0&size=100')
      .then(data => setFornecedores(data || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = async () => {
    if (!form.descricao) return alert('Descrição é obrigatória');
    if (!form.valor || isNaN(form.valor)) return alert('Valor inválido');
    if (!form.dataVencimento) return alert('Data de vencimento é obrigatória');
    if (!form.categoria) return alert('Categoria é obrigatória');
    if (!form.fornecedorId) return alert('Fornecedor é obrigatório');

    setLoading(true);
    try {
      const payload = {
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        dataVencimento: form.dataVencimento,
        categoria: form.categoria,
        fornecedorId: parseInt(form.fornecedorId),
        usuarioId: user.id,
      };

      if (isEditing) {
        await apiRequest(`/api/contas/${conta.id}`, 'PUT', payload);
      } else {
        await apiRequest('/api/contas', 'POST', payload);
      }
      await onSuccess();
      onClose();
    } catch (err) {
      alert(`Erro ao ${isEditing ? 'editar' : 'cadastrar'} conta.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-[var(--borda)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--texto-titulo)]">
            {isEditing ? 'Editar Conta' : 'Nova Conta a Pagar'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 mb-8">
          <div className="relative">
            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="descricao"
              placeholder="Descrição *"
              value={form.descricao}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-principal)] rounded-2xl outline-none border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] text-sm text-[var(--texto-titulo)]"
            />
          </div>

          <div className="relative">
            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="valor"
              type="number"
              step="0.01"
              placeholder="Valor *"
              value={form.valor}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-principal)] rounded-2xl outline-none border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] text-sm text-[var(--texto-titulo)]"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="dataVencimento"
              type="date"
              value={form.dataVencimento}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-principal)] rounded-2xl outline-none border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] text-sm text-[var(--texto-titulo)]"
            />
          </div>

          <div className="relative">
            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="categoria"
              placeholder="Categoria *"
              value={form.categoria}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-principal)] rounded-2xl outline-none border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] text-sm text-[var(--texto-titulo)]"
            />
          </div>

          <div className="relative">
            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="fornecedorId"
              value={form.fornecedorId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-principal)] rounded-2xl outline-none border border-[var(--borda)] focus:ring-2 focus:ring-[#E67E22] text-sm text-[var(--texto-titulo)] appearance-none"
            >
              <option value="">Selecionar Fornecedor *</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-bold rounded-2xl hover:bg-[var(--bg-principal)]"
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

export default ContaModal;