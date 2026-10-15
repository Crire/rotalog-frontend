
import { createBrowserRouter } from "react-router-dom";
import { SupplierOrders } from "../features/orders/pages/SupplierOrders";
import { AppLayout } from "../shared/components/AppLayout";
import { SupplierDashboard } from "../features/dashboard/pages/SupplierDashboard";
import { FeaturePlaceholder } from "../shared/pages/FeaturePlaceholder";
import { SupplierProducts } from "../features/products/pages/SupplierProducts";
import { SupplierInventory } from "../features/inventory/pages/SupplierInventory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Página não encontrada
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Não foi possível acessar a página solicitada.
          </p>
        </div>
      </div>
    ),
    children: [
      {
        index: true,
        element: <SupplierDashboard />,
      },
      {
        path: "pedidos",
        element: <SupplierOrders />,
      },
      {
        path: "produtos",
        element: <SupplierProducts />,
      },
      {
        path: "estoque",
        element: <SupplierInventory />,
      },
      {
        path: "rotas",
        element: (
          <FeaturePlaceholder
            title="Rotas"
            description="Visualização das rotas e operações logísticas autorizadas."
          />
        ),
      },
      {
        path: "*",
        element: null,
      },
    ],
  },
]);
