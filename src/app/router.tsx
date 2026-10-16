
import { createBrowserRouter } from "react-router-dom";

import { Login } from "../features/auth/pages/Login";
import { Register } from "../features/auth/pages/Register";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

import { NotFoundPage } from "../shared/pages/NotFoundPage";
import { FeaturePlaceholder } from "../shared/pages/FeaturePlaceholder";

import { ProductCatalog } from "../features/catalog/pages/ProductCatalog";
import { ProductDetails } from "../features/catalog/pages/ProductDetails";

import { AppLayout } from "../shared/components/AppLayout";
import { BuyerLayout } from "../shared/components/BuyerLayout";

import { SupplierDashboard } from "../features/dashboard/pages/SupplierDashboard";
import { SupplierOrders } from "../features/orders/pages/SupplierOrders";
import { SupplierProducts } from "../features/products/pages/SupplierProducts";
import { SupplierInventory } from "../features/inventory/pages/SupplierInventory";

import { BuyerCart } from "../features/cart/pages/BuyerCart";
import { BuyerPurchases } from "../features/purchases/pages/BuyerPurchases";
import { BuyerPurchaseDetails } from "../features/purchases/pages/BuyerPurchaseDetails";

export const router = createBrowserRouter([
  // Catálogo público
  {
    path: "/",
    element: <ProductCatalog />,
    errorElement: <NotFoundPage />,
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

  {
    path: "/produto/:productId",
    element: (
      <ProtectedRoute allowedRoles={["BUYER_ADMIN"]}>
        <ProductDetails />
      </ProtectedRoute>
    ),
  },

  // Portal do comprador
  {
    path: "/comprador",
    element: (
      <ProtectedRoute allowedRoles={["BUYER_ADMIN"]}>
        <BuyerLayout />
      </ProtectedRoute>
    ),
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
