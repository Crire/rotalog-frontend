
import { Link } from "react-router-dom";

export function BuyerPurchases() {
    return (
        <div className="mx-auto w-full max-w-[960px] text-slate-900">
            <header className="mb-6">
                <p className="text-xs font-semibold text-blue-700">
                    RotaLog • Portal do Comprador
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Minhas compras
                </h1>

                <p className="mt-2 text-[13px] leading-5 text-slate-600">
                    Acompanhe seus pedidos, consulte os detalhes das compras
                    e visualize o andamento das entregas.
                </p>
            </header>

            <section
                aria-label="Histórico de compras"
                className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"
            >
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
                        <path d="M6 7h12l1 13H5L6 7Z" />
                        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                        <path d="M9 15h6" />
                    </svg>
                </div>

                <h2 className="mt-5 text-lg font-semibold tracking-tight">
                    Você ainda não realizou nenhuma compra
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                    Quando você realizar sua primeira compra, poderá acompanhar
                    os pedidos de cada fornecedor e consultar o histórico
                    completo aqui.
                </p>

                <Link
                    to="/"
                    className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                    Explorar produtos
                    <span className="ml-2" aria-hidden="true">
                        →
                    </span>
                </Link>
            </section>
        </div>
    );
}
