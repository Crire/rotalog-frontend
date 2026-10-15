
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

import { usersMock } from "../../features/auth/mocks/users.mock";
import { organizationsMock } from "../../features/organizations/mocks/organizations.mock";

export function AppLayout() {
  const [activeUserId, setActiveUserId] = useState(
    usersMock[0]?.id ?? ""
  );

  const [activeOrganizationId, setActiveOrganizationId] =
    useState(organizationsMock[0]?.id ?? "");

  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const activeUser = usersMock.find(
    (user) => user.id === activeUserId
  );

  const allowedOrganizations = organizationsMock.filter(
    (organization) =>
      activeUser?.organizationIds.includes(organization.id)
  );

  const activeOrganization = allowedOrganizations.find(
    (organization) => organization.id === activeOrganizationId
  );

  function handleUserChange(userId: string) {
    const selectedUser = usersMock.find(
      (user) => user.id === userId
    );

    if (!selectedUser) return;

    const firstAllowedOrganization = organizationsMock.find(
      (organization) =>
        selectedUser.organizationIds.includes(organization.id)
    );

    setActiveUserId(selectedUser.id);
    setActiveOrganizationId(firstAllowedOrganization?.id ?? "");
    setMenuOpen(false);
  }

  if (!activeUser || !activeOrganization) {
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
      >
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            Acesso indisponível
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Não foi possível identificar um usuário ou
            organização autorizada.
          </p>
        </div>
      </div>
    );
  }

  const requiredPermissions: Record<string, string> = {
    "/": "dashboard:view",
    "/pedidos": "orders:view",
    "/produtos": "products:view",
    "/estoque": "inventory:view",
    "/rotas": "routes:view",
  };

  const requiredPermission = requiredPermissions[location.pathname];

  const hasAccess =
    requiredPermission !== undefined &&
    activeUser.permissions.some(
      (permission) => permission === requiredPermission
    );

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 hidden h-screen shrink-0 self-start md:block">
        <Sidebar permissions={activeUser.permissions} />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative z-10 h-full w-64">
            <Sidebar permissions={activeUser.permissions} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            ☰ Menu
          </button>
        </div>

        <Header
          userName={activeUser.name}
          userRole={activeUser.role}
          organizationName={activeOrganization.name}
          organizations={allowedOrganizations}
          activeOrganizationId={activeOrganization.id}
          onOrganizationChange={setActiveOrganizationId}
          users={usersMock}
          activeUserId={activeUser.id}
          onUserChange={handleUserChange}
        />

        <main className="w-full min-w-0 flex-1 p-4 sm:p-6">
          {hasAccess ? (
            <Outlet context={{ activeOrganization }} />
          ) : (
            <div role="alert" className="rounded-xl bg-white p-6">
              <h1 className="text-xl font-semibold text-red-700">
                Acesso não autorizado
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Este usuário não possui permissão para acessar
                esta página.
              </p>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          RotaLog © 2026 — Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
