import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/auth';
import { useAuth } from '../../../contexts/authContext';
import { X, User, FileText, DollarSign, Calendar, Hash } from 'lucide-react';

const EMPTY_FORM = {
  cliente: '',
  descricao: '',
  valor: '',
  dataVencimento: '',
  dataRecebimento: '',
  comandaId: '',
};

const ContaReceberModal = ({ conta, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(conta ? {
    cliente: conta.cliente || '',
    descricao: conta.descricao || '',
    valor: conta.valor || '',
    dataVencimento: conta.dataVencimento || '',
    dataRecebimento: conta.dataRecebimento || '',
    comandaId: conta.comandaId || '',
  } : EMPTY_FORM);
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!conta;

  useEffect(() => {
    apiRequest('/api/comandas')
      .then(data => setComandas((data || []).filter(c => c.status === 'ABERTA' || c.status === 'FINALIZADA')))
      .catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = async () => {
    if (!form.cliente) return alert('Cliente é obrigatório');
    if (!form.descricao) return alert('Descrição é obrigatória');
    if (!form.valor || isNaN(form.valor)) return alert('Valor inválido');
    if (!form.dataVencimento) return alert('Data de vencimento é obrigatória');

    setLoading(true);
    try {
      const payload = {
        usuarioId: user.id,
        cliente: form.cliente,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        dataVencimento: form.dataVencimento,
        dataRecebimento: form.dataRecebimento || null,
        dataCriacao: new Date().toISOString(),
        ...(form.comandaId ? { comandaId: parseInt(form.comandaId) } : {}),
      };

      if (isEditing) {
        await apiRequest(`/contas-receber/${conta.id}`, 'PUT', payload);
      } else {
        await apiRequest('/contas-receber', 'POST', payload);
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
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#151D48]">
            {isEditing ? 'Editar Conta' : 'Nova Conta a Receber'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 mb-8">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="cliente"
              placeholder="Nome do Cliente *"
              value={form.cliente}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>

          <div className="relative">
            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="descricao"
              placeholder="Descrição *"
              value={form.descricao}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
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
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="dataVencimento"
              type="date"
              value={form.dataVencimento}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="dataRecebimento"
              type="date"
              value={form.dataRecebimento}
              onChange={handleChange}
              placeholder="Data de Recebimento (opcional)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm"
            />
          </div>

          <div className="relative">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="comandaId"
              value={form.comandaId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-orange-400 text-sm appearance-none"
            >
              <option value="">Vincular a uma Comanda (opcional)</option>
              {comandas.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} — Mesa {c.numeroMesa} {c.nomeCliente ? `(${c.nomeCliente})` : ''}
                </option>
              ))}
            </select>
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

export default ContaReceberModal;