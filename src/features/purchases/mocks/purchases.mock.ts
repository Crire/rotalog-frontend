
export type SupplierOrderStatus =
    | "CONFIRMED"
    | "PENDING"
    | "FAILED"
    | "CANCELLED"
    | "PARTIAL";

export type PurchaseItem = {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

export type SupplierOrder = {
    id: string;
    supplierId: string;
    supplierName: string;
    status: SupplierOrderStatus;
    deliveryFee: number;
    deliveryEstimate: string;
    items: PurchaseItem[];
    statusMessage: string;
};

export type Purchase = {
    id: string;
    createdAt: string;
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    acceptsIndependentOrders: boolean;
    acceptsPartialFulfillment: boolean;
    supplierOrders: SupplierOrder[];
};

export const purchasesMock: Purchase[] = [
    {
        id: "COMP-001",
        createdAt: "2026-10-15T10:30:00",
        status: "IN_PROGRESS",
        acceptsIndependentOrders: true,
        acceptsPartialFulfillment: true,
        supplierOrders: [
            {
                id: "PED-C001",
                supplierId: "fornecedor-001",
                supplierName: "Fornecedor Exemplo",
                status: "CONFIRMED",
                deliveryFee: 35,
                deliveryEstimate: "3 a 5 dias úteis",
                statusMessage:
                    "Pedido confirmado pelo fornecedor.",
                items: [
                    {
                        productId: "PROD-001",
                        productName: "Cimento CP II 50kg",
                        quantity: 2,
                        unitPrice: 39.9,
                    },
                    {
                        productId: "PROD-002",
                        productName: "Areia média",
                        quantity: 1,
                        unitPrice: 145,
                    },
                ],
            },
            {
                id: "PED-C002",
                supplierId: "fornecedor-002",
                supplierName: "Distribuidora Norte",
                status: "PENDING",
                deliveryFee: 25,
                deliveryEstimate: "2 a 4 dias úteis",
                statusMessage:
                    "Aguardando confirmação do fornecedor.",
                items: [
                    {
                        productId: "PROD-101",
                        productName: "Tinta acrílica branca 18L",
                        quantity: 1,
                        unitPrice: 219.9,
                    },
                ],
            },
        ],
    },
    {
        id: "COMP-002",
        createdAt: "2026-10-14T14:00:00",
        status: "IN_PROGRESS",
        acceptsIndependentOrders: true,
        acceptsPartialFulfillment: false,
        supplierOrders: [
            {
                id: "PED-C003",
                supplierId: "fornecedor-001",
                supplierName: "Fornecedor Exemplo",
                status: "CONFIRMED",
                deliveryFee: 35,
                deliveryEstimate: "3 a 5 dias úteis",
                statusMessage:
                    "Pedido confirmado e mantido ativo.",
                items: [
                    {
                        productId: "PROD-001",
                        productName: "Cimento CP II 50kg",
                        quantity: 1,
                        unitPrice: 39.9,
                    },
                ],
            },
            {
                id: "PED-C004",
                supplierId: "fornecedor-002",
                supplierName: "Distribuidora Norte",
                status: "FAILED",
                deliveryFee: 25,
                deliveryEstimate: "Indisponível",
                statusMessage:
                    "Falha no processamento deste pedido. O outro pedido permanece confirmado.",
                items: [
                    {
                        productId: "PROD-101",
                        productName: "Tinta acrílica branca 18L",
                        quantity: 1,
                        unitPrice: 219.9,
                    },
                ],
            },
        ],
    },
];

export function getPurchaseById(id: string) {
    return purchasesMock.find(
        (purchase) => purchase.id === id
    );
}

export function calculateSupplierOrderTotal(
    order: SupplierOrder
) {
    const subtotal = order.items.reduce(
        (total, item) =>
            total + item.quantity * item.unitPrice,
        0
    );

    return subtotal + order.deliveryFee;
}
