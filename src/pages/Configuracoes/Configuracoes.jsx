import React, { useState } from 'react';
import { Bell, Palette, Database, Moon, Check, RefreshCw } from 'lucide-react';
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
        <h3 className="text-2xl font-black text-[var(--texto-titulo)] transition-colors duration-200">
          Configurações do Sistema
        </h3>
        <p className="text-sm text-[var(--texto-corpo)] transition-colors duration-200 mt-1">
          Gerencie a identidade visual, regras de negócio e segurança dos dados.
        </p>
      </div>

      <hr className="border-[var(--borda)] transition-colors duration-200" />

      <div className="grid grid-cols-1 gap-6">
        
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--borda)] space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Palette size={22} /></div>
            <div>
              <h4 className="font-bold text-[var(--texto-titulo)] transition-colors duration-200">Interface e Aparência</h4>
              <p className="text-sm text-[var(--texto-corpo)] transition-colors duration-200">Altere as cores predominantes do painel administrativo.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => mudarTema('orange')}
              className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all duration-200 ${
                tema === 'orange' 
                  ? 'border-orange-500 bg-orange-50/50 text-gray-800' 
                  : 'border-[var(--borda)] bg-[var(--bg-principal)] hover:opacity-80 text-[var(--texto-titulo)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-600" />
                <div>
                  <p className="text-sm font-bold">Padrão Corporativo</p>
                  <p className="text-xs text-gray-400">Identidade Laranja Ó Pai, Ó</p>
                </div>
              </div>
              {tema === 'orange' && <Check size={18} className="text-orange-600" />}
            </button>

            <button 
              onClick={() => mudarTema('dark')}
              className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all duration-200 ${
                tema === 'dark' 
                  ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                  : 'border-[var(--borda)] bg-[var(--bg-principal)] hover:opacity-80 text-[var(--texto-titulo)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-[10px]"><Moon size={12}/></div>
                <div>
                  <p className="text-sm font-bold">Modo Escuro (Pro)</p>
                  <p className="text-xs text-gray-400">Visual escuro para ambientes noturnos</p>
                </div>
              </div>
              {tema === 'dark' && <Check size={18} className="text-indigo-400" />}
            </button>
          </div>
        </div>

        
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--borda)] space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Bell size={22} /></div>
            <div>
              <h4 className="font-bold text-[var(--texto-titulo)] transition-colors duration-200">Regras de Alerta</h4>
              <p className="text-sm text-[var(--texto-corpo)] transition-colors duration-200">Defina os gatilhos matemáticos que fazem o painel avisar sobre falhas.</p>
            </div>
          </div>

          <form onSubmit={salvarLimiteEstoque} className="bg-[var(--bg-principal)] border border-[var(--borda)] rounded-xl p-4 space-y-4 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-sm font-bold text-[var(--texto-titulo)] block transition-colors duration-200">Gatilho de Estoque Crítico</label>
                <span className="text-xs text-[var(--texto-corpo)] transition-colors duration-200">A partir de quantas unidades restantes o produto vira um alerta?</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={limiteEstoque}
                  onChange={(e) => setLimiteEstoque(Number(e.target.value))}
                  className="w-20 p-2 text-center font-black bg-[var(--bg-card)] text-[var(--texto-titulo)] border border-[var(--borda)] rounded-xl focus:outline-none focus:border-orange-500 transition-colors duration-200"
                />
                <span className="text-xs text-[var(--texto-corpo)] font-bold transition-colors duration-200">unidades</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--borda)] transition-colors duration-200">
              <button 
                type="submit"
                disabled={salvandoNotif}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {salvandoNotif && <RefreshCw size={12} className="animate-spin" />}
                Salvar Regra de Negócio
              </button>
            </div>
          </form>
        </div>

        {/* Backup */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--borda)] space-y-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Database size={22} /></div>
            <div>
              <h4 className="font-bold text-[var(--texto-titulo)] transition-colors duration-200">Backup de Dados</h4>
              <p className="text-sm text-[var(--texto-corpo)] transition-colors duration-200">Baixe cópias de segurança das tabelas operacionais.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              onClick={() => ejecutarBackup('vendas')}
              disabled={exportando}
              className="px-4 py-3 bg-[var(--bg-principal)] hover:opacity-80 text-[var(--texto-titulo)] border border-[var(--borda)] font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              Exportar Vendas (.CSV)
            </button>
            <button 
              onClick={() => ejecutarBackup('estoque')}
              disabled={exportando}
              className="px-4 py-3 bg-[var(--bg-principal)] hover:opacity-80 text-[var(--texto-titulo)] border border-[var(--borda)] font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
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