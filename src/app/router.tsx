
import { createBrowserRouter } from "react-router-dom";
import { Login } from "../features/auth/pages/Login";

import { ProductCatalog } from "../features/catalog/pages/ProductCatalog";

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

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Página não encontrada
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Não foi possível acessar a página solicitada.
        </p>

        <a
          href="/"
          className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Voltar ao catálogo
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Catálogo público
  {
    path: "/",
    element: <ProductCatalog />,
    errorElement: <NotFoundPage />,
  },

  // Portal do comprador
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/comprador",
    element: <BuyerLayout />,
    errorElement: <NotFoundPage />,
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

  // Portal do fornecedor
  {
    path: "/fornecedor",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
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
    ],
  },

  // Rotas não encontradas
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
