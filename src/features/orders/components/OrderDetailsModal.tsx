
import { useEffect, useRef } from "react";

import type { Organization } from "../../organizations/mocks/organizations.mock";

import type {
    SupplierOrder,
    SupplierOrderStatus,
} from "../mocks/orders.mock";

type OrderDetailsModalProps = {
    order: SupplierOrder;
    activeOrganization: Organization;
    onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const statusStyles: Record<SupplierOrderStatus, string> = {
    Pendente: "bg-amber-100 text-amber-800",
    "Em separação": "bg-blue-100 text-blue-800",
    "Em transporte": "bg-purple-100 text-purple-800",
    Entregue: "bg-green-100 text-green-800",
};

export function OrderDetailsModal({
    order,
    activeOrganization,
    onClose,
}: OrderDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Mantém a referência atualizada sem reinstalar
    // os eventos a cada renderização.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const previousFocusedElement = document.activeElement;

        // Ao abrir, move o foco para o botão de fechar.
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

            const focusableElements =
                modal.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

            const elements = Array.from(focusableElements);

            if (elements.length === 0) {
                event.preventDefault();
                modal.focus();
                return;
            }

            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            if (
                event.shiftKey &&
                (document.activeElement === firstElement ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === lastElement ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        // Impede que o foco saia do modal por outros meios.
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

            // Devolve o foco ao botão que abriu o modal.
            if (
                previousFocusedElement instanceof HTMLElement &&
                previousFocusedElement.isConnected
            ) {
                previousFocusedElement.focus();
            }
        };
    }, []);

    // Impede exibição de dados de outra organização.
    if (order.organizationId !== activeOrganization.id) {
        return null;
    }

    const formattedDate = new Date(
        `${order.date}T12:00:00`
    ).toLocaleDateString("pt-BR");

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                aria-describedby="order-details-description"
                tabIndex={-1}
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Cabeçalho */}
                <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-6">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Detalhes do pedido
                        </p>

                        <h2
                            id="order-details-title"
                            className="mt-1 text-2xl font-bold text-slate-900"
                        >
                            {order.id}
                        </h2>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar detalhes do pedido"
                        className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="space-y-6 overflow-y-auto p-6">
                    <div>
                        <p className="mb-2 text-sm text-slate-500">
                            Status atual
                        </p>

                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusStyles[order.status]
                                }`}
                        >
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-slate-500">
                                Cliente
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {order.customer}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Data do pedido
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {formattedDate}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Quantidade de itens
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {order.items}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Organização
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {activeOrganization.name}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">
                            Valor total do pedido
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {currencyFormatter.format(order.total)}
                        </p>
                    </div>

                    <p
                        id="order-details-description"
                        className="text-xs text-slate-500"
                    >
                        Informações demonstrativas. Os detalhes completos
                        serão integrados à API do RotaLog.
                    </p>
                </div>

                {/* Rodapé */}
                <div className="flex shrink-0 justify-end border-t border-slate-200 p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
