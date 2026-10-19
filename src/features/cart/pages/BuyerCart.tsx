
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function BuyerCart() {
    const { suppliers, updateQuantity, removeFromCart } = useCart();

    const [acceptIndependentOrders, setAcceptIndependentOrders] =
        useState(false);
    const [acceptPartialFulfillment, setAcceptPartialFulfillment] =
        useState(false);
    const [reviewConfirmed, setReviewConfirmed] = useState(false);

    const productsTotal = suppliers.reduce(
        (total, supplier) =>
            total +
            supplier.items.reduce(
                (subtotal, item) =>
                    subtotal + item.quantity * item.unitPrice,
                0
            ),
        0
    );

    const total = productsTotal;

    const itemCount = suppliers.reduce(
        (count, supplier) =>
            count +
            supplier.items.reduce(
                (quantity, item) => quantity + item.quantity,
                0
            ),
        0
    );

    const canReviewPurchase =
        suppliers.length > 0 && acceptIndependentOrders;

    function changeQuantity(
        supplierId: string,
        productId: string,
        quantity: number
    ) {
        updateQuantity(supplierId, productId, quantity);
        setReviewConfirmed(false);
    }

    function removeProduct(supplierId: string, productId: string) {
        removeFromCart(supplierId, productId);
        setReviewConfirmed(false);
    }

    return (
        <div className="mx-auto w-full max-w-[960px] text-slate-900">
            <header className="mb-6">
                <p className="text-xs font-semibold text-blue-700">
                    RotaLog • Portal do Comprador
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Meu carrinho
                </h1>

                <p className="mt-2 text-[13px] leading-5 text-slate-600">
                    Confira os produtos selecionados, os fornecedores e as
                    condições antes de continuar.
                </p>
            </header>

            {suppliers.length === 0 ? (
                <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="38"
                            height="38"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-700"
                            aria-hidden="true"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.5 13h12l2-9H6" />
                        </svg>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold tracking-tight">
                        Seu carrinho está vazio
                    </h2>

                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                        Explore nosso catálogo e adicione produtos para
                        começar a organizar suas compras.
                    </p>

                    <Link
                        to="/"
                        className="mt-7 inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                        Explorar produtos →
                    </Link>
                </section>
            ) : (
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section
                        aria-label="Produtos agrupados por fornecedor"
                        className="min-w-0 space-y-5"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-600">
                                {itemCount} item(ns) de {suppliers.length} fornecedor(es)
                            </p>

                            <Link
                                to="/"
                                className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                                + Continuar comprando
                            </Link>
                        </div>

                        {suppliers.map((supplier) => {
                            const subtotal = supplier.items.reduce(
                                (sum, item) =>
                                    sum + item.quantity * item.unitPrice,
                                0
                            );

                            return (
                                <article
                                    key={supplier.supplierId}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                Fornecedor
                                            </p>

                                            <h2 className="mt-1 text-lg font-bold">
                                                {supplier.supplierName}
                                            </h2>
                                        </div>

                                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                            {supplier.items.length} produto(s)
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 px-5 sm:px-6">
                                        {supplier.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold leading-6">
                                                        {item.productName}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {currency.format(item.unitPrice)} por unidade
                                                    </p>

                                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                                        <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    changeQuantity(
                                                                        supplier.supplierId,
                                                                        item.id,
                                                                        item.quantity - 1
                                                                    )
                                                                }
                                                                disabled={item.quantity <= 1}
                                                                aria-label={`Diminuir quantidade de ${item.productName}`}
                                                                className="px-3.5 py-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                −
                                                            </button>

                                                            <span className="min-w-9 text-center text-sm font-bold">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    changeQuantity(
                                                                        supplier.supplierId,
                                                                        item.id,
                                                                        item.quantity + 1
                                                                    )
                                                                }
                                                                aria-label={`Aumentar quantidade de ${item.productName}`}
                                                                className="px-3.5 py-2 text-slate-700 transition hover:bg-slate-100"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeProduct(supplier.supplierId, item.id)
                                                            }
                                                            className="text-sm font-semibold text-red-600 transition hover:text-red-700 hover:underline"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="sm:text-right">
                                                    <p className="text-xs text-slate-500">
                                                        Subtotal do item
                                                    </p>
                                                    <p className="mt-1 text-lg font-extrabold">
                                                        {currency.format(
                                                            item.quantity * item.unitPrice
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-5 py-5 text-sm sm:px-6">
                                        <div className="flex justify-between gap-3">
                                            <span className="text-slate-600">
                                                Subtotal dos produtos
                                            </span>
                                            <span className="font-semibold">
                                                {currency.format(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-3">
                                            <span className="text-slate-600">
                                                Frete
                                            </span>
                                            <span className="font-semibold text-amber-700">
                                                A calcular
                                            </span>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
                                            <p>
                                                <strong>Previsão de entrega:</strong>{" "}
                                                {supplier.deliveryEstimate}
                                            </p>

                                            <p className="mt-2">
                                                <strong>Condições:</strong>{" "}
                                                {supplier.deliveryPolicy}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4 font-bold">
                                            <span>Total do fornecedor</span>
                                            <span className="text-base text-blue-700">
                                                {currency.format(
                                                    subtotal
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-24">
                        <h2 className="text-base font-bold tracking-tight">
                            Resumo da compra
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Os produtos estão organizados em{" "}
                            <strong className="text-slate-700">
                                {suppliers.length} pedido(s)
                            </strong>
                            , um para cada fornecedor.
                        </p>

                        <div className="mt-6 space-y-4 text-sm">
                            <div className="flex justify-between gap-3">
                                <span className="text-slate-600">Produtos</span>
                                <span className="font-semibold">
                                    {currency.format(productsTotal)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span className="text-slate-600">Frete</span>
                                <span className="font-semibold text-amber-700">
                                    A calcular
                                </span>
                            </div>

                            <div className="flex justify-between gap-3 border-t border-slate-200 pt-4">
                                <span className="text-base font-bold">Total dos produtos</span>
                                <span className="text-xl font-extrabold text-blue-700">
                                    {currency.format(total)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                            <h3 className="font-bold">
                                Condições da compra
                            </h3>

                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={acceptIndependentOrders}
                                    onChange={(event) => {
                                        setAcceptIndependentOrders(event.target.checked);
                                        setReviewConfirmed(false);
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                                />

                                <span className="text-sm leading-6 text-slate-700">
                                    Estou ciente de que esta compra será dividida
                                    em pedidos independentes por fornecedor, com
                                    prazos e condições individuais.
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={acceptPartialFulfillment}
                                    onChange={(event) => {
                                        setAcceptPartialFulfillment(event.target.checked);
                                        setReviewConfirmed(false);
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                                />

                                <span className="text-sm leading-6 text-slate-700">
                                    Autorizo atendimento parcial de itens e
                                    quantidades caso algum fornecedor não consiga
                                    atender integralmente o pedido.
                                </span>
                            </label>

                            <p className="text-xs leading-5 text-slate-500">
                                A autorização de atendimento parcial é opcional.
                                Sem ela, cada pedido deverá ser atendido
                                integralmente ou tratado conforme a política aplicável.
                            </p>

                            <button
                                type="button"
                                disabled={!canReviewPurchase}
                                onClick={() => setReviewConfirmed(true)}
                                className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Revisar condições da compra
                            </button>

                            {reviewConfirmed && (
                                <div
                                    role="status"
                                    className="rounded-xl border border-blue-200 bg-blue-50 p-4"
                                >
                                    <p className="font-bold text-blue-900">
                                        Condições revisadas
                                    </p>

                                    <div className="mt-3 space-y-2 text-sm text-blue-900">
                                        <p>Pedidos independentes: Sim</p>

                                        <p>
                                            Atendimento parcial:{" "}
                                            <strong>
                                                {acceptPartialFulfillment
                                                    ? "Autorizado"
                                                    : "Não autorizado"}
                                            </strong>
                                        </p>

                                        <p>Fornecedores: {suppliers.length}</p>

                                        <p>
                                            Total dos produtos:{" "}
                                            <strong>{currency.format(total)}</strong>
                                        </p>
                                    </div>

                                    <p className="mt-4 border-t border-blue-200 pt-3 text-xs leading-5 text-blue-800">
                                        Esta etapa é apenas uma revisão das condições.
                                        Nenhum pedido foi enviado e nenhuma cobrança
                                        foi realizada.
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
