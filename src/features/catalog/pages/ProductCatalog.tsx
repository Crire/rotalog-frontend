
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { catalogProducts } from "../mocks/products.mock";

const categories = [
    "Todos",
    "Construção",
    "Pintura",
    "Ferramentas",
];

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function ProductCatalog() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [menuOpen, setMenuOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return catalogProducts.filter((product) => {
            const matchesCategory =
                category === "Todos" || product.category === category;

            const searchText = search.toLocaleLowerCase("pt-BR");

            const matchesSearch =
                product.name.toLocaleLowerCase("pt-BR").includes(searchText) ||
                product.supplier.toLocaleLowerCase("pt-BR").includes(searchText);

            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    return (
        <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <div className="flex min-h-18 items-center gap-4 px-4 py-3 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        className="rounded-lg border border-slate-200 p-2 text-xl lg:hidden"
                        aria-label="Abrir ou fechar menu"
                        aria-expanded={menuOpen}
                    >
                        ☰
                    </button>

                    <Link to="/" className="flex shrink-0 items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
                            R
                        </span>
                        <span className="text-xl font-extrabold tracking-tight">
                            RotaLog
                        </span>
                    </Link>

                    <div className="mx-auto hidden w-full max-w-xl md:block">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar produtos ou fornecedores..."
                            aria-label="Buscar produtos"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <Link
                            to="/comprador/carrinho"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            Carrinho
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Entrar
                        </Link>
                    </div>
                </div>

                <div className="px-4 pb-3 md:hidden">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar produtos..."
                        aria-label="Buscar produtos"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </header>

            <div className="mx-auto flex max-w-[1600px]">
                <aside
                    className={`w-60 shrink-0 border-r border-slate-200 bg-white p-5 ${menuOpen
                            ? "fixed bottom-0 left-0 top-[116px] z-20 block overflow-y-auto shadow-xl"
                            : "hidden"
                        } lg:sticky lg:top-[73px] lg:block lg:h-[calc(100vh-73px)]`}
                >
                    <nav className="space-y-2 text-sm">
                        <Link
                            to="/"
                            className="block rounded-lg bg-blue-50 px-4 py-3 font-semibold text-blue-700"
                        >
                            Catálogo de produtos
                        </Link>

                        <Link
                            to="/comprador/compras"
                            className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
                        >
                            Minhas compras
                        </Link>

                        <Link
                            to="/comprador/carrinho"
                            className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
                        >
                            Meu carrinho
                        </Link>

                        <Link
                            to="/login"
                            className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
                        >
                            Minha conta
                        </Link>
                    </nav>

                    <div className="mt-10 rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-bold">Venda no RotaLog</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Cadastre sua empresa e alcance novos compradores.
                        </p>

                        <Link
                            to="/cadastro"
                            className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
                        >
                            Começar agora →
                        </Link>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#102653] to-[#2457a7] p-6 text-white sm:p-10">
                        <div className="relative z-10 max-w-xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                                Marketplace RotaLog
                            </span>

                            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
                                Tudo o que seu negócio precisa em um só lugar.
                            </h1>

                            <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100">
                                Encontre produtos, compare fornecedores e organize suas
                                compras com mais praticidade.
                            </p>

                            <a
                                href="#produtos"
                                className="mt-6 inline-block rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50"
                            >
                                Explorar produtos
                            </a>
                        </div>

                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
                        />
                    </section>

                    <section className="mt-8" aria-label="Categorias">
                        <h2 className="text-xl font-bold">Categorias</h2>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    aria-pressed={category === item}
                                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${category === item
                                            ? "border-blue-700 bg-blue-700 text-white"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section id="produtos" className="mt-9 scroll-mt-28">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">Produtos disponíveis</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Explore as opções dos fornecedores parceiros.
                                </p>
                            </div>

                            <span className="text-sm text-slate-500">
                                {filteredProducts.length} produto(s)
                            </span>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center">
                                <h3 className="font-semibold">
                                    Nenhum produto encontrado
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Tente pesquisar outro termo ou categoria.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <article
                                        key={product.id}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="p-4">
                                            <span className="text-xs font-semibold text-blue-700">
                                                {product.category}
                                            </span>

                                            <h3 className="mt-2 min-h-12 text-base font-bold leading-6">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Vendido por {product.supplier}
                                            </p>

                                            <div className="mt-4">
                                                <p className="text-xl font-extrabold text-slate-900">
                                                    {currency.format(product.price)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    por {product.unit}
                                                </p>
                                            </div>

                                            <Link
                                                to={`/produto/${product.id}`}
                                                className="mt-5 block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
                                            >
                                                Ver detalhes
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
                        © 2026 RotaLog. Todos os direitos reservados.
                    </footer>
                </main>
            </div>
        </div>
    );
}
