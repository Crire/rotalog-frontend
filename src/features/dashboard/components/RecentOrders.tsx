
import type { Order, OrderStatus } from "../mocks/dashboard.mock";

type RecentOrdersProps = {
    orders: Order[];
};

const statusStyles: Record<OrderStatus, string> = {
    Pendente: "bg-amber-100 text-amber-800",
    "Em separação": "bg-blue-100 text-blue-800",
    "Em transporte": "bg-violet-100 text-violet-800",
    Entregue: "bg-emerald-100 text-emerald-800",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function RecentOrders({ orders }: RecentOrdersProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    Pedidos recentes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Últimas movimentações do fornecedor
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th scope="col" className="px-5 py-3">Pedido</th>
                            <th scope="col" className="px-5 py-3">Cliente</th>
                            <th scope="col" className="px-5 py-3">Data</th>
                            <th scope="col" className="px-5 py-3">Valor</th>
                            <th scope="col" className="px-5 py-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="border-t border-slate-100"
                            >
                                <td className="px-5 py-4 font-medium text-slate-900">
                                    {order.id}
                                </td>
                                <td className="px-5 py-4">{order.customer}</td>
                                <td className="px-5 py-4">
                                    {order.date.split("-").reverse().join("/")}
                                </td>
                                <td className="px-5 py-4">
                                    {currencyFormatter.format(order.amount)}
                                </td>
                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status]
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
