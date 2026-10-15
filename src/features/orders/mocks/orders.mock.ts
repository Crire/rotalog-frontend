
export type SupplierOrderStatus =
    | "Pendente"
    | "Em separação"
    | "Em transporte"
    | "Entregue";

export type SupplierOrder = {
    id: string;
    organizationId: string;
    customer: string;
    date: string;
    total: number;
    status: SupplierOrderStatus;
    items: number;
};

export const ordersMock: SupplierOrder[] = [
    {
        id: "PED-001",
        organizationId: "fornecedor-001",
        customer: "Empresa Alfa",
        date: "2026-10-14",
        total: 1250,
        status: "Pendente",
        items: 5,
    },
    {
        id: "PED-002",
        organizationId: "fornecedor-001",
        customer: "Comercial Beta",
        date: "2026-10-13",
        total: 890,
        status: "Em separação",
        items: 3,
    },
    {
        id: "PED-003",
        organizationId: "fornecedor-001",
        customer: "Empresa Gama",
        date: "2026-10-13",
        total: 2340,
        status: "Em transporte",
        items: 8,
    },
    {
        id: "PED-004",
        organizationId: "fornecedor-001",
        customer: "Distribuidora Delta",
        date: "2026-10-12",
        total: 560,
        status: "Entregue",
        items: 2,
    },
    {
        id: "PED-101",
        organizationId: "fornecedor-002",
        customer: "Mercado Central",
        date: "2026-10-14",
        total: 740,
        status: "Pendente",
        items: 4,
    },
    {
        id: "PED-102",
        organizationId: "fornecedor-002",
        customer: "Comércio Amazonas",
        date: "2026-10-13",
        total: 1920,
        status: "Em separação",
        items: 6,
    },
    {
        id: "PED-103",
        organizationId: "fornecedor-002",
        customer: "Empresa Sol",
        date: "2026-10-12",
        total: 410,
        status: "Entregue",
        items: 2,
    },
];
