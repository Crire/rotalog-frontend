
import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">
                    Página não encontrada
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Não foi possível acessar a página solicitada.
                </p>

                <Link
                    to="/"
                    className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                    Voltar ao catálogo
                </Link>
            </div>
        </div>
    );
}
