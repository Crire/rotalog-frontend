import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { RecentOrders } from "../components/RecentOrders";
import type { Organization } from "../../organizations/mocks/organizations.mock";
import { getSupplierOrders, subscribeSupplierOrders } from "../../orders/services/supplierOrders.service";
import { getOrderDisplayIds } from "../../orders/utils/orderDisplayId";

type DashboardContext = { activeOrganization: Organization };

export function SupplierDashboard() {
    const { activeOrganization } = useOutletContext<DashboardContext>();
    const [orders, setOrders] = useState(getSupplierOrders);

    useEffect(() => {
        const refresh = () => setOrders(getSupplierOrders());
        const unsubscribe = subscribeSupplierOrders(refresh);
        refresh();
        return unsubscribe;
    }, []);

    const organizationOrders = orders.filter((order) => order.organizationId === activeOrganization.id);
    // Calcula os rótulos antes da ordenação para manter a identificação do Kanban.
    const displayIds = getOrderDisplayIds(orders);
    const recentOrders = [...organizationOrders].sort((a, b) =>
        b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
    );
    const metrics = [
        { id: "received", title: "Pedidos recebidos", value: organizationOrders.length },
        { id: "pending", title: "Aguardando aceite", value: organizationOrders.filter((order) => order.commercialStatus === "Aguardando aceite").length },
        { id: "preparing", title: "Em preparação", value: organizationOrders.filter((order) => order.commercialStatus === "Aceito" && (order.custodyStatus === "Aguardando separação" || order.custodyStatus === "Em separação")).length },
        { id: "ready", title: "Prontos para coleta", value: organizationOrders.filter((order) => order.custodyStatus === "Pronto para coleta").length },
    ];

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Visão geral</h1>
                <p className="mt-2 text-sm text-slate-600">Indicadores e pedidos de {activeOrganization.name}.</p>
            </div>
            <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <Link key={metric.id} to="/fornecedor/pedidos" aria-label={`${metric.title}: ${metric.value}. Ver pedidos`} className="flex h-full min-w-0 rounded-xl transition hover:ring-2 hover:ring-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <MetricCard title={metric.title} value={metric.value} />
                    </Link>
                ))}
            </div>
            <RecentOrders orders={recentOrders} displayIds={displayIds} />
        </div>
    );
}
