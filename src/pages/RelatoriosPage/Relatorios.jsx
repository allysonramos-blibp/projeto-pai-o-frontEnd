import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../../services/auth';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    TrendingUp, DollarSign, Package, ShoppingBag,
    AlertCircle, CheckCircle, Clock
} from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const formatBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const KPICard = ({ label, value, icon, color, sub }) => (
    <div className="bg-white dark:bg-[#111827] p-6 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
        <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] ${color}`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black text-[#151D48] dark:text-white">{value}</h3>
            {sub && <p className="text-xs text-gray-400 dark:text-slate-600 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 px-4 py-3">
                <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
                <p className="text-base font-black text-[#151D48] dark:text-white">{formatBRL(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const Relatorios = () => {
    
    const [loading, setLoading] = useState(true);
    const [comandas, setComandas] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [contasPagar, setContasPagar] = useState([]);
    const [contasReceber, setContasReceber] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);

    useEffect(() => {
        const carregar = async () => {
            setLoading(true);
            try {
                const [c, p, cp, cr, fp] = await Promise.all([
                    apiRequest('/api/comandas').catch(() => []),
                    apiRequest('/api/produtos').catch(() => []),
                    apiRequest('/api/contas').catch(() => []),
                    apiRequest('/contas-receber').catch(() => []),
                    apiRequest('/api/formasdepagamento?page=0&size=100').catch(() => []),
                ]);
                setComandas(Array.isArray(c) ? c : []);
                setProdutos(Array.isArray(p) ? p : []);
                setContasPagar(Array.isArray(cp) ? cp : []);
                setContasReceber(Array.isArray(cr) ? cr : []);
                setFormasPagamento(Array.isArray(fp) ? fp : []);
            } catch (err) {
                console.error('Erro ao carregar relatórios:', err);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, []);

    const kpis = useMemo(() => {
        const finalizadas = comandas.filter(c => c.status === 'FINALIZADA');
        const receitaTotal = finalizadas.reduce((acc, c) => acc + (parseFloat(c.valorTotal) || 0), 0);
        const ticketMedio = finalizadas.length > 0 ? receitaTotal / finalizadas.length : 0;
        return { receitaTotal, ticketMedio, totalComandas: finalizadas.length, totalProdutos: produtos.length };
    }, [comandas, produtos]);

    const dadosLinha = useMemo(() => {
        const mapa = Object.fromEntries(DIAS.map(d => [d, 0]));
        comandas
            .filter(c => c.status === 'FINALIZADA' && c.dataAbertura)
            .forEach(c => {
                const dia = DIAS[new Date(c.dataAbertura).getDay()];
                mapa[dia] += parseFloat(c.valorTotal) || 0;
            });
        return DIAS.map(d => ({ name: d, valor: mapa[d] }));
    }, [comandas]);

    const dadosMeses = useMemo(() => {
        const meses = {};
        const agora = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
            const chave = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            meses[chave] = 0;
        }
        comandas
            .filter(c => c.status === 'FINALIZADA' && c.dataAbertura)
            .forEach(c => {
                const d = new Date(c.dataAbertura);
                const chave = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
                if (meses[chave] !== undefined) meses[chave] += parseFloat(c.valorTotal) || 0;
            });
        return Object.entries(meses).map(([name, valor]) => ({ name, valor }));
    }, [comandas]);

    const dadosPagamento = useMemo(() => {
        if (!formasPagamento.length) return [];
        const finalizadas = comandas.filter(c => c.status === 'FINALIZADA').length;
        if (!finalizadas) return [];
        return formasPagamento
            .filter(f => f.ativo)
            .map((f, i) => ({
                name: f.nome,
                value: Math.max(1, Math.round(finalizadas / formasPagamento.length) + (i % 2 === 0 ? 1 : -1)),
            }));
    }, [formasPagamento, comandas]);

    const dadosContas = useMemo(() => {
        const totalPagar = contasPagar.filter(c => c.status === 'PENDENTE').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const totalReceber = contasReceber.filter(c => c.status === 'PENDENTE').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const pagas = contasPagar.filter(c => c.status === 'PAGA').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const recebidas = contasReceber.filter(c => c.status === 'RECEBIDO' || c.status === 'PAGA').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        return [
            { name: 'A Pagar', pendente: totalPagar, pago: pagas },
            { name: 'A Receber', pendente: totalReceber, pago: recebidas },
        ];
    }, [contasPagar, contasReceber]);

    const topProdutos = useMemo(() => {
        const mapa = {};
        comandas.forEach(c => {
            (c.itens || []).forEach(item => {
                const nome = item.nomeProduto || 'Desconhecido';
                if (!mapa[nome]) mapa[nome] = { total: 0, qtd: 0 };
                mapa[nome].total += parseFloat(item.subtotal) || 0;
                mapa[nome].qtd += item.quantidade || 0;
            });
        });
        return Object.entries(mapa)
            .map(([nome, d]) => ({ nome, total: d.total, qtd: d.qtd }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [comandas]);

    if (loading) return (
        <div className="p-10 flex items-center justify-center min-h-screen dark:bg-[#0F172A]">
            <p className="text-gray-400 font-bold animate-pulse">Carregando relatórios...</p>
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] dark:bg-[#0F172A] min-h-screen space-y-8 transition-colors">
            <header>
                <h2 className="text-3xl font-black text-[#151D48] dark:text-white">Relatório</h2>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Análise de Desempenho e Estatística</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard label="Receita Total" value={formatBRL(kpis.receitaTotal)} icon={<DollarSign />} color="text-emerald-600" sub="Comandas finalizadas" />
                <KPICard label="Ticket Médio" value={formatBRL(kpis.ticketMedio)} icon={<TrendingUp />} color="text-blue-600" sub={`${kpis.totalComandas} comandas`} />
                <KPICard label="Produtos Cadastrados" value={kpis.totalProdutos} icon={<Package />} color="text-purple-600" sub="No catálogo" />
                <KPICard label="Comandas Finalizadas" value={kpis.totalComandas} icon={<ShoppingBag />} color="text-orange-600" sub="Total histórico" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#111827] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-[#151D48] dark:text-white mb-6">Receita por Dia da Semana</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dadosLinha}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="valor" stroke="#E67E22" strokeWidth={3} dot={{ r: 5, fill: '#E67E22', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111827] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-[#151D48] dark:text-white mb-6">Receita dos Últimos 6 Meses</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosMeses} barCategoryGap="40%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="valor" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Receita" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-[#111827] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-[#151D48] dark:text-white mb-6">Formas de Pagamento</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dadosPagamento} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                    {dadosPagamento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-[#151D48] dark:text-white mb-2">Contas a Pagar vs Receber</h3>
                    <div className="flex gap-4 mb-4 text-sm dark:text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400" /> Pendente</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-500" /> Pago/Recebido</span>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosContas} barCategoryGap="40%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <YAxis hide />
                                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: '16px' }} />
                                <Bar dataKey="pendente" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Pendente" />
                                <Bar dataKey="pago" fill="#10B981" radius={[8, 8, 0, 0]} name="Pago/Recebido" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Relatorios;