
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../cart/hooks/useCart";

import {
    catalogProducts,
    formatPrice,
} from "../mocks/products.mock";

export function ProductDetails() {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();
    const [quantity, setQuantity] = useState(1);

    const product = catalogProducts.find(
        (item) => item.id === productId
    );

    function handleAddToCart() {
        if (!product || !product.available) return;

        addToCart({
            supplierId: product.supplierId,
            supplierName: product.supplier,
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
        });

        navigate("/comprador/carrinho");
    }

    if (!product) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Produto não encontrado
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        O produto solicitado não está disponível no catálogo.
                    </p>

                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
                    >
                        Voltar ao catálogo
                    </Link>
                </div>
            </main>
        );
    }

    function decreaseQuantity() {
        setQuantity((current) => Math.max(1, current - 1));
    }

    function increaseQuantity() {
        setQuantity((current) => current + 1);
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
                    <Link
                        to="/"
                        className="text-2xl font-extrabold tracking-tight text-blue-700"
                    >
                        RotaLog
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-sm font-medium text-slate-600 hover:text-blue-700"
                        >
                            Catálogo
                        </Link>

                        <Link
                            to="/comprador/carrinho"
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                            Meu carrinho
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-8">
                <nav
                    aria-label="Navegação"
                    className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500"
                >
                    <Link to="/" className="hover:text-blue-700">
                        Catálogo
                    </Link>
                    <span>/</span>
                    <span>{product.category}</span>
                    <span>/</span>
                    <span className="font-medium text-slate-900">
                        {product.name}
                    </span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex aspect-square items-center justify-center bg-slate-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {product.category}
                        </span>

                        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                            {product.name}
                        </h1>

                        <p className="mt-3 text-sm text-slate-500">
                            Vendido por{" "}
                            <span className="font-semibold text-slate-700">
                                {product.supplier}
                            </span>
                        </p>

                        <div className="my-7 border-y border-slate-100 py-6">
                            <p className="text-3xl font-extrabold text-blue-700">
                                {formatPrice(product.price)}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Preço por {product.unit}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${product.available ? "bg-green-500" : "bg-red-500"
                                    }`}
                            />

                            <span
                                className={
                                    product.available
                                        ? "font-semibold text-green-700"
                                        : "font-semibold text-red-700"
                                }
                            >
                                {product.available
                                    ? "Disponível"
                                    : "Indisponível"}
                            </span>
                        </div>

                        <div className="mt-7">
                            <label className="mb-3 block text-sm font-semibold">
                                Quantidade
                            </label>

                            <div className="flex w-fit items-center overflow-hidden rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    onClick={decreaseQuantity}
                                    disabled={quantity === 1}
                                    aria-label="Diminuir quantidade"
                                    className="px-5 py-3 text-lg hover:bg-slate-100 disabled:opacity-40"
                                >
                                    −
                                </button>

                                <span className="min-w-12 text-center font-semibold">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={increaseQuantity}
                                    aria-label="Aumentar quantidade"
                                    className="px-5 py-3 text-lg hover:bg-slate-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-600">
                                    Subtotal
                                </span>

                                <span className="text-xl font-extrabold">
                                    {formatPrice(product.price * quantity)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!product.available}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            Adicionar ao carrinho
                        </button>

                        <p className="mt-3 text-center text-xs text-slate-500">
                            A inclusão de produtos no carrinho será integrada
                            posteriormente.
                        </p>
                    </section>
                </div>

                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                    <h2 className="text-xl font-bold">
                        Descrição do produto
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                        {product.description}
                    </p>
                </section>
            </main>
        </div>
    );
}
