
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/components/AppLayout";
import { SupplierDashboard } from "../features/dashboard/pages/SupplierDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">
          Ocorreu um erro inesperado.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Verifique os logs ou tente recarregar a página.
        </p>
      </div>
    ),
    children: [
      {
        index: true,
        element: <SupplierDashboard />,
      },
    ],
  },
]);
