
import { NavLink } from "react-router-dom";

type Permission =
    | "dashboard:view"
    | "orders:view"
    | "products:view"
    | "inventory:view"
    | "routes:view";

type SidebarProps = {
    permissions: Permission[];
};

const menuItems: {
    label: string;
    path: string;
    permission: Permission;
}[] = [
        {
            label: "Dashboard",
            path: "/",
            permission: "dashboard:view",
        },
        {
            label: "Pedidos",
            path: "/pedidos",
            permission: "orders:view",
        },
        {
            label: "Produtos",
            path: "/produtos",
            permission: "products:view",
        },
        {
            label: "Estoque",
            path: "/estoque",
            permission: "inventory:view",
        },
        {
            label: "Rotas",
            path: "/rotas",
            permission: "routes:view",
        },
    ];

export function Sidebar({ permissions }: SidebarProps) {
    const visibleItems = menuItems.filter((item) =>
        permissions.includes(item.permission)
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
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-3 text-sm transition-colors ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
