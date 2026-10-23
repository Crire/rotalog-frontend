import { useEffect, useState } from "react";
import { authenticatedRequest } from "../../services/apiAuth.service";
import type { ApiOrder, DeliveryProof, DeliveryRoute, TimelinePage } from "./contracts";
import { orderError } from "./ordersRepository";

const labels: Record<string, string> = {
    PUBLISHED: "Rota publicada", ACCEPTED: "Motorista aceitou a rota",
    READY_TO_START: "Carga coletada", STARTED: "Em transporte",
    EXECUTION_ENDED: "Deslocamento encerrado", OPERATIONALLY_COMPLETED: "Operação reconciliada",
    CANCELLED: "Rota cancelada", PROOF_PENDING: "Prova pendente",
    DELIVERY_IN_PROGRESS: "Recebimento em andamento", COMPLETED: "Recebimento comprovado",
    ROUTE_PLAN_PROPOSED: "Rota manual proposta", ROUTE_PUBLISHED: "Rota publicada",
    ROUTE_ACCEPT: "Motorista aceitou a rota", ROUTE_PICKUP: "Carga coletada",
    ROUTE_START: "Transporte iniciado", ROUTE_END_EXECUTION: "Deslocamento encerrado",
    ROUTE_COMPLETE_OPERATION: "Operação reconciliada", ROUTE_CANCEL: "Rota cancelada",
    DELIVERY_ATTEMPT_STARTED: "Tentativa de entrega iniciada",
    RECEIVER_AUTHORIZATION_ISSUED: "Recebedor autorizado",
    DELIVERY_PROOF_VALIDATED: "Entrega comprovada",
};
const date = (value?: string) => value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Manaus" }).format(new Date(value))
    : "Não informado";
const button = "rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50";

