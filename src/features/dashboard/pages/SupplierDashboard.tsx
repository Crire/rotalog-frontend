
import { useOutletContext } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { RecentOrders } from "../components/RecentOrders";
import { dashboardsMock } from "../mocks/dashboard.mock";
import type { Organization } from "../../organizations/mocks/organizations.mock";

type DashboardContext = {
    activeOrganization: Organization;
};

export function SupplierDashboard() {
    const { activeOrganization } = useOutletContext<DashboardContext>();
    const dashboard = dashboardsMock[activeOrganization.id];

    if (!dashboard) {
        return (
            <div role="alert" className="rounded-xl bg-white p-6 text-slate-600">
                Não há dados disponíveis para esta organização.
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Visão geral
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Indicadores e pedidos de {activeOrganization.name}.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboard.metrics.map((metric) => (
                    <MetricCard
                        key={metric.id}
                        title={metric.title}
                        value={metric.value}
                        description={metric.description}
                    />
                ))}
            </div>

            <RecentOrders orders={dashboard.recentOrders} />
        </div>
    );
}
