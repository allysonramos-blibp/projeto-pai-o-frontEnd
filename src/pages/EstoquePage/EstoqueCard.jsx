import { AlertTriangle, Pencil, Trash2 } from "lucide-react";

const STATUS_CFG = {
  "NORMAL":   "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "BAIXO":    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  "CRÍTICO":  "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "ESGOTADO": "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export const calcularStatus = (q, m) => {
  const qtd = Number(q) || 0;
  const min = Number(m) || 0;
  if (qtd <= 0) return "ESGOTADO";
  if (qtd <= min) return "CRÍTICO";
  if (qtd <= min * 1.5) return "BAIXO";
  return "NORMAL";
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit transition-colors ${STATUS_CFG[status] || "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"}`}>
    {(status === "BAIXO" || status === "CRÍTICO") && <AlertTriangle size={10} />}
    {status}
  </span>
);

const EstoqueCard = ({ item, onEditar, onExcluir }) => (
  <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-6 rounded-[32px] shadow-sm border border-gray-50 dark:border-slate-800/40 hover:shadow-md dark:hover:bg-slate-800/50 transition-all group">
    <div className="flex-1 text-left">
      <span className="font-bold text-[#151D48] dark:text-white text-xl uppercase tracking-tight transition-colors">
        {item.nomeProduto}
      </span>
      <div className="flex gap-6 text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-wider mt-1 transition-colors">
        <span>
          Qtd: <span className={item.quantidade <= item.minimo ? "text-red-500 dark:text-red-400" : "text-[#E67E22] dark:text-orange-400"}>
            {item.quantidade}
          </span>
        </span>
        <span>Mín: {item.minimo}</span>
        {item.fornecedor && (
          <span>
            Fornecedor: <span className="text-[#151D48] dark:text-slate-300 transition-colors">{item.fornecedor}</span>
          </span>
        )}
      </div>
    </div>

    <div className="text-2xl font-black text-[#151D48] dark:text-white px-8 italic transition-colors">
      R$ {Number(item.preco ?? 0).toFixed(2).replace(".", ",")}
    </div>

    <div className="min-w-[120px] flex justify-center">
      <StatusBadge status={item.status} />
    </div>

    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEditar(item)}
        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="Editar"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => onExcluir(item)}
        className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default EstoqueCard;