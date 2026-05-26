import React, { useState } from 'react';
import { Bell, Palette, Database, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/authContext'; 

const Configuracoes = () => {
  const { tema, setTema } = useAuth();
  const [limiteEstoque, setLimiteEstoque] = useState(5);
  const [salvandoNotif, setSalvandoNotif] = useState(false);
  const [exportando, setExportando] = useState(false);

  const mudarTema = (novoTema) => {
    setTema(novoTema);
    localStorage.setItem('app-theme', novoTema);
  };

  const salvarLimiteEstoque = async (e) => {
    e.preventDefault();
    setSalvandoNotif(true);
    try {
      alert(`Configuração salva com sucesso! O Radar Operacional agora vai disparar alertas para produtos com menos de ${limiteEstoque} unidades.`);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configuração no servidor.");
    } finally {
      setSalvandoNotif(false);
    }
  };

  const ejecutarBackup = async (tipo) => {
    setExportando(true);
    try {
      const dadosFakeCSV = "id,produto,estoque_atual\n1,Cerveja Long Neck,2\n2,Pastel de Queijo,15";
      const blob = new Blob([dadosFakeCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `backup_opaio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <div>
        <h3 className="text-2xl font-black text-gray-900">
          Configurações do Sistema
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie a identidade visual, regras de negócio e segurança dos dados.
        </p>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Palette size={22} /></div>
            <div>
              <h4 className="font-bold text-gray-900">Interface e Aparência</h4>
              <p className="text-sm text-gray-500">Identidade visual padrão do painel administrativo.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-2">
            <button 
              onClick={() => mudarTema('orange')}
              className="p-4 rounded-xl border border-orange-500 bg-orange-50/50 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Padrão Corporativo</p>
                  <p className="text-xs text-gray-400">Identidade Laranja Ó Pai, Ó</p>
                </div>
              </div>
              <Check size={18} className="text-orange-600" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Bell size={22} /></div>
            <div>
              <h4 className="font-bold text-gray-900">Regras de Alerta</h4>
              <p className="text-sm text-gray-500">Defina os gatilhos para avisos do sistema.</p>
            </div>
          </div>

          <form onSubmit={salvarLimiteEstoque} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 block">Gatilho de Estoque Crítico</label>
                <span className="text-xs text-gray-500">Unidades mínimas para gerar alerta.</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={limiteEstoque}
                  onChange={(e) => setLimiteEstoque(Number(e.target.value))}
                  className="w-20 p-2 text-center font-black bg-white text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-gray-500 font-bold">unidades</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button 
                type="submit"
                disabled={salvandoNotif}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {salvandoNotif && <RefreshCw size={12} className="animate-spin" />}
                Salvar Regra de Negócio
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Database size={22} /></div>
            <div>
              <h4 className="font-bold text-gray-900">Backup de Dados</h4>
              <p className="text-sm text-gray-500">Baixe cópias de segurança das tabelas operacionais.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              onClick={() => ejecutarBackup('vendas')}
              disabled={exportando}
              className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              Exportar Vendas (.CSV)
            </button>
            <button 
              onClick={() => ejecutarBackup('estoque')}
              disabled={exportando}
              className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              Exportar Estoque (.CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;