import type { ReactNode } from "react";

import { NavLink } from "react-router-dom";

import { appRoutes } from "../../app/routePermissions";
import type { Permission } from "../../features/auth/mocks/users.mock";

type PortalType = "supplier" | "buyer";

type SidebarProps = {
    permissions: Permission[];
    portal?: PortalType;
    pendingOrdersCount?: number;
    organizationName?: string;
    onLogout?: () => void;
    developmentControls?: ReactNode;
};

const buyerRoutes = [
    {
        path: "/comprador/carrinho",
        label: "Meu carrinho",
        permission: "purchases:view" as Permission,
    },
    {
        path: "/comprador/compras",
        label: "Minhas compras",
        permission: "purchases:view" as Permission,
    },
];

export function Sidebar({
    permissions,
    portal = "supplier",
    pendingOrdersCount = 0,
    organizationName,
    onLogout,
    developmentControls,
}: SidebarProps) {
    const routes =
        portal === "buyer" ? buyerRoutes : appRoutes;

    const visibleItems = routes.filter((route) =>
        permissions.includes(route.permission)
    );

    return (
        <aside className={`${portal === "supplier" ? "flex min-h-full flex-col" : ""} h-full w-64 overflow-y-auto bg-slate-900 p-5 text-white`}>
            <div className="mb-10">
                <NavLink
                    to={portal === "buyer" ? "/" : "/fornecedor"}
                    className="block text-2xl font-bold text-white"
                >
                    RotaLog
                </NavLink>

                <p className="mt-1 text-sm text-slate-400">
                    {portal === "buyer"
                        ? "Portal do Comprador"
                        : "Portal do Fornecedor"}
                </p>
            </div>

            <nav aria-label="Menu principal" className="space-y-2">
                {visibleItems.map((route) => (
                    <NavLink
                        key={route.path}
                        to={route.path}
                        end={
                            route.path === "/fornecedor" ||
                            route.path === "/comprador/carrinho"
                        }
                        className={({ isActive }) =>
                            `flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`
                        }
                    >
                        {route.label}
                        {portal === "supplier" && route.path === "/fornecedor/pedidos" && pendingOrdersCount > 0 && (
                            <span
                                className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white"
                                aria-label={`${pendingOrdersCount} ${pendingOrdersCount === 1 ? "pedido aguardando aceite" : "pedidos aguardando aceite"}`}
                                aria-live="polite"
                            >
                                {pendingOrdersCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {portal === "buyer" && (
                <div className="mt-8 border-t border-slate-700 pt-5">
                    <NavLink
                        to="/"
                        className="block rounded-lg px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                        Voltar ao catálogo
                    </NavLink>
                </div>
            )}
            {portal === "supplier" && organizationName && (
                <div className="mt-auto pt-8">
                    {import.meta.env.DEV && developmentControls}
                    <div className="border-t border-slate-700 pt-4">
                        <div className="flex items-center gap-3 px-2">
                            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-blue-300">
                                {organizationName.trim().charAt(0).toUpperCase()}
                            </span>
                            <p className="min-w-0 break-words text-sm font-semibold text-slate-100">{organizationName}</p>
                        </div>
                        {onLogout && <button type="button" onClick={onLogout} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-red-950 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                            Sair
                        </button>}
                    </div>
                </div>
            )}
        </aside>
    );
}
