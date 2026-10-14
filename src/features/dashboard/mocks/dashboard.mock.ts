
export type OrderStatus =
    | "Pendente"
    | "Em separação"
    | "Em transporte"
    | "Entregue";

export type Order = {
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: OrderStatus;
};

export type DashboardData = {
  organizationId: string;
  metrics: {
    id: string;
    title: string;
    value: number;
    description: string;
  }[];
  recentOrders: Order[];
};

export const dashboardsMock: Record<string, DashboardData> = {
  "fornecedor-001": {
    organizationId: "fornecedor-001",
    metrics: [
      { id: "orders", title: "Pedidos recebidos", value: 128, description: "Total de pedidos" },
      { id: "pending", title: "Pedidos pendentes", value: 18, description: "Aguardando atendimento" },
      { id: "deliveries", title: "Entregas em andamento", value: 12, description: "Pedidos em transporte" },
      { id: "products", title: "Produtos ativos", value: 245, description: "Itens disponíveis no catálogo" },
    ],
    recentOrders: [
      { id: "PED-001", customer: "Empresa Alfa", date: "2026-10-14", amount: 1250, status: "Pendente" },
      { id: "PED-002", customer: "Comercial Beta", date: "2026-10-13", amount: 890, status: "Em separação" },
      { id: "PED-003", customer: "Empresa Gama", date: "2026-10-13", amount: 2340, status: "Em transporte" },
      { id: "PED-004", customer: "Distribuidora Delta", date: "2026-10-12", amount: 560, status: "Entregue" },
    ],
  },
  "fornecedor-002": {
    organizationId: "fornecedor-002",
    metrics: [
      { id: "orders", title: "Pedidos recebidos", value: 47, description: "Total de pedidos" },
      { id: "pending", title: "Pedidos pendentes", value: 6, description: "Aguardando atendimento" },
      { id: "deliveries", title: "Entregas em andamento", value: 3, description: "Pedidos em transporte" },
      { id: "products", title: "Produtos ativos", value: 86, description: "Itens disponíveis no catálogo" },
    ],
    recentOrders: [
      { id: "PED-101", customer: "Mercado Central", date: "2026-10-14", amount: 740, status: "Pendente" },
      { id: "PED-102", customer: "Comércio Amazonas", date: "2026-10-13", amount: 1920, status: "Em separação" },
      { id: "PED-103", customer: "Empresa Sol", date: "2026-10-12", amount: 410, status: "Entregue" },
    ],
  },
};
