
import { NavLink } from "react-router-dom";

import { appRoutes } from "../../app/routePermissions";
import type { Permission } from "../../features/auth/mocks/users.mock";

type SidebarProps = {
    permissions: Permission[];
};

export function Sidebar({ permissions }: SidebarProps) {
    const visibleItems = appRoutes.filter((route) =>
        permissions.includes(route.permission)
    );

    return (
        <aside className="h-full w-64 overflow-y-auto bg-slate-900 p-5 text-white">
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-white">
                    RotaLog
                </h1>

                <p className="text-sm text-slate-400">
                    Portal do Fornecedor
                </p>
            </div>

            <nav aria-label="Menu principal" className="space-y-2">
                {visibleItems.map((route) => (
                    <NavLink
                        key={route.path}
                        to={route.path}
                        end={route.path === "/"}
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
        </aside>
    );
}
