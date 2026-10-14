
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

import {
  organizationsMock,
} from "../../features/organizations/mocks/organizations.mock";

type Permission =
  | "dashboard:view"
  | "orders:view"
  | "products:view"
  | "inventory:view"
  | "routes:view";

// Usuário simulado até a integração com a API
const mockUser = {
  name: "Ana Karoline",
  role: "Gerente do Fornecedor",
  permissions: [
    "dashboard:view",
    "orders:view",
    "products:view",
    "inventory:view",
    "routes:view",
  ] as Permission[],
};

export function AppLayout() {
  // Controla o menu lateral em dispositivos móveis
  const [menuOpen, setMenuOpen] = useState(false);

  // Organização selecionada pelo usuário
  const [activeOrganizationId, setActiveOrganizationId] = useState(
    organizationsMock[0]?.id ?? ""
  );

  // Recupera os dados da organização ativa
  const activeOrganization = organizationsMock.find(
    (organization) => organization.id === activeOrganizationId
  );

  // Evita renderizar informações de uma organização inexistente
  if (!activeOrganization) {
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Organização indisponível
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Não foi possível identificar uma organização válida
            para este usuário.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">

      {/* Sidebar fixa em telas grandes */}
      <div className="sticky top-0 hidden h-screen shrink-0 self-start md:block">
        <Sidebar permissions={mockUser.permissions} />
      </div>

      {/* Sidebar em dispositivos móveis */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">

          {/* Fundo escuro para fechar o menu */}
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />

          {/* Conteúdo do menu */}
          <div className="relative z-10 h-full w-64 overflow-y-auto">
            <Sidebar permissions={mockUser.permissions} />
          </div>
        </div>
      )}

      {/* Área principal */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Botão do menu em dispositivos móveis */}
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
          >
            ☰ Menu
          </button>
        </div>

        {/* Cabeçalho com seleção de organização */}
        <Header
          userName={mockUser.name}
          userRole={mockUser.role}
          organizationName={activeOrganization.name}
          organizations={organizationsMock}
          activeOrganizationId={activeOrganizationId}
          onOrganizationChange={setActiveOrganizationId}
        />

        {/* Conteúdo dinâmico das páginas */}
        <main className="w-full min-w-0 flex-1 p-4 sm:p-6">
          <Outlet context={{ activeOrganization }} />
        </main>

        {/* Rodapé */}
        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          RotaLog © 2026 — Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
