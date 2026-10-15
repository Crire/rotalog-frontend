
import { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

import { usersMock } from "../../features/auth/mocks/users.mock";

import { organizationsMock } from "../../features/organizations/mocks/organizations.mock";

import {
  canAccessRoute,
  getFirstAllowedRoute,
  getRoutePermission,
} from "../../app/routePermissions";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Usuário ativo no ambiente de demonstração
  const [activeUserId, setActiveUserId] = useState(
    usersMock[0]?.id ?? ""
  );

  // Organização ativa
  const [activeOrganizationId, setActiveOrganizationId] =
    useState(organizationsMock[0]?.id ?? "");

  // Controle do menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  // Identifica o usuário selecionado
  const activeUser = usersMock.find(
    (user) => user.id === activeUserId
  );

  // Exibe somente organizações vinculadas ao usuário
  const allowedOrganizations = organizationsMock.filter(
    (organization) =>
      activeUser?.organizationIds.includes(organization.id)
  );

  // Identifica a organização ativa e autorizada
  const activeOrganization = allowedOrganizations.find(
    (organization) =>
      organization.id === activeOrganizationId
  );

  // Troca o usuário simulado
  function handleUserChange(userId: string) {
    const selectedUser = usersMock.find(
      (user) => user.id === userId
    );

    if (!selectedUser) return;

    const firstAllowedOrganization = organizationsMock.find(
      (organization) =>
        selectedUser.organizationIds.includes(organization.id)
    );

    const firstAllowedRoute = getFirstAllowedRoute(
      selectedUser.permissions
    );

    setActiveUserId(selectedUser.id);

    setActiveOrganizationId(
      firstAllowedOrganization?.id ?? ""
    );

    setMenuOpen(false);

    // Direciona para a primeira página permitida
    if (firstAllowedRoute) {
      navigate(firstAllowedRoute, { replace: true });
    }
  }

  // Impede exibição sem usuário ou organização válida
  if (!activeUser || !activeOrganization) {
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
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

  // Verifica a permissão utilizando a configuração centralizada
  const routeExists =
    getRoutePermission(location.pathname) !== undefined;

  const hasAccess = canAccessRoute(
    location.pathname,
    activeUser.permissions
  );

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar desktop */}
      <div className="sticky top-0 hidden h-screen shrink-0 self-start md:block">
        <Sidebar permissions={activeUser.permissions} />
      </div>

      {/* Sidebar mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative z-10 h-full w-64 overflow-y-auto">
            <Sidebar permissions={activeUser.permissions} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Botão do menu mobile */}
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

        {/* Cabeçalho */}
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
          {!routeExists ? (
            <div
              role="alert"
              className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-blue-700">
                Erro 404
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Página não encontrada
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                A página solicitada não existe no RotaLog.
                Verifique o endereço informado.
              </p>
            </div>
          ) : !hasAccess ? (
            <div
              role="alert"
              className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-red-700">
                Erro 403
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Acesso não autorizado
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Este usuário não possui permissão para acessar
                esta página.
              </p>
            </div>
          ) : (
            <Outlet context={{ activeOrganization }} />
          )}
        </main>


        {/* Rodapé */}
        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          RotaLog © 2026 — Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
