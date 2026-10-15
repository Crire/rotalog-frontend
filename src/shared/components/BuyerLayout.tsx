
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { usersMock } from "../../features/auth/mocks/users.mock";

export function BuyerLayout() {
    const [activeUserId, setActiveUserId] = useState("user-004");
    const [menuOpen, setMenuOpen] = useState(false);

    const activeUser = usersMock.find(
        (user) => user.id === activeUserId
    );

    const hasAccess =
        activeUser?.role === "BUYER_ADMIN" &&
        activeUser.permissions.includes("purchases:view");

    function handleUserChange(userId: string) {
        setActiveUserId(userId);
        setMenuOpen(false);
    }

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900">
            <div className="sticky top-0 hidden h-screen shrink-0 self-start md:block">
                <Sidebar
                    portal="buyer"
                    permissions={hasAccess ? activeUser!.permissions : []}
                />
            </div>

            {menuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/60"
                        aria-label="Fechar menu"
                        onClick={() => setMenuOpen(false)}
                    />

                    <div className="relative z-10 h-full w-64 overflow-y-auto">
                        <Sidebar
                            portal="buyer"
                            permissions={hasAccess ? activeUser!.permissions : []}
                        />
                    </div>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Abrir menu"
                        aria-expanded={menuOpen}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                    >
                        ☰ Menu
                    </button>
                </div>

                <Header
                    userName={activeUser?.name ?? "Usuário desconhecido"}
                    userRole={activeUser?.role ?? "Sem perfil"}
                    users={usersMock}
                    activeUserId={activeUserId}
                    onUserChange={handleUserChange}
                />

                <main className="w-full min-w-0 flex-1 p-4 sm:p-6">
                    {!hasAccess ? (
                        <div
                            role="alert"
                            className="mx-auto max-w-7xl rounded-xl border border-red-200 bg-white p-6 shadow-sm"
                        >
                            <p className="text-sm font-semibold text-red-700">
                                Erro 403
                            </p>

                            <h1 className="mt-2 text-2xl font-bold">
                                Acesso não autorizado
                            </h1>

                            <p className="mt-2 text-sm text-slate-600">
                                O usuário selecionado não possui permissão
                                para acessar o Portal do Comprador.
                            </p>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>

                <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
                    RotaLog © 2026 — Todos os direitos reservados.
                </footer>
            </div>
        </div>
    );
}
