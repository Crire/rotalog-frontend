
import type { Permission } from "../features/auth/mocks/users.mock";

/**
 * ROT-015-FE
 *
 * Configuração provisória de navegação e permissões.
 * As capacidades definitivas serão integradas à API.
 */

export type AppRoute = {
    path: string;
    label: string;
    permission: Permission;
};

export const appRoutes: AppRoute[] = [
    {
        path: "/fornecedor",
        label: "Dashboard",
        permission: "dashboard:view",
    },
    {
        path: "/fornecedor/pedidos",
        label: "Pedidos",
        permission: "orders:view",
    },
    {
        path: "/fornecedor/produtos",
        label: "Produtos",
        permission: "products:view",
    },
    {
        path: "/fornecedor/estoque",
        label: "Estoque",
        permission: "inventory:view",
    },
    {
        path: "/fornecedor/rotas",
        label: "Rotas",
        permission: "routes:view",
    },
];

export function getRoutePermission(
    pathname: string
): Permission | undefined {
    return appRoutes.find(
        (route) => route.path === pathname
    )?.permission;
}

export function getFirstAllowedRoute(
    permissions: Permission[]
): string | null {
    return (
        appRoutes.find((route) =>
            permissions.includes(route.permission)
        )?.path ?? null
    );
}

export function canAccessRoute(
    pathname: string,
    permissions: Permission[]
): boolean {
    const requiredPermission = getRoutePermission(pathname);

    return (
        requiredPermission !== undefined &&
        permissions.includes(requiredPermission)
    );
}
