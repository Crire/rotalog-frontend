
import { MetricCard } from "../components/MetricCard";
import { RecentOrders } from "../components/RecentOrders";
import { dashboardMock } from "../mocks/dashboard.mock";

export function SupplierDashboard() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Visão geral
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Acompanhe os principais indicadores e pedidos da sua organização.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardMock.metrics.map((metric) => (
                    <MetricCard
                        key={metric.id}
                        title={metric.title}
                        value={metric.value}
                        description={metric.description}
                    />
                ))}
            </div>

            <RecentOrders orders={dashboardMock.recentOrders} />
        </div>
    );
}
