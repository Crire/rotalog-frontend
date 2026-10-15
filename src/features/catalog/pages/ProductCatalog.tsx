
import { Link } from "react-router-dom";

const products = [
    {
        id: "produto-001",
        name: "Cimento CP II 50kg",
        supplier: "Fornecedor Exemplo",
        price: 39.9,
        category: "Materiais de construção",
    },
    {
        id: "produto-002",
        name: "Areia média",
        supplier: "Fornecedor Exemplo",
        price: 145,
        category: "Agregados",
    },
    {
        id: "produto-003",
        name: "Tinta acrílica 18L",
        supplier: "Distribuidora Norte",
        price: 219.9,
        category: "Tintas",
    },
];

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function ProductCatalog() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <Link to="/" className="text-2xl font-bold text-blue-700">
                        RotaLog
                    </Link>

                    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <Link
                            to="/comprador/carrinho"
                            className="text-slate-700 hover:text-blue-700"
                        >
                            Carrinho
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                        >
                            Entrar
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <section className="mb-10 rounded-2xl bg-slate-900 px-8 py-12 text-white">
                    <p className="mb-3 text-sm font-semibold text-blue-300">
                        Marketplace RotaLog
                    </p>

                    <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
                        Encontre os materiais que você precisa
                    </h1>

                    <p className="mt-4 max-w-2xl text-slate-300">
                        Compare produtos de diferentes fornecedores e organize
                        suas compras em um só lugar.
                    </p>
                </section>

                <section>
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Produtos disponíveis
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Catálogo demonstrativo com dados simulados.
                            </p>
                        </div>

                        <span className="text-sm text-slate-500">
                            {products.length} produtos
                        </span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex h-44 items-center justify-center bg-slate-100">
                                    <span className="text-sm text-slate-400">
                                        Imagem do produto
                                    </span>
                                </div>

                                <div className="p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                        {product.category}
                                    </p>

                                    <h3 className="mt-2 text-lg font-semibold">
                                        {product.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {product.supplier}
                                    </p>

                                    <p className="mt-5 text-2xl font-bold">
                                        {currency.format(product.price)}
                                    </p>

                                    <Link
                                        to="/comprador/carrinho"
                                        className="mt-5 block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
                                    >
                                        Ver carrinho demonstrativo
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-5 text-center text-xs text-slate-500">
                RotaLog © 2026 — Todos os direitos reservados.
            </footer>
        </div>
    );
}
