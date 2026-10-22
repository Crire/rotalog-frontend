import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ApiOrder, Fulfillment } from "./contracts";
import { acceptanceOpen, adaptOrder, formatMoney } from "./orderAdapter";
import { orderError, remainingAllocation } from "./ordersRepository";
import { useApiOrders } from "./ordersContext";
import { ApiOrderDeadline } from "./ApiOrderDeadline";

type Action = "accept" | "refuse" | "start" | "allocate" | "separate" | "ready";
type Selection = { action: Action; fulfillmentId?: string; version: number; quantities: number[] };
const titles: Record<Action, string> = {
    accept: "Confirmar aceite", refuse: "Confirmar recusa integral", start: "Iniciar separação",
    allocate: "Criar lote de atendimento", separate: "Registrar separação", ready: "Marcar lote como pronto",
};
const button = "rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50";

export function ApiOrderDetails({ id, onClose }: { id: string; onClose: () => void }) {
    const { repository } = useApiOrders();
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [pending, setPending] = useState(false);
    const confirming = useRef(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => {
        let active = true;
        void repository.detail(id).then(value => { if (active) setOrder(value); })
            .catch(failure => { if (active) setError(orderError(failure)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [repository, id]);
    useEffect(() => {
        const previous = document.activeElement;
        const element = dialog.current;
        element?.showModal();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { element?.close(); document.body.style.overflow = overflow; if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
    }, []);

    function choose(action: Action, fulfillment?: Fulfillment) {
        if (!order) return;
        setError(null);
        const quantities = action === "refuse" ? order.items.map(() => 0)
            : action === "allocate" ? order.items.map(item => remainingAllocation(order, item.id))
            : action === "separate" ? fulfillment!.lines.map(line => line.separated_quantity)
            : order.items.map(item => item.requested_quantity);
        setSelection({ action, fulfillmentId: fulfillment?.id, version: fulfillment?.version ?? order.version, quantities });
    }
    async function confirm() {
        if (!order || !selection || confirming.current) return;
        confirming.current = true;
        setPending(true); setError(null);
        try {
            const fulfillment = order.fulfillments.find(item => item.id === selection.fulfillmentId);
            if (selection.version !== (fulfillment?.version ?? order.version)) throw new Error("Versão alterada. Revise a operação.");
            switch (selection.action) {
                case "accept": case "refuse": await repository.accept(order, selection.quantities); break;
                case "start": await repository.start(order); break;
                case "allocate": await repository.allocate(order, selection.quantities); break;
                case "separate": if (!fulfillment) throw new Error("Lote não encontrado."); await repository.separate(order, fulfillment, selection.quantities); break;
                case "ready": if (!fulfillment) throw new Error("Lote não encontrado."); await repository.ready(order, fulfillment); break;
            }
            setSelection(null);
            setOrder(await repository.detail(id));
        } catch (failure) {
            setError(orderError(failure));
            // Não muda a versão/payload de uma tentativa incerta de aceite.
            // A mesma confirmação conserva a chave; atualização explícita inicia nova revisão.
        } finally { confirming.current = false; setPending(false); }
    }
    async function reload() {
        setLoading(true); setError(null); setSelection(null);
        try { setOrder(await repository.detail(id)); }
        catch (failure) { setError(orderError(failure)); setOrder(null); }
        finally { setLoading(false); }
    }
    const fulfillment = order?.fulfillments.find(item => item.id === selection?.fulfillmentId);
    const quantityFields = selection && order && (selection.action === "allocate" || selection.action === "separate" || (selection.action === "accept" && order.accepts_partial));
    return createPortal(<dialog ref={dialog} data-supplier-ui aria-labelledby={titleId} aria-modal="true" onCancel={event => { event.preventDefault(); if (!confirming.current) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-4xl overflow-y-auto rounded-2xl border-0 bg-white p-5 text-slate-900 shadow-2xl [overflow-wrap:anywhere] backdrop:bg-slate-950/60 sm:p-6">
        <header className="flex items-start justify-between gap-3"><h2 id={titleId} className="text-xl font-bold">Detalhes do pedido</h2><button type="button" disabled={pending} onClick={onClose} className={button}>Fechar</button></header>
        {loading && <p role="status" className="mt-4">Carregando pedido…</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!loading && <button type="button" disabled={pending} onClick={() => void reload()} className={`${button} mt-4`}>Atualizar pedido e revisar</button>}
        {order && !loading && <>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Pedido</dt><dd>{order.id}</dd></div>
                <div><dt className="text-slate-500">Compra</dt><dd>{order.purchase_id}</dd></div>
                <div><dt className="text-slate-500">Organização compradora (ID)</dt><dd>{order.buyer_organization_id}</dd></div>
                <div><dt className="text-slate-500">Organização fornecedora (ID)</dt><dd>{order.supplier_organization_id}</dd></div>
                <div><dt className="text-slate-500">Estado</dt><dd>{adaptOrder(order).stateLabel} ({order.state})</dd></div>
                <div><dt className="text-slate-500">Versão do pedido</dt><dd>{order.version}</dd></div>
                <div><dt className="text-slate-500">Valor solicitado</dt><dd>{formatMoney(order.total)}</dd></div>
                <div><dt className="text-slate-500">Aceite parcial permitido</dt><dd>{order.accepts_partial ? "Sim" : "Não"}</dd></div>
                {order.cancellation_reason && <div><dt>Motivo de cancelamento</dt><dd>{order.cancellation_reason}</dd></div>}
            </dl>
            <ApiOrderDeadline order={order} />
            <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left font-semibold">Produtos do pedido</caption><thead><tr className="border-b"><th className="p-2">Produto</th><th className="p-2">Solicitado</th><th className="p-2">Aceito / recusado</th><th className="p-2">Separado</th><th className="p-2">Preço unitário</th></tr></thead><tbody>{order.items.map(item => <tr key={item.id} className="border-b"><td className="p-2">{item.product.name}<span className="block text-xs text-slate-500">{item.product.net_content} {item.product.net_content_unit} · {item.product.packaging_type}</span></td><td className="p-2">{item.requested_quantity}</td><td className="p-2">{item.supplier_accepted_quantity} / {item.supplier_refused_quantity}</td><td className="p-2">{item.separated_quantity}</td><td className="p-2">{formatMoney(item.unit_price)}</td></tr>)}</tbody></table></div>
            <div className="mt-4 flex flex-wrap gap-2">
                {acceptanceOpen(order, now) && <><button disabled={pending} className={button} onClick={() => choose("accept")}>Aceitar pedido</button><button disabled={pending} className={button} onClick={() => choose("refuse")}>Recusar integralmente</button></>}
                {order.allowed_actions.includes("start-separation") && ["ACCEPTED", "PARTIALLY_ACCEPTED"].includes(order.state) && <button disabled={pending} className={button} onClick={() => choose("start")}>Iniciar separação</button>}
                {order.allowed_actions.includes("fulfillments") && order.state === "SEPARATING" && order.items.some(item => remainingAllocation(order, item.id) > 0) && <button disabled={pending} className={button} onClick={() => choose("allocate")}>Criar lote</button>}
            </div>
            <section className="mt-5 space-y-3" aria-label="Lotes de atendimento"><h3 className="font-bold">Lotes de atendimento</h3>{!order.fulfillments.length && <p className="text-sm text-slate-500">Nenhum lote registrado.</p>}{order.fulfillments.map(batch => <article key={batch.id} className="rounded-xl border border-slate-200 p-3 text-sm"><h4 className="font-semibold">Lote {batch.id}</h4><p>{batch.state} · Versão do lote: {batch.version}</p><ul className="my-2 space-y-1">{batch.lines.map(line => <li key={line.id}>{order.items.find(item => item.id === line.order_item_id)?.product.name ?? line.order_item_id}: {line.separated_quantity} separados / {line.allocated_quantity} alocados</li>)}</ul>{batch.state === "SEPARATING" && order.state === "SEPARATING" && order.allowed_actions.includes("fulfillments") && <div className="flex flex-wrap gap-2"><button disabled={pending} className={button} onClick={() => choose("separate", batch)}>Registrar separação do lote</button><button disabled={pending || !batch.lines.length || batch.lines.some(line => line.separated_quantity !== line.allocated_quantity)} className={button} onClick={() => choose("ready", batch)}>Marcar lote como pronto</button></div>}</article>)}</section>
            {selection && <section aria-label="Confirmação da operação" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4"><h3 className="font-bold">{titles[selection.action]}</h3><p className="mt-2 text-sm">Revise as quantidades antes de confirmar. A operação será enviada ao servidor.</p>{selection.action === "refuse" && <p className="text-sm">Todas as linhas serão recusadas (quantidade aceita zero).</p>}
                {quantityFields && selection.quantities.map((quantity, index) => {
                    const line = fulfillment?.lines[index];
                    const item = line ? order.items.find(value => value.id === line.order_item_id)! : order.items[index];
                    const max = selection.action === "separate" ? line!.allocated_quantity : selection.action === "allocate" ? remainingAllocation(order, item.id) : Math.min(item.requested_quantity, item.reserved_quantity);
                    return <label key={line?.id ?? item.id} className="mt-3 block text-sm">{item.product.name} (máximo {max})<input type="number" min={0} max={max} step={1} required disabled={pending} value={Number.isNaN(quantity) ? "" : quantity} onChange={event => { const value = event.target.value === "" ? NaN : Number(event.target.value); setSelection(previous => previous ? { ...previous, quantities: previous.quantities.map((old, at) => at === index ? value : old) } : null); }} className="ml-2 w-24 rounded border border-slate-300 bg-white p-2" /></label>;
                })}
                <div className="mt-4 flex flex-wrap gap-2"><button disabled={pending} className={button} onClick={() => setSelection(null)}>Voltar</button><button disabled={pending} aria-busy={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void confirm()}>{pending ? "Processando…" : titles[selection.action]}</button></div>
            </section>}
            <p className="mt-4 text-xs text-slate-500">SIMULAÇÃO — dados sintéticos do Backend. Datas de criação e conclusão e estado financeiro não são fornecidos por este contrato.</p>
        </>}
    </dialog>, document.body);
}
