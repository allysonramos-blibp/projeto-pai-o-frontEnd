import { AlertTriangle, Pencil, Trash2 } from "lucide-react";

const STATUS_CFG = {
  "NORMAL":   "bg-green-100 text-green-600",
  "BAIXO":    "bg-yellow-100 text-yellow-600",
  "CRÍTICO":  "bg-orange-100 text-orange-600",
  "ESGOTADO": "bg-red-100 text-red-600",
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
  <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit ${STATUS_CFG[status] || "bg-gray-100 text-gray-500"}`}>
    {(status === "BAIXO" || status === "CRÍTICO") && <AlertTriangle size={10} />}
    {status}
  </span>
);

const EstoqueCard = ({ item, onEditar, onExcluir }) => (
  <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
    <div className="flex-1 text-left">
      <span className="font-bold text-gray-800 text-base uppercase tracking-tight">
        {item.nomeProduto}
      </span>
      <div className="flex gap-6 text-[10px] text-gray-400 uppercase font-black tracking-wider mt-1">
        <span>
          Qtd:{" "}
          <span className={item.quantidade <= item.minimo ? "text-red-500" : "text-orange-500"}>
            {item.quantidade}
          </span>
        </span>
        <span>Mín: {item.minimo}</span>
        {item.fornecedor && (
          <span>
            Fornecedor: <span className="text-gray-600">{item.fornecedor}</span>
          </span>
        )}
      </div>
    </div>

    <div className="text-xl font-black text-gray-800 px-8 italic">
      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.preco ?? 0)}
    </div>

    <div className="min-w-[120px] flex justify-center">
      <StatusBadge status={item.status} />
    </div>

    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEditar(item)}
        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
        title="Editar"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => onExcluir(item)}
        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        title="Excluir"
      >
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

export default EstoqueCard;