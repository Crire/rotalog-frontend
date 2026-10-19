
import { createContext } from "react";
import type { SupplierCart } from "../mocks/cart.mock";

export type AddCartProduct = {
    supplierId: string;
    supplierName: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

export type CartContextValue = {
    clearCart: () => void;
    suppliers: SupplierCart[];
    addToCart: (product: AddCartProduct) => void;
    removeFromCart: (supplierId: string, productId: string) => void;
    updateQuantity: (
        supplierId: string,
        productId: string,
        quantity: number
    ) => void;
};

export const CartContext = createContext<CartContextValue | null>(
    null
);
