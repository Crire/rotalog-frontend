
export type CatalogProduct = {
    id: string;
    name: string;
    category: string;
    supplierId: string;
    supplier: string;
    price: number;
    unit: string;
    image: string;
    description: string;
    available: boolean;
};

export const catalogProducts: CatalogProduct[] = [
    {
        id: "produto-001",
        name: "Cimento CP II 50 kg",
        category: "Construção",
        supplierId: "fornecedor-001",
        supplier: "Construmax",
        price: 39.9,
        unit: "saco",
        image: "/images/products/cimento.jpg",
        description:
            "Cimento para aplicações gerais em obras, reformas e serviços de construção civil.",
        available: true,
    },
    {
        id: "produto-002",
        name: "Areia lavada",
        category: "Construção",
        supplierId: "fornecedor-002",
        supplier: "Materiais Norte",
        price: 180,
        unit: "m³",
        image: "/images/products/areia.jpg",
        description:
            "Areia lavada para utilização em argamassas, concretos e outras aplicações na construção.",
        available: true,
    },
    {
        id: "produto-003",
        name: "Tinta acrílica branca 18 L",
        category: "Pintura",
        supplierId: "fornecedor-003",
        supplier: "Tintas Brasil",
        price: 219.9,
        unit: "lata",
        image: "/images/products/tinta.jpg",
        description:
            "Tinta acrílica branca para pintura de paredes e superfícies internas e externas, conforme as especificações do fabricante.",
        available: true,
    },
    {
        id: "produto-004",
        name: "Kit ferramentas manuais",
        category: "Ferramentas",
        supplierId: "fornecedor-004",
        supplier: "Ferramentas Pro",
        price: 149.9,
        unit: "kit",
        image: "/images/products/ferramentas.jpg",
        description:
            "Kit de ferramentas manuais para manutenção, montagem e pequenos reparos.",
        available: true,
    },
];

export const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
