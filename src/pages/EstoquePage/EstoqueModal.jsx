import { useState, useRef, useEffect, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";
import { apiRequest } from "../../services/auth";

const ComboBox = ({ label, value, onChange, opcoes, placeholder, campoExibicao = "nome", required = false }) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => { setBusca(value || ""); }, [value]);

  useEffect(() => {
    const fechar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  const lista = Array.isArray(opcoes) ? opcoes : [];
  const sugestoes = useMemo(() => {
    const termo = busca?.toLowerCase() || "";
    return lista.filter((op) => {
      const valor = typeof op === "string" ? op : op?.[campoExibicao];
      return valor?.toLowerCase().includes(termo);
    });
  }, [lista, busca, campoExibicao]);

  const selecionar = (op) => {
    setBusca(typeof op === "string" ? op : op?.[campoExibicao] || "");
    onChange(op);
    setAberto(false);
  };

  return (
    <div ref={ref} className="relative text-left">
      <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">
        {label} {required && "*"}
      </label>
      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); onChange(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium text-gray-700 transition-all"
          required={required}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      </div>
      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
          {sugestoes.map((op, i) => (
            <li
              key={i}
              onClick={() => selecionar(op)}
              className="px-4 py-2.5 hover:bg-orange-50 hover:text-orange-500 cursor-pointer text-sm font-semibold text-gray-700 transition-colors"
            >
              {typeof op === "string" ? op : op?.[campoExibicao]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const InputField = ({ label, type = "text", required = false, ...props }) => (
  <div className="text-left">
    <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase ml-1">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium text-gray-700 transition-all"
      required={required}
      {...props}
    />
  </div>
);

const EstoqueModal = ({ opcoes, onClose, onSucesso, itemParaEditar = null }) => {
  const modoEdicao = !!itemParaEditar;
  const [activeTab, setActiveTab] = useState(modoEdicao ? "estoque" : "produto");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const [form, setForm] = useState({
    nomeProduto: "", categoriaId: null, categoriaNome: "", preco: "", unidade: "un",
    quantidade: "", minimo: "", fornecedoresId: null, fornecedorNome: "",
    produtoExistenteId: null, estoqueId: null,
  });

  useEffect(() => {
    if (itemParaEditar) {
      setForm({
        nomeProduto: itemParaEditar.nomeProduto || "",
        categoriaId: itemParaEditar.categoriaId || null,
        categoriaNome: itemParaEditar.categoria || "",
        preco: itemParaEditar.preco != null ? String(itemParaEditar.preco) : "",
        unidade: itemParaEditar.unidade || "un",
        quantidade: itemParaEditar.quantidade != null ? String(itemParaEditar.quantidade) : "",
        minimo: itemParaEditar.minimo != null ? String(itemParaEditar.minimo) : "",
        fornecedoresId: itemParaEditar.fornecedorId || null,
        fornecedorNome: itemParaEditar.fornecedor || "",
        produtoExistenteId: itemParaEditar.produtoId || null,
        estoqueId: itemParaEditar.id || null,
      });
    }
  }, [itemParaEditar]);

  const set = (campo, valor) => setForm((p) => ({ ...p, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "produto" && !modoEdicao) { setActiveTab("estoque"); return; }

    setErro(null);
    setSalvando(true);

    try {
      const payloadProduto = {
        nome: form.nomeProduto.trim(),
        preco: parseFloat(String(form.preco).replace(",", ".")) || 0,
        unidade: form.unidade,
        categoriaId: form.categoriaId,
        fornecedorId: form.fornecedoresId,
      };

      const payloadEstoque = {
        quantidade: parseInt(form.quantidade) || 0,
        minimo: parseInt(form.minimo) || 0,
      };

      if (modoEdicao) {
        await apiRequest(`/api/produtos/update/${form.produtoExistenteId}`, "PATCH", payloadProduto);
        await apiRequest(`/api/estoque/${form.estoqueId}`, "PATCH", payloadEstoque);
      } else {
        let produtoId = form.produtoExistenteId;
        if (!produtoId) {
          const criado = await apiRequest("/api/produtos", "POST", payloadProduto);
          produtoId = criado?.id;
        }
        await apiRequest("/api/estoque", "POST", { ...payloadEstoque, produtoId });
      }
      onSucesso();
      onClose();
    } catch (err) {
      setErro(err.message || "Erro ao processar requisição");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-5">
          {modoEdicao ? "Editar Registro" : "Novo Registro"}
        </h3>

        {erro && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-bold">
            ❌ {erro}
          </div>
        )}

        {!modoEdicao && (
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("produto")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === "produto" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}
            >
              1. Item
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("estoque")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === "estoque" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}
            >
              2. Estoque
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(activeTab === "produto" || modoEdicao) && (
            <div className="space-y-4">
              {!modoEdicao && (
                <ComboBox
                  label="Pesquisar Produto"
                  value={form.nomeProduto}
                  opcoes={opcoes.produtos}
                  placeholder="Selecione ou digite novo..."
                  onChange={(op) => {
                    if (op && typeof op === "object") {
                      setForm(p => ({
                        ...p,
                        produtoExistenteId: op.id,
                        nomeProduto: op.nome,
                        preco: op.preco != null ? String(op.preco) : p.preco,
                        categoriaId: op.categoriaId ?? op.categoria?.id ?? p.categoriaId,
                        categoriaNome: op.categoriaNome ?? op.categoria?.nome ?? p.categoriaNome,
                        fornecedoresId: op.fornecedorId ?? op.fornecedor?.id ?? p.fornecedoresId,
                        fornecedorNome: op.fornecedorNome ?? op.fornecedor?.nome ?? p.fornecedorNome,
                      }));
                    } else {
                      setForm(p => ({ ...p, nomeProduto: op || "", produtoExistenteId: null }));
                    }
                  }}
                />
              )}
              <InputField label="Nome do Produto" type="text" value={form.nomeProduto} onChange={(e) => set("nomeProduto", e.target.value)} required />
              <InputField label="Preço (R$)" type="text" value={form.preco} onChange={(e) => set("preco", e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <ComboBox
                  label="Categoria"
                  value={form.categoriaNome}
                  opcoes={opcoes.categorias}
                  placeholder="Selecione..."
                  onChange={(op) => {
                    if (op && typeof op === "object") setForm(p => ({ ...p, categoriaId: op.id, categoriaNome: op.nome }));
                    else setForm(p => ({ ...p, categoriaId: null, categoriaNome: op || "" }));
                  }}
                />
                <ComboBox
                  label="Fornecedor"
                  value={form.fornecedorNome}
                  opcoes={opcoes.fornecedores}
                  placeholder="Selecione..."
                  onChange={(op) => {
                    if (op && typeof op === "object") setForm(p => ({ ...p, fornecedoresId: op.id, fornecedorNome: op.nome }));
                    else setForm(p => ({ ...p, fornecedoresId: null, fornecedorNome: op || "" }));
                  }}
                />
              </div>
            </div>
          )}

          {(activeTab === "estoque" || modoEdicao) && (
            <div className="space-y-4">
              {modoEdicao && <div className="border-t border-gray-100 pt-4" />}
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Quantidade Atual" type="number" min="0" value={form.quantidade} onChange={(e) => set("quantidade", e.target.value)} required />
                <InputField label="Mínimo" type="number" min="0" value={form.minimo} onChange={(e) => set("minimo", e.target.value)} required />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { if (!modoEdicao && activeTab === "estoque") setActiveTab("produto"); else onClose(); }}
              className="flex-1 py-3 text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
            >
              {!modoEdicao && activeTab === "estoque" ? "← Voltar" : "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors"
            >
              {salvando ? "Processando..." : modoEdicao ? "Salvar" : activeTab === "produto" ? "Próximo" : "Finalizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstoqueModal;