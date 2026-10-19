import { useEffect, useRef } from "react";

import type { Organization } from "../../organizations/mocks/organizations.mock";
import type {
    CommercialStatus,
    CustodyStatus,
    FinancialStatus,
    SupplierOrder,
} from "../mocks/orders.mock";

type OrderDetailsModalProps = {
    order: SupplierOrder;
    displayId?: string;
    activeOrganization: Organization;
    onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const commercialStyles: Record<CommercialStatus, string> = {
    "Aguardando aceite": "bg-amber-100 text-amber-800",
    Aceito: "bg-emerald-100 text-emerald-800",
    Recusado: "bg-red-100 text-red-800",
};

const financialStyles: Record<FinancialStatus, string> = {
    Pendente: "bg-amber-100 text-amber-800",
    Aprovado: "bg-emerald-100 text-emerald-800",
    Reembolsado: "bg-violet-100 text-violet-800",
};

const custodyStyles: Record<CustodyStatus, string> = {
    "Aguardando separação": "bg-slate-100 text-slate-700",
    "Em separação": "bg-blue-100 text-blue-800",
    "Pronto para coleta": "bg-teal-100 text-teal-800",
    "Em transporte": "bg-violet-100 text-violet-800",
    Entregue: "bg-green-100 text-green-800",
};

export function OrderDetailsModal({
    order,
    activeOrganization,
    onClose,
    displayId,
}: OrderDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const previousFocusedElement = document.activeElement;
        closeButtonRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab") return;

            const modal = modalRef.current;
            if (!modal) return;

            const elements = Array.from(
                modal.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ),
            );

            if (elements.length === 0) {
                event.preventDefault();
                modal.focus();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];

            if (
                event.shiftKey &&
                (document.activeElement === first ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === last ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                first.focus();
            }
        }

        function handleFocusIn(event: FocusEvent) {
            const modal = modalRef.current;
            if (
                modal &&
                event.target instanceof Node &&
                !modal.contains(event.target)
            ) {
                closeButtonRef.current?.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("focusin", handleFocusIn);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("focusin", handleFocusIn);
            if (
                previousFocusedElement instanceof HTMLElement &&
                previousFocusedElement.isConnected
            ) {
                previousFocusedElement.focus();
            }
        };
    }, []);

    if (order.organizationId !== activeOrganization.id) return null;

    const formattedDate = new Date(
        `${order.date}T12:00:00`,
    ).toLocaleDateString("pt-BR");

    const commercial = order.commercialStatus;
    const financial = order.financialStatus;
    const custody = order.custodyStatus;
    const orderItems = order.orderItems ?? [];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                aria-describedby="order-details-description"
                tabIndex={-1}
                className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Detalhes do pedido
                        </p>
                        <h2
                            id="order-details-title"
                            className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
                        >
                            {displayId ?? order.id}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {activeOrganization.name}
                        </p>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar detalhes do pedido"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                </header>

                <div className="min-h-0 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                    <section aria-labelledby="order-status-heading">
                        <h3
                            id="order-status-heading"
                            className="mb-3 text-base font-semibold text-slate-900"
                        >
                            Acompanhamento
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="mb-2 text-xs font-medium text-slate-500">
                                    Comercial
                                </p>
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${commercial ? commercialStyles[commercial] : "bg-slate-100 text-slate-600"}`}
                                >
                                    {commercial ?? "Não informado"}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="mb-2 text-xs font-medium text-slate-500">
                                    Financeiro
                                </p>
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${financial ? financialStyles[financial] : "bg-slate-100 text-slate-600"}`}
                                >
                                    {financial ?? "Não informado"}
                                </span>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="mb-2 text-xs font-medium text-slate-500">
                                    Preparação / Logística
                                </p>
                                {commercial === "Recusado" ? (
                                    <span className="text-sm text-slate-500">
                                        Não aplicável
                                    </span>
                                ) : (
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${custody ? custodyStyles[custody] : "bg-slate-100 text-slate-600"}`}
                                    >
                                        {custody ?? "Não informado"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {commercial === "Recusado" && (
                        <section aria-labelledby="order-rejection-heading" className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <h3 id="order-rejection-heading" className="text-base font-semibold text-red-800">Recusa do pedido</h3>
                            {order.rejection ? (
                                <dl className="mt-3 space-y-3 text-sm">
                                    <div><dt className="font-semibold">Motivo</dt><dd>{order.rejection.reason}</dd></div>
                                    <div><dt className="font-semibold">Justificativa</dt><dd className="whitespace-pre-wrap break-words">{order.rejection.justification}</dd></div>
                                    <div><dt className="font-semibold">Data e hora da recusa</dt><dd>{new Date(order.rejection.rejectedAt).toLocaleString("pt-BR", { timeZone: order.timeZone ?? "America/Manaus", timeZoneName: "short" })}</dd></div>
                                </dl>
                            ) : <p className="mt-2 text-sm text-slate-600">Justificativa da recusa não registrada.</p>}
                        </section>
                    )}
                    <section aria-labelledby="order-info-heading">
                        <h3
                            id="order-info-heading"
                            className="mb-3 text-base font-semibold text-slate-900"
                        >
                            Informações do pedido
                        </h3>
                        <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-slate-500">Cliente</dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {order.customer}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Data do pedido
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {formattedDate}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Quantidade de itens
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {order.items}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">
                                    Fornecedor
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {activeOrganization.name}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="order-items-heading">
                        <h3
                            id="order-items-heading"
                            className="mb-3 text-base font-semibold text-slate-900"
                        >
                            Produtos do pedido
                        </h3>
                        {orderItems.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Produto
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right font-semibold">
                                                Qtd.
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right font-semibold">
                                                Unitário
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right font-semibold">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orderItems.map((item) => (
                                            <tr key={item.productId}>
                                                <td className="px-4 py-3 text-slate-900">
                                                    {item.productName}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {currencyFormatter.format(item.unitPrice)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    {currencyFormatter.format(item.quantity * item.unitPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                                A relação de produtos ainda não está disponível neste pedido demonstrativo.
                            </div>
                        )}
                    </section>

                    <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl bg-slate-50 p-5">
                        <div>
                            <p className="text-sm text-slate-500">
                                Valor total do pedido
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {currencyFormatter.format(order.total)}
                            </p>
                        </div>
                        <span className="text-xs text-slate-500">
                            Dados demonstrativos
                        </span>
                    </div>

                    <p
                        id="order-details-description"
                        className="text-xs text-slate-500"
                    >
                        Informações simuladas para validação do frontend. A
                        integração com a API do RotaLog será realizada posteriormente.
                    </p>
                </div>

                <footer className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-4 sm:px-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
}
