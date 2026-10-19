
import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { catalogProducts, formatPrice } from "../mocks/products.mock";

type MarketplaceContext = {
    search: string;
};

const categories = [
    "Todos",
    "Construção",
    "Pintura",
    "Ferramentas",
];

export function ProductCatalog() {
    const { search } = useOutletContext<MarketplaceContext>();
    const [category, setCategory] = useState("Todos");

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLocaleLowerCase("pt-BR");

        return catalogProducts.filter((product) => {
            const matchesCategory =
                category === "Todos" || product.category === category;

            const matchesSearch =
                product.name.toLocaleLowerCase("pt-BR").includes(term) ||
                product.supplier.toLocaleLowerCase("pt-BR").includes(term);

            return matchesCategory && matchesSearch;
        });
    }, [category, search]);

    return (
        <div className="mx-auto w-full max-w-[1120px] text-slate-900">
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#122a55] to-[#1d4d94] px-6 py-7 text-white sm:px-8 sm:py-8">
                <div className="relative z-10 max-w-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-200">
                        Marketplace RotaLog
                    </p>

                    <h1 className="mt-2 text-[23px] font-bold leading-tight tracking-tight sm:text-[28px]">
                        Tudo para o seu negócio em um só lugar
                    </h1>

                    <p className="mt-3 max-w-lg text-[13px] leading-5 text-blue-100">
                        Encontre produtos, conheça fornecedores e organize
                        suas compras de forma simples.
                    </p>

                    <a
                        href="#produtos"
                        className="mt-5 inline-flex h-9 items-center rounded-lg bg-white px-4 text-xs font-semibold text-blue-800 transition hover:bg-blue-50"
                    >
                        Explorar produtos
                        <span className="ml-2" aria-hidden="true">→</span>
                    </a>
                </div>

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full border-[35px] border-white/5"
                />
            </section>

            <section className="mt-7" aria-labelledby="categories-title">
                <h2
                    id="categories-title"
                    className="text-base font-bold tracking-tight"
                >
                    Categorias
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((item) => {
                        const active = category === item;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setCategory(item)}
                                aria-pressed={active}
                                className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${active
                                        ? "border-blue-700 bg-blue-700 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                                    }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section
                id="produtos"
                aria-labelledby="products-title"
                className="mt-7 scroll-mt-24"
            >
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2
                            id="products-title"
                            className="text-lg font-bold tracking-tight"
                        >
                            Produtos disponíveis
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Explore as opções dos fornecedores parceiros.
                        </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        {filteredProducts.length} produto(s)
                    </span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                        <h3 className="text-base font-semibold">
                            Nenhum produto encontrado
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Tente pesquisar outro termo ou selecionar outra categoria.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <article
                                key={product.id}
                                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-sm"
                            >
                                <Link
                                    to={`/produto/${product.id}`}
                                    className="flex h-44 items-center justify-center overflow-hidden border-b border-slate-100 bg-white p-3 sm:h-48"
                                    aria-label={`Ver detalhes de ${product.name}`}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.03]"
                                    />
                                </Link>

                                <div className="flex flex-1 flex-col p-4">
                                    <span className="w-fit rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                        {product.category}
                                    </span>

                                    <h3 className="mt-3 min-h-10 text-sm font-bold leading-5">
                                        <Link
                                            to={`/produto/${product.id}`}
                                            className="transition hover:text-blue-700"
                                        >
                                            {product.name}
                                        </Link>
                                    </h3>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                        Vendido por {product.supplier}
                                    </p>

                                    <div className="mt-auto pt-4">
                                        <p className="text-xl font-bold tracking-tight text-slate-900">
                                            {formatPrice(product.price)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            por {product.unit}
                                        </p>

                                        <Link
                                            to={`/produto/${product.id}`}
                                            className="mt-4 flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white transition hover:bg-blue-800"
                                        >
                                            Ver detalhes
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
