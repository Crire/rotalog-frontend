
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type Permission =
  | "dashboard:view"
  | "orders:view"
  | "products:view"
  | "inventory:view"
  | "routes:view";

// Dados temporários até a integração com a API
const mockUser = {
  name: "Ana Karoline",
  role: "Gerente do Fornecedor",
  organization: {
    id: "fornecedor-001",
    name: "Fornecedor Exemplo",
  },
  permissions: [
    "dashboard:view",
    "orders:view",
    "products:view",
    "inventory:view",
    "routes:view",
  ] as Permission[],
};

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Menu lateral fixo em telas grandes */}
      <div className="sticky top-0 hidden h-screen shrink-0 self-start md:block">
        <Sidebar permissions={mockUser.permissions} />
      </div>

      {/* Menu lateral em dispositivos móveis */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative z-10 h-full w-64 overflow-y-auto">
            <Sidebar permissions={mockUser.permissions} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Botão para abrir o menu no celular */}
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
          >
            ☰ Menu
          </button>
        </div>

        <Header
          userName={mockUser.name}
          organizationName={mockUser.organization.name}
          userRole={mockUser.role}
        />

        <main className="w-full flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          RotaLog © 2026 — Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
