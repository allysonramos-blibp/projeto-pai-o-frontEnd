import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/auth';
import { Search, Plus, Trash2, Pencil, Phone, Mail, MapPin, Hash } from 'lucide-react';
import FornecedorModal from './components/FornecedorModal';

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/fornecedor?page=0&size=100');
      setFornecedores(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleDeletar = async (id) => {
    if (!window.confirm('Deseja excluir este fornecedor?')) return;
    try {
      await apiRequest(`/api/fornecedor/delete/${id}`, 'DELETE');
      await carregar();
    } catch (err) {
      alert('Erro ao excluir fornecedor.');
    }
  };

  const handleEditar = (fornecedor) => {
    setSelecionado(fornecedor);
    setShowModal(true);
  };

  const handleNovo = () => {
    setSelecionado(null);
    setShowModal(true);
  };

  const filtrados = fornecedores.filter(f =>
    f.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    f.cnpj?.includes(busca) ||
    f.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#151D48]">Fornecedores</h2>
        <p className="text-[#737791]">Gerencie seus fornecedores</p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4079ED]" size={20} />
        <input
          type="text"
          placeholder="Buscar fornecedor..."
          className="w-full pl-12 pr-4 py-4 bg-[#F0F3F9] rounded-full outline-none focus:ring-2 focus:ring-orange-500"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando fornecedores...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Nenhum fornecedor encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map(f => (
            <div
              key={f.id}
              className="bg-white p-6 rounded-[30px] shadow-sm border-l-8 border-l-[#E67E22] hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-[#151D48] text-base leading-tight pr-2">{f.nome}</h4>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEditar(f)}
                    className="text-orange-300 hover:text-orange-500 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletar(f.id)}
                    className="text-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {f.cnpj && (
                  <div className="flex items-center gap-2">
                    <Hash size={13} className="text-gray-400 shrink-0" />
                    <span><span className="font-semibold text-[#151D48]">CNPJ:</span> {f.cnpj}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  <span><span className="font-semibold text-[#151D48]">Telefone:</span> {f.telefone}</span>
                </div>
                {f.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span><span className="font-semibold text-[#151D48]">E-mail:</span> {f.email}</span>
                  </div>
                )}
                {f.endereco && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span><span className="font-semibold text-[#151D48]">Endereço:</span> {f.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleNovo}
        className="fixed bottom-10 right-10 bg-[#E67E22] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all z-40"
      >
        <Plus size={32} />
      </button>

      {showModal && (
        <FornecedorModal
          fornecedor={selecionado}
          onClose={() => { setShowModal(false); setSelecionado(null); }}
          onSuccess={carregar}
        />
      )}
    </div>
  );
};

export default Fornecedores;