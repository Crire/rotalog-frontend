
import { NavLink } from "react-router-dom";

import { appRoutes } from "../../app/routePermissions";
import type { Permission } from "../../features/auth/mocks/users.mock";

type PortalType = "supplier" | "buyer";

type SidebarProps = {
    permissions: Permission[];
    portal?: PortalType;
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
}: SidebarProps) {
    const routes =
        portal === "buyer" ? buyerRoutes : appRoutes;

    const visibleItems = routes.filter((route) =>
        permissions.includes(route.permission)
    );

    return (
        <aside className="h-full w-64 overflow-y-auto bg-slate-900 p-5 text-white">
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
                            `block rounded-lg px-4 py-3 text-sm transition-colors ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`
                        }
                    >
                        {route.label}
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
        </aside>
    );
}
