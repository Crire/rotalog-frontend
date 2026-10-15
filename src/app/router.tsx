
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../shared/components/AppLayout";
import { BuyerLayout } from "../shared/components/BuyerLayout";
import { FeaturePlaceholder } from "../shared/pages/FeaturePlaceholder";

import { SupplierDashboard } from "../features/dashboard/pages/SupplierDashboard";
import { SupplierOrders } from "../features/orders/pages/SupplierOrders";
import { SupplierProducts } from "../features/products/pages/SupplierProducts";
import { SupplierInventory } from "../features/inventory/pages/SupplierInventory";

import { BuyerCart } from "../features/cart/pages/BuyerCart";
import { BuyerPurchases } from "../features/purchases/pages/BuyerPurchases";
import { BuyerPurchaseDetails } from "../features/purchases/pages/BuyerPurchaseDetails";

export const router = createBrowserRouter([
  {
    path: "/comprador",
    element: <BuyerLayout />,
    children: [
      {
        path: "carrinho",
        element: <BuyerCart />,
      },
      {
        path: "compras",
        element: <BuyerPurchases />,
      },
      {
        path: "compras/:purchaseId",
        element: <BuyerPurchaseDetails />,
      },
    ],
  },
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
