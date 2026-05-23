import { useEffect, useState } from "react";
import { apiRequest } from "../../services/auth";
import { X, Check, BellOff } from "lucide-react";

const NotificacaoModal = ({ onClose }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/notificacoes");
      if (Array.isArray(res)) setNotificacoes(res);
      else if (res?.content) setNotificacoes(res.content);
      else setNotificacoes([]);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarNotificacoes(); }, []);

  const handleMarcarComoLida = async (id) => {
    try {
      await apiRequest(`/api/notificacoes/${id}/ler`, "PATCH");
      carregarNotificacoes();
    } catch (err) {
      alert("Erro ao atualizar notificação.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-md bg-white h-screen p-6 shadow-2xl flex flex-col">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-black text-[#151D48] uppercase italic">Alertas do Sistema</h3>
            <p className="text-sm text-gray-400 font-medium">Estoque crítico e avisos</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <p className="text-center text-gray-400 py-10 font-bold animate-pulse">Buscando alertas...</p>
          ) : notificacoes.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-3">
              <BellOff size={48} className="mx-auto text-green-500 opacity-50" />
              <p className="font-bold text-green-600">Tudo sob controle!</p>
              <p className="text-sm">Nenhum produto atingiu o limite mínimo.</p>
            </div>
          ) : (
            notificacoes.map((notif) => (
              <div key={notif.id} className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex justify-between items-start gap-4 shadow-sm">
                <div className="flex-1">
                  <span className="text-sm font-bold text-[#E67E22] uppercase tracking-wider block mb-1">{notif.titulo}</span>
                  <p className="text-[#151D48] text-sm font-medium leading-relaxed">{notif.mensagem}</p>
                </div>
                <button
                  onClick={() => handleMarcarComoLida(notif.id)}
                  className="bg-white border border-orange-200 text-[#E67E22] p-2 rounded-xl hover:bg-[#E67E22] hover:text-white transition-all shadow-sm"
                >
                  <Check size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificacaoModal;