
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import type { SupplierCart } from "../mocks/cart.mock";

import {
    CartContext,
    type AddCartProduct,
} from "./CartContext";

type CartProviderProps = {
    children: ReactNode;
};

const CART_KEY_PREFIX = "rotalog:cart:";

function getCartKey(userId: string) {
    return `${CART_KEY_PREFIX}${userId}`;
}

function isSupplierCartArray(value: unknown): value is SupplierCart[] {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((supplier: unknown) => {
        if (typeof supplier !== "object" || supplier === null) {
            return false;
        }

        if (
            !("supplierId" in supplier) ||
            !("supplierName" in supplier) ||
            !("deliveryFee" in supplier) ||
            !("deliveryEstimate" in supplier) ||
            !("deliveryPolicy" in supplier) ||
            !("items" in supplier)
        ) {
            return false;
        }

        return (
            typeof supplier.supplierId === "string" &&
            typeof supplier.supplierName === "string" &&
            typeof supplier.deliveryFee === "number" &&
            Number.isFinite(supplier.deliveryFee) &&
            supplier.deliveryFee >= 0 &&
            typeof supplier.deliveryEstimate === "string" &&
            typeof supplier.deliveryPolicy === "string" &&
            Array.isArray(supplier.items) &&
            supplier.items.every((item: unknown) => {
                if (typeof item !== "object" || item === null) {
                    return false;
                }

                if (
                    !("id" in item) ||
                    !("productName" in item) ||
                    !("quantity" in item) ||
                    !("unitPrice" in item)
                ) {
                    return false;
                }

                return (
                    typeof item.id === "string" &&
                    typeof item.productName === "string" &&
                    typeof item.quantity === "number" &&
                    Number.isInteger(item.quantity) &&
                    item.quantity >= 1 &&
                    typeof item.unitPrice === "number" &&
                    Number.isFinite(item.unitPrice) &&
                    item.unitPrice >= 0
                );
            })
        );
    });
}

function loadCart(userId: string): SupplierCart[] {
    try {
        const storedCart = sessionStorage.getItem(getCartKey(userId));

        if (!storedCart) {
            return [];
        }

        const parsedCart: unknown = JSON.parse(storedCart);

        if (!isSupplierCartArray(parsedCart)) {
            sessionStorage.removeItem(getCartKey(userId));
            return [];
        }

        return parsedCart;
    } catch {
        return [];
    }
}

export function CartProvider({ children }: CartProviderProps) {
    const { user } = useAuth();

    const userId = user?.role === "BUYER_ADMIN" ? user.id : null;

    const [cartState, setCartState] = useState<{
        userId: string | null;
        suppliers: SupplierCart[];
    }>(() => ({
        userId,
        suppliers: userId ? loadCart(userId) : [],
    }));

    const suppliers =
        userId !== null && cartState.userId === userId
            ? cartState.suppliers
            : [];

    useEffect(() => {
        if (!userId || cartState.userId !== userId) {
            return;
        }

        try {
            sessionStorage.setItem(
                getCartKey(userId),
                JSON.stringify(cartState.suppliers)
            );
        } catch {
            // O carrinho continua funcionando em memória.
        }
    }, [userId, cartState]);

    function updateCart(
        updater: (current: SupplierCart[]) => SupplierCart[]
    ) {
        if (!userId) {
            return;
        }

        setCartState((current) => {
            const currentSuppliers =
                current.userId === userId
                    ? current.suppliers
                    : loadCart(userId);

            return {
                userId,
                suppliers: updater(currentSuppliers),
            };
        });
    }

    function clearCart() {
        const currentUserId = cartState.userId;

        if (currentUserId) {
            try {
                sessionStorage.removeItem(getCartKey(currentUserId));
            } catch {
                // A limpeza do estado em memória continua.
            }
        }

        setCartState({
            userId: null,
            suppliers: [],
        });
    }

    function addToCart(product: AddCartProduct) {
        if (
            !Number.isInteger(product.quantity) ||
            product.quantity < 1 ||
            !Number.isFinite(product.unitPrice) ||
            product.unitPrice < 0
        ) {
            return;
        }

        updateCart((current) => {
            const supplierExists = current.some(
                (supplier) => supplier.supplierId === product.supplierId
            );

            if (!supplierExists) {
                return [
                    ...current,
                    {
                        supplierId: product.supplierId,
                        supplierName: product.supplierName,
                        deliveryFee: 0,
                        deliveryEstimate: "A confirmar",
                        deliveryPolicy:
                            "Frete e condições sujeitos à confirmação.",
                        items: [
                            {
                                id: product.productId,
                                productName: product.productName,
                                quantity: product.quantity,
                                unitPrice: product.unitPrice,
                            },
                        ],
                    },
                ];
            }

            return current.map((supplier) => {
                if (supplier.supplierId !== product.supplierId) {
                    return supplier;
                }

                const itemExists = supplier.items.some(
                    (item) => item.id === product.productId
                );

                if (!itemExists) {
                    return {
                        ...supplier,
                        items: [
                            ...supplier.items,
                            {
                                id: product.productId,
                                productName: product.productName,
                                quantity: product.quantity,
                                unitPrice: product.unitPrice,
                            },
                        ],
                    };
                }

                return {
                    ...supplier,
                    items: supplier.items.map((item) =>
                        item.id === product.productId
                            ? {
                                ...item,
                                quantity: item.quantity + product.quantity,
                            }
                            : item
                    ),
                };
            });
        });
    }

    function removeFromCart(
        supplierId: string,
        productId: string
    ) {
        updateCart((current) =>
            current
                .map((supplier) =>
                    supplier.supplierId === supplierId
                        ? {
                            ...supplier,
                            items: supplier.items.filter(
                                (item) => item.id !== productId
                            ),
                        }
                        : supplier
                )
                .filter((supplier) => supplier.items.length > 0)
        );
    }

    function updateQuantity(
        supplierId: string,
        productId: string,
        quantity: number
    ) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            return;
        }

        updateCart((current) =>
            current.map((supplier) =>
                supplier.supplierId === supplierId
                    ? {
                        ...supplier,
                        items: supplier.items.map((item) =>
                            item.id === productId
                                ? { ...item, quantity }
                                : item
                        ),
                    }
                    : supplier
            )
        );
    }

    return (
        <CartContext.Provider
            value={{
                suppliers,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
