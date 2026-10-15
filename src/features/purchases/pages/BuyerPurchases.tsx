
import { Link } from "react-router-dom";

import {
    purchasesMock,
    calculateSupplierOrderTotal,
} from "../mocks/purchases.mock";

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function BuyerPurchases() {
    return (
        <div className="w-full text-slate-900">
            <header className="mb-8">
                <p className="text-sm font-semibold text-blue-700">
                    RotaLog • Portal do Comprador
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    Minhas compras
                </h1>

                <p className="mt-2 text-slate-600">
                    Acompanhe os pedidos de cada fornecedor
                    e consulte os detalhes das suas compras.
                </p>

                <p className="mt-2 text-sm text-amber-700">
                    Demonstração com dados simulados.
                </p>
            </header>

            <section
                aria-label="Lista de compras"
                className="space-y-5"
            >
                {purchasesMock.map((purchase) => {
                    const total = purchase.supplierOrders.reduce(
                        (sum, order) =>
                            sum + calculateSupplierOrderTotal(order),
                        0
                    );

                    const confirmed = purchase.supplierOrders.filter(
                        (order) => order.status === "CONFIRMED"
                    ).length;

                    const pending = purchase.supplierOrders.filter(
                        (order) => order.status === "PENDING"
                    ).length;

                    const failed = purchase.supplierOrders.filter(
                        (order) => order.status === "FAILED"
                    ).length;

                    return (
                        <article
                            key={purchase.id}
                            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Compra
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold">
                                        {purchase.id}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-600">
                                        {purchase.supplierOrders.length} pedidos
                                        de fornecedores diferentes
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${failed > 0
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                >
                                    {failed > 0
                                        ? "Requer atenção"
                                        : "Em andamento"}
                                </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3 text-sm">
                                {confirmed > 0 && (
                                    <span className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
                                        {confirmed} confirmado(s)
                                    </span>
                                )}

                                {pending > 0 && (
                                    <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                                        {pending} aguardando
                                    </span>
                                )}

                                {failed > 0 && (
                                    <span className="rounded-lg bg-red-50 px-3 py-2 text-red-800">
                                        {failed} com falha
                                    </span>
                                )}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Valor previsto
                                    </p>

                                    <p className="text-xl font-bold">
                                        {currency.format(total)}
                                    </p>
                                </div>

                                <Link
                                    to={`/comprador/compras/${purchase.id}`}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                >
                                    Ver detalhes da compra
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>
        </div>
    );
}
