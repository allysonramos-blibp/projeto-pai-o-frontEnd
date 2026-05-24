import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/auth';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  History, 
  Search, 
  ArrowUpCircle 
} from 'lucide-react';

const Estoque = () => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  
  const [novoItem, setNovoItem] = useState({
    nome: '', preco: '', unidade: '',categoria:'',fornecedorId:''
  });

  const carregarEstoque = async () => {
    try {
      setLoading(true);
      
      const data = await apiRequest('/api/produtos');
      setItens(data || []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstoque();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      
      await apiRequest('/api/produtos', 'POST', {
        nome: parseInt(novoItem.nome),
        preco: parseInt(novoItem.quantidade),
        unidade: parseInt(novoItem.minimo),
        categoria: parseInt(novoItem.categoria),
        fornecedorId: parseInt(novoItem.fornecedorId)
      });
      setShowModal(false);
      setNovoItem({ produtoId: '', preco: '', unidade: '',categoria:'',fornecedorId:'' });
      carregarEstoque();
    } catch (err) {
      alert("Erro ao cadastrar. Verifique se o ID do produto existe e se você tem permissão. " +"Erro: " + err.message);
    }
  };

  handleCadastrar();

  return (
    <div className="p-8 animate-fadeIn">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#151D48]">Gestão de Produtos</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d35400] transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} />
          Cadastrar Produto
        </button>
      </header>
    </div>
  );
};

export default Estoque;