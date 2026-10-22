import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../../shared/components/PageHeader";
import { MetricCard } from "../components/MetricCard";
import { useApiOrders } from "../../orders/api/ordersContext";
import { adaptOrder, apiStages, formatMoney, orderMetrics } from "../../orders/api/orderAdapter";
import { ApiOrdersStatus } from "../../orders/api/ApiSupplierOrders";
import { ApiOrderDetails } from "../../orders/api/ApiOrderDetails";

export function ApiSupplierDashboard() {
    const { orders, loaded, error, loading, repository } = useApiOrders();
    const [selected, setSelected] = useState<string | null>(null);
    const views = orders.map(adaptOrder);
    const stages = [...apiStages, { id: "completed", title: "Finalizados" }];
    return <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4">
        <PageHeader title="Visão geral" subtitle="Pedidos do fornecedor consultados no Backend, em todas as páginas." actions={<button type="button" disabled={loading} onClick={() => void repository.refresh()} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50">Atualizar pedidos</button>} />
        <ApiOrdersStatus />
        {loaded && !error && <>
            <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">{orderMetrics(orders).map(metric => <Link key={metric.title} to="/fornecedor/pedidos" aria-label={`${metric.title}: ${metric.value}. Ver pedidos`} className="flex rounded-xl transition hover:ring-2 hover:ring-blue-200"><MetricCard title={metric.title} value={metric.value} /></Link>)}</div>
            {!orders.length && <p role="status" className="text-sm text-slate-600">Nenhum pedido retornado pelo Backend para esta organização.</p>}
            <section aria-label="Pedidos por situação" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Pedidos por situação</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.filter(stage => stage.id !== "unknown" || views.some(order => order.stage === "unknown")).map(stage => <li key={stage.id} className="flex justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm"><span>{stage.title}</span><strong>{views.filter(order => order.stage === stage.id).length}</strong></li>)}</ul></section>
            <section aria-label="Pedidos retornados pelo Backend" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Pedidos retornados pelo Backend</h2><p className="mt-1 text-xs text-slate-500">Primeiros cinco na ordenação da API.</p><ul className="mt-3 divide-y divide-slate-100">{views.slice(0, 5).map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm [overflow-wrap:anywhere]"><div><p className="font-semibold">{order.id}</p><p className="text-slate-500">{order.stateLabel} · {formatMoney(order.total)}</p></div><button type="button" onClick={() => setSelected(order.id)} className="rounded px-2 py-1 font-semibold text-blue-700">Ver detalhes</button></li>)}</ul></section>
        </>}
        <p className="text-xs text-slate-500">Indicadores globais da organização. Filtros anuais e séries históricas indisponíveis: a API não retorna data de criação dos pedidos. Produtos e estoque continuam simulados nas suas telas.</p>
        {selected && <ApiOrderDetails key={selected} id={selected} onClose={() => setSelected(null)} />}
    </div>;
}
