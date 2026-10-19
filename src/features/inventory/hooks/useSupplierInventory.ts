import { useEffect, useState } from "react";
import { useSupplierProducts } from "../../products/hooks/useSupplierProducts";
import { getSupplierOrders, subscribeSupplierOrders } from "../../orders/services/supplierOrders.service";
import { getStockBalance } from "../services/stockReservation";
import type { ProductAvailability } from "../../products/mocks/products.mock";

export function useSupplierInventory(organizationId: string) {
    const catalog = useSupplierProducts(organizationId);
    const [orders, setOrders] = useState(getSupplierOrders);
    useEffect(() => {
        const refresh = () => setOrders(getSupplierOrders());
        const unsubscribe = subscribeSupplierOrders(refresh);
        refresh();
        return unsubscribe;
    }, []);
    try {
        const products = catalog.products.map((product) => {
            const balance = getStockBalance(product, orders);
            const availability: ProductAvailability = balance.available === 0 ? "Indisponível" : balance.available <= 10 ? "Estoque baixo" : "Disponível";
            return { ...product, ...balance, availability };
        });
        return { products, error: catalog.error };
    } catch (error) {
        return { products: [], error: error instanceof Error ? error.message : "Falha ao calcular reservas." };
    }
}
