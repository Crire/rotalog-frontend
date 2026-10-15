
/**
 * ROT-015-FE
 * Papéis oficiais do Documento Técnico V5.
 * Usuários, vínculos e capacidades abaixo são mocks.
 * A matriz definitiva será fornecida pelo Backend.
 */

export type UserRole =
    | "BUYER_ADMIN"
    | "SUPPLIER_OPERATOR"
    | "ROUTE_PLANNER"
    | "DRIVER"
    | "INTEGRATION_OPERATOR"
    | "ROTALOG_ADMIN"
    | "ROTALOG_OPERATOR"
    | "ROTALOG_REVIEWER"
    | "REVIEW_MODERATOR"
    | "DEMO_OPERATOR";

export type Permission =
    | "dashboard:view"
    | "orders:view"
    | "products:view"
    | "inventory:view"
    | "routes:view"
    | "organizations:manage";

export type MockUser = {
    id: string;
    name: string;
    role: UserRole;
    organizationIds: string[];
    permissions: Permission[];
};

export const usersMock: MockUser[] = [
    {
        id: "user-001",
        name: "Usuário Fornecedor",
        role: "SUPPLIER_OPERATOR",
        organizationIds: ["fornecedor-001", "fornecedor-002"],
        permissions: [
            "dashboard:view",
            "orders:view",
            "products:view",
            "inventory:view",
        ],
    },
    {
        id: "user-002",
        name: "Usuário de Rotas",
        role: "ROUTE_PLANNER",
        organizationIds: ["fornecedor-001"],
        permissions: [
            "dashboard:view",
            "routes:view",
        ],
    },
    {
        id: "user-003",
        name: "Administrador RotaLog",
        role: "ROTALOG_ADMIN",
        organizationIds: ["fornecedor-001", "fornecedor-002"],
        permissions: [
            "dashboard:view",
            "orders:view",
            "products:view",
            "inventory:view",
            "routes:view",
            "organizations:manage",
        ],
    },
];
