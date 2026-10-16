
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function BuyerCart() {
    const {
        suppliers,
        updateQuantity,
        removeFromCart,
    } = useCart();

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

    const deliveryTotal = suppliers.reduce(
        (total, supplier) => total + supplier.deliveryFee,
        0
    );

    const canReviewPurchase =
        acceptIndependentOrders && suppliers.length > 0;

    return (
        <div className="w-full">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold text-blue-700">
                        RotaLog • Portal do Comprador
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Meu carrinho
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Confira os produtos e as condições de cada
                        fornecedor antes de confirmar a compra.
                    </p>

                    <p className="mt-2 text-sm text-amber-700">
                        Demonstração com dados simulados.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section
                        aria-label="Produtos agrupados por fornecedor"
                        className="space-y-5"
                    >
                        {suppliers.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Seu carrinho está vazio
                                </h2>

                                <p className="mt-2 text-sm text-slate-600">
                                    Explore nosso catálogo e adicione produtos para começar sua compra.
                                </p>

                                <Link
                                    to="/"
                                    className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Explorar produtos
                                </Link>
                            </div>
                        )}

                        {suppliers.map((supplier) => {
                            const subtotal = supplier.items.reduce(
                                (total, item) =>
                                    total + item.quantity * item.unitPrice,
                                0
                            );

                            return (
                                <article
                                    key={supplier.supplierId}
                                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="mb-4 border-b border-slate-200 pb-4">
                                        <h2 className="text-lg font-bold">
                                            {supplier.supplierName}
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            {supplier.items.length} produto(s)
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {supplier.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-wrap items-center justify-between gap-3"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {item.productName}
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                                        <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (item.quantity > 1) {
                                                                        updateQuantity(
                                                                            supplier.supplierId,
                                                                            item.id,
                                                                            item.quantity - 1
                                                                        );
                                                                        setReviewConfirmed(false);
                                                                    }
                                                                }}
                                                                disabled={item.quantity <= 1}
                                                                aria-label={`Diminuir quantidade de ${item.productName}`}
                                                                className="px-3 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                                                            >
                                                                −
                                                            </button>

                                                            <span className="min-w-8 text-center text-sm font-semibold">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    updateQuantity(
                                                                        supplier.supplierId,
                                                                        item.id,
                                                                        item.quantity + 1
                                                                    );
                                                                    setReviewConfirmed(false);
                                                                }}
                                                                aria-label={`Aumentar quantidade de ${item.productName}`}
                                                                className="px-3 py-1 text-slate-700 hover:bg-slate-100"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <span className="text-sm text-slate-500">
                                                            {currency.format(item.unitPrice)} por unidade
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                removeFromCart(supplier.supplierId, item.id);
                                                                setReviewConfirmed(false);
                                                            }}
                                                            className="text-sm font-medium text-red-600 hover:underline"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="font-semibold">
                                                    {currency.format(
                                                        item.quantity * item.unitPrice
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
                                        <div className="flex justify-between gap-3">
                                            <span>Subtotal</span>
                                            <span>
                                                {currency.format(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-3">
                                            <span>Frete</span>
                                            <span>
                                                {currency.format(supplier.deliveryFee)}
                                            </span>
                                        </div>

                                        <p className="text-slate-600">
                                            <strong>Previsão:</strong>{" "}
                                            {supplier.deliveryEstimate}
                                        </p>

                                        <p className="text-slate-600">
                                            <strong>Política:</strong>{" "}
                                            {supplier.deliveryPolicy}
                                        </p>

                                        <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 font-bold">
                                            <span>Total do fornecedor</span>
                                            <span>
                                                {currency.format(
                                                    subtotal + supplier.deliveryFee
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Resumo da compra
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Esta compra será dividida em{" "}
                            <strong>{suppliers.length} pedidos</strong>,
                            um para cada fornecedor.
                        </p>

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <span>Produtos</span>
                                <span>
                                    {currency.format(productsTotal)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Frete total</span>
                                <span>
                                    {currency.format(deliveryTotal)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3 border-t border-slate-200 pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span>
                                    {currency.format(
                                        productsTotal + deliveryTotal
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Condições e consentimentos */}
                        <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                            <h3 className="font-semibold text-slate-900">
                                Condições da compra
                            </h3>

                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={acceptIndependentOrders}
                                    onChange={(event) => {
                                        setAcceptIndependentOrders(
                                            event.target.checked
                                        );
                                        setReviewConfirmed(false);
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                                />

                                <span className="text-sm text-slate-700">
                                    Estou ciente de que esta compra será
                                    dividida em pedidos independentes por
                                    fornecedor, com prazos e condições
                                    individuais.
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={acceptPartialFulfillment}
                                    onChange={(event) => {
                                        setAcceptPartialFulfillment(
                                            event.target.checked
                                        );
                                        setReviewConfirmed(false);
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                                />

                                <span className="text-sm text-slate-700">
                                    Autorizo atendimento parcial de itens e
                                    quantidades, caso algum fornecedor não
                                    consiga atender integralmente o pedido.
                                </span>
                            </label>

                            <p className="text-xs leading-relaxed text-slate-500">
                                A autorização de atendimento parcial é
                                opcional. Sem ela, cada pedido deverá ser
                                atendido integralmente ou tratado conforme
                                a política aplicável.
                            </p>

                            <button
                                type="button"
                                disabled={!canReviewPurchase}
                                onClick={() => setReviewConfirmed(true)}
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Revisar condições da compra
                            </button>

                            {reviewConfirmed && (
                                <div
                                    role="status"
                                    className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                                >
                                    <p className="font-semibold text-blue-900">
                                        Condições revisadas nesta demonstração
                                    </p>

                                    <p className="mt-2 text-sm text-blue-800">
                                        Pedidos independentes: Sim
                                    </p>

                                    <p className="mt-1 text-sm text-blue-800">
                                        Atendimento parcial:{" "}
                                        <strong>
                                            {acceptPartialFulfillment
                                                ? "Autorizado"
                                                : "Não autorizado"}
                                        </strong>
                                    </p>

                                    <p className="mt-2 text-sm text-blue-800">
                                        Quantidade de pedidos:{" "}
                                        {suppliers.length}
                                    </p>

                                    <p className="mt-1 text-sm text-blue-800">
                                        Valor total:{" "}
                                        {currency.format(
                                            productsTotal + deliveryTotal
                                        )}
                                    </p>

                                    <p className="mt-3 text-xs leading-relaxed text-blue-700">
                                        Nenhuma compra foi realizada.
                                        Esta revisão utiliza apenas dados
                                        simulados e não envia informações
                                        ao Backend.
                                    </p>
                                    <Link to="/comprador/compras/COMP-001"
                                        className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        Ver exemplo de detalhes da compra
                                    </Link>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
