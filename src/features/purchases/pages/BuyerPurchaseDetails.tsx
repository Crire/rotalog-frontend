
import { Link, useParams } from "react-router-dom";
import {
    calculateSupplierOrderTotal,
    getPurchaseById,
    type SupplierOrderStatus,
} from "../mocks/purchases.mock";

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const statusLabels: Record<SupplierOrderStatus, string> = {
    CONFIRMED: "Confirmado",
    PENDING: "Aguardando confirmação",
    FAILED: "Falha no pedido",
    CANCELLED: "Cancelado",
    PARTIAL: "Atendimento parcial",
};

const statusStyles: Record<SupplierOrderStatus, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-amber-100 text-amber-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-slate-200 text-slate-700",
    PARTIAL: "bg-blue-100 text-blue-800",
};

export function BuyerPurchaseDetails() {
    const { purchaseId } = useParams<{
        purchaseId: string;
    }>();

    const purchase = getPurchaseById(purchaseId ?? "");

    if (!purchase) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Compra não encontrada
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Não encontramos a compra solicitada.
                    </p>

                    <Link
                        to="/comprador/carrinho"
                        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        Voltar ao carrinho
                    </Link>
                </div>
            </div>
        );
    }

    const purchaseTotal = purchase.supplierOrders.reduce(
        (total, order) =>
            total + calculateSupplierOrderTotal(order),
        0
    );

    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(purchase.createdAt));

    return (
        <div className="w-full">
            <div className="w-full">
                <Link
                    to="/comprador/carrinho"
                    className="text-sm font-medium text-blue-700 hover:underline"
                >
                    ← Voltar ao carrinho
                </Link>

                <header className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-blue-700">
                        RotaLog • Portal do Comprador
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Detalhes da compra {purchase.id}
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Compra simulada em {formattedDate}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">
                                Pedidos por fornecedor
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {purchase.supplierOrders.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">
                                Valor previsto da compra
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {currency.format(purchaseTotal)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">
                                Atendimento parcial
                            </p>
                            <p className="mt-1 text-lg font-bold">
                                {purchase.acceptsPartialFulfillment
                                    ? "Autorizado"
                                    : "Não autorizado"}
                            </p>
                        </div>
                    </div>

                    <p className="mt-5 text-sm text-slate-600">
                        Os pedidos são acompanhados individualmente.
                        Uma falha posterior em um fornecedor não
                        cancela automaticamente os demais pedidos.
                    </p>
                </header>

                <section
                    aria-label="Pedidos por fornecedor"
                    className="mt-6 space-y-5"
                >
                    <h2 className="text-2xl font-bold">
                        Pedidos desta compra
                    </h2>

                    {purchase.supplierOrders.map((order) => {
                        const subtotal = order.items.reduce(
                            (total, item) =>
                                total + item.quantity * item.unitPrice,
                            0
                        );

                        return (
                            <article
                                key={order.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Pedido {order.id}
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold">
                                            {order.supplierName}
                                        </h3>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[order.status]
                                            }`}
                                    >
                                        {statusLabels[order.status]}
                                    </span>
                                </div>

                                <div
                                    role={
                                        order.status === "FAILED"
                                            ? "alert"
                                            : undefined
                                    }
                                    className={`mt-5 rounded-lg p-4 text-sm ${order.status === "FAILED"
                                        ? "border border-red-200 bg-red-50 text-red-800"
                                        : "bg-slate-50 text-slate-700"
                                        }`}
                                >
                                    {order.statusMessage}
                                </div>

                                <div className="mt-5 space-y-3">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.productName}
                                                </p>
                                                <p className="text-slate-500">
                                                    {item.quantity} ×{" "}
                                                    {currency.format(item.unitPrice)}
                                                </p>
                                            </div>

                                            <span className="font-semibold">
                                                {currency.format(
                                                    item.quantity * item.unitPrice
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span>Subtotal</span>
                                        <span>{currency.format(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span>Frete</span>
                                        <span>
                                            {currency.format(order.deliveryFee)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base font-bold">
                                        <span>Valor previsto do pedido</span>
                                        <span>
                                            {currency.format(
                                                calculateSupplierOrderTotal(order)
                                            )}
                                        </span>
                                    </div>

                                    <p className="pt-2 text-slate-600">
                                        <strong>Previsão:</strong>{" "}
                                        {order.deliveryEstimate}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Esta página utiliza dados simulados. Os valores
                    apresentados são previstos, não representam
                    cobranças, pagamentos ou reembolsos efetivos.
                </div>
            </div>
        </div>
    );
}
