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

const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm text-gray-700 transition-all";

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
    } catch {
      alert(`Erro ao ${isEditing ? 'editar' : 'cadastrar'} conta.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-800">
            {isEditing ? 'Editar Conta' : 'Nova Conta a Pagar'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="relative">
            <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="descricao" placeholder="Descrição *" value={form.descricao} onChange={handleChange} className={inputClass} />
          </div>
          <div className="relative">
            <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="valor" type="number" step="0.01" placeholder="Valor *" value={form.valor} onChange={handleChange} className={inputClass} />
          </div>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="dataVencimento" type="date" value={form.dataVencimento} onChange={handleChange} className={inputClass} />
          </div>
          <div className="relative">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="categoria" placeholder="Categoria *" value={form.categoria} onChange={handleChange} className={inputClass} />
          </div>
          <div className="relative">
            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select name="fornecedorId" value={form.fornecedorId} onChange={handleChange} className={`${inputClass} appearance-none`}>
              <option value="">Selecionar Fornecedor *</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-semibold hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={loading} className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors">
            {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContaModal;