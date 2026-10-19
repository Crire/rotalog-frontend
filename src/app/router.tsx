
import { createBrowserRouter, Outlet } from "react-router-dom";

import { Login } from "../features/auth/pages/Login";
import { Register } from "../features/auth/pages/Register";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

import { NotFoundPage } from "../shared/pages/NotFoundPage";
import { FeaturePlaceholder } from "../shared/pages/FeaturePlaceholder";

import { ProductCatalog } from "../features/catalog/pages/ProductCatalog";
import { ProductDetails } from "../features/catalog/pages/ProductDetails";

import { AppLayout } from "../shared/components/AppLayout";
import { MarketplaceLayout } from "../shared/components/MarketplaceLayout";

import { SupplierDashboard } from "../features/dashboard/pages/SupplierDashboard";
import { SupplierOrders } from "../features/orders/pages/SupplierOrders";
import { SupplierProducts } from "../features/products/pages/SupplierProducts";
import { SupplierInventory } from "../features/inventory/pages/SupplierInventory";

import { BuyerAccount } from "../features/account/pages/BuyerAccount";
import { BuyerCart } from "../features/cart/pages/BuyerCart";
import { BuyerPurchases } from "../features/purchases/pages/BuyerPurchases";
import { BuyerPurchaseDetails } from "../features/purchases/pages/BuyerPurchaseDetails";

export const router = createBrowserRouter([
  // Marketplace público e portal do comprador
  {
    path: "/",
    element: <MarketplaceLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <ProductCatalog />,
      },
      {
        path: "produto/:productId",
        element: (
          <ProtectedRoute allowedRoles={["BUYER_ADMIN"]}>
            <ProductDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "comprador",
        element: (
          <ProtectedRoute allowedRoles={["BUYER_ADMIN"]}>
            <Outlet />
          </ProtectedRoute>
        ),
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
          {
            path: "conta",
            element: <BuyerAccount />,
          },
        ],
      },
    ],
  },

  // Autenticação
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/cadastro",
    element: <Register />,
  },

  // Portal do fornecedor
  {
    path: "/fornecedor",
    element: (
      <ProtectedRoute allowedRoles={["SUPPLIER_OPERATOR"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
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