export function ApiOrderDelivery({ order, refreshError }: { order: ApiOrder; refreshError?: string | null }) {
    const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
    const [timeline, setTimeline] = useState<TimelinePage | null>(null);
    const [proof, setProof] = useState<DeliveryProof | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [checkedAt, setCheckedAt] = useState<string>();
    const [busy, setBusy] = useState(false);
    const routeIds = (order.delivery_routes ?? []).map(route => route.id).join(",");
    const revision = (order.delivery_routes ?? []).map(route => route.version).join(",");
    const organizationId = order.supplier_organization_id;
    useEffect(() => {
        let active = true;
        const headers = { "X-Organization-Id": organizationId };
        void Promise.all([
            authenticatedRequest<TimelinePage>(`/api/v1/supplier-orders/${encodeURIComponent(order.id)}/timeline?page=1&page_size=100`, { headers }),
            Promise.all(routeIds.split(",").filter(Boolean).map(id => authenticatedRequest<DeliveryRoute>(`/api/v1/routes/${encodeURIComponent(id)}`, { headers }))),
        ]).then(([events, data]) => {
            if (active) { setTimeline(events); setRoutes(data); setError(null); setCheckedAt(new Date().toISOString()); }
        }).catch(failure => { if (active) setError(orderError(failure)); });
        return () => { active = false; };
    }, [order.id, order.version, order.updated_at, organizationId, routeIds, revision]);

    async function inspect(attemptId: string) {
        setBusy(true);
        try {
            setProof(await authenticatedRequest<DeliveryProof>(`/api/v1/delivery-attempts/${encodeURIComponent(attemptId)}/proof`, { headers: { "X-Organization-Id": organizationId } }));
            setError(null);
        } catch (failure) { setError(orderError(failure)); }
        finally { setBusy(false); }
    }
    async function download(id: string, kind: string) {
        if (!/^[0-9a-f-]{36}$/i.test(id)) { setError("Identificador de arquivo inválido."); return; }
        setBusy(true);
        try {
            const blob = await authenticatedRequest<Blob>(`/api/v1/delivery-evidence/${id}`, { headers: { "X-Organization-Id": organizationId } }, "blob");
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.download = `${kind === "SIGNATURE" ? "assinatura" : "foto"}-${id}.${blob.type === "image/png" ? "png" : "jpg"}`;
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (failure) { setError(orderError(failure)); }
        finally { setBusy(false); }
    }
    return <section aria-label="Acompanhamento da entrega" className="mt-5 space-y-3 rounded-xl border border-violet-200 p-4">
        <h3 className="font-bold">Acompanhamento da entrega</h3>
        <p className="text-sm">Despachados: {order.items.reduce((sum, item) => sum + item.dispatched_quantity, 0)} · Recebidos pelo comprador: {order.items.reduce((sum, item) => sum + item.buyer_accepted_quantity, 0)}</p>
        <p className="text-xs text-slate-600">Dados consultados em: {date(checkedAt)} · Horários de Manaus. Atualização automática enquanto a aba estiver visível.</p>
        {error && <p role="alert" className="rounded bg-amber-50 p-2 text-sm text-amber-900">Acompanhamento indisponível ou desatualizado: {error} Os dados anteriores não confirmam o progresso atual.</p>}
        {refreshError && <p role="alert" className="rounded bg-amber-50 p-2 text-sm text-amber-900">A última atualização dos pedidos falhou: {refreshError} As informações exibidas podem estar desatualizadas.</p>}
        {!routeIds && <p className="text-sm">Ainda não há rota vinculada ao pedido.</p>}
        {routes.map(route => <article key={route.id} className="rounded-lg bg-slate-50 p-3 text-sm">
            <h4 className="font-semibold">{labels[route.state] ?? route.state}</h4>
            <p>Último evento da rota: {date(route.updated_at)}</p>
            {route.stops.filter(stop => stop.supplier_order_id === order.id).map(stop => <div key={stop.id} className="mt-2">
                <p>Entrega: {labels[stop.attempt_state ?? stop.state] ?? "Aguardando recebimento"}</p>
                {stop.attempt_id && ["COMPLETED", "PROOF_PENDING"].includes(stop.attempt_state ?? "") && <button type="button" disabled={busy} className={button} onClick={() => void inspect(stop.attempt_id!)}>Consultar prova de entrega</button>}
            </div>)}
        </article>)}
        {proof && <section aria-label="Prova de entrega" className="rounded-lg border border-emerald-200 p-3 text-sm">
            <h4 className="font-semibold">{proof.validation_state === "VALID" ? "Prova validada" : "Prova pendente — entrega não confirmada"}</h4>
            <p>Recebedor: {proof.evidence.receiver_name ?? "Não informado"} · {proof.evidence.receiver_role ?? "Função não informada"}</p>
            <p>Condição: {proof.evidence.visible_condition ?? "Não informada"} · Volumes: {proof.evidence.package_count ?? "Não informado"}</p>
            <p>Fim da janela de contestação: {date(proof.contestation_deadline ?? undefined)}</p>
            <div className="mt-2 flex flex-wrap gap-2">{(proof.evidence.evidence ?? []).map(file => <button key={file.id} type="button" disabled={busy} className={button} onClick={() => void download(file.id, file.kind)}>Baixar {file.kind === "SIGNATURE" ? "assinatura" : "foto"}</button>)}</div>
            <p className="mt-2 text-xs">Arquivos privados consultados com autenticação. Entrega não significa pagamento liberado.</p>
        </section>}
        {timeline && <details><summary className="cursor-pointer text-sm font-semibold">Eventos da entrega ({timeline.total})</summary>
            <ol className="mt-2 space-y-2 text-sm">{timeline.items.map(event => <li key={event.id}>{date(event.occurred_at)} — {labels[event.kind] ?? event.kind}</li>)}</ol>
            {timeline.total > timeline.items.length && <p className="text-xs">Exibidos os primeiros {timeline.items.length} eventos.</p>}
        </details>}
    </section>;
}
