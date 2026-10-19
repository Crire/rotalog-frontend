import type { SupplierOrder } from "../mocks/orders.mock";

// A ordem persistida permanece estável nas transições e novos testes são anexados.
// Os rótulos são derivados sem regravar os pedidos no armazenamento.
export function getOrderDisplayIds(orders: SupplierOrder[]): Map<string, string> {
    const labels = new Map<string, string>();
    const reserved = new Set(orders.map((order) => order.id));
    let sequence = 1;
    for (const order of orders) {
        if (!/^TESTE-[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(order.id)) {
            labels.set(order.id, order.id);
            continue;
        }
        if (labels.has(order.id)) continue;
        let label: string;
        do {
            label = `TESTE-${String(sequence++).padStart(3, "0")}`;
        } while (reserved.has(label));
        reserved.add(label);
        labels.set(order.id, label);
    }
    return labels;
}
