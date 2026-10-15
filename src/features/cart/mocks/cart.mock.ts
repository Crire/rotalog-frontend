
export type CartItem = {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

export type SupplierCart = {
    supplierId: string;
    supplierName: string;
    deliveryFee: number;
    deliveryEstimate: string;
    deliveryPolicy: string;
    items: CartItem[];
};

export const cartMock: SupplierCart[] = [
    {
        supplierId: "fornecedor-001",
        supplierName: "Fornecedor Exemplo",
        deliveryFee: 35,
        deliveryEstimate: "3 a 5 dias úteis",
        deliveryPolicy: "Entrega conforme disponibilidade dos produtos.",
        items: [
            {
                id: "PROD-001",
                productName: "Cimento CP II 50kg",
                quantity: 2,
                unitPrice: 39.9,
            },
            {
                id: "PROD-002",
                productName: "Areia média",
                quantity: 1,
                unitPrice: 145,
            },
        ],
    },
    {
        supplierId: "fornecedor-002",
        supplierName: "Distribuidora Norte",
        deliveryFee: 25,
        deliveryEstimate: "2 a 4 dias úteis",
        deliveryPolicy: "Entrega sujeita à confirmação do fornecedor.",
        items: [
            {
                id: "PROD-101",
                productName: "Tinta acrílica branca 18L",
                quantity: 1,
                unitPrice: 219.9,
            },
        ],
    },
];
