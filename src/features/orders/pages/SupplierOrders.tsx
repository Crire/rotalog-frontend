
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { Organization } from "../../organizations/mocks/organizations.mock";

import { OrderDetailsModal } from "../components/OrderDetailsModal";

import {
    ordersMock,
    type SupplierOrder,
    type SupplierOrderStatus,
} from "../mocks/orders.mock";

type OrdersContext = {
    activeOrganization: Organization;
};

type StatusFilter = "Todos" | SupplierOrderStatus;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const statusStyles: Record<SupplierOrderStatus, string> = {
    Pendente: "bg-amber-100 text-amber-800",
    "Em separação": "bg-blue-100 text-blue-800",
    "Em transporte": "bg-purple-100 text-purple-800",
    Entregue: "bg-green-100 text-green-800",
};

const statusOptions: StatusFilter[] = [
    "Todos",
    "Pendente",
    "Em separação",
    "Em transporte",
    "Entregue",
];

export function SupplierOrders() {
    const { activeOrganization } =
        useOutletContext<OrdersContext>();

    // Estados dos filtros
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("Todos");

    // Pedido selecionado para visualizar os detalhes
    const [selectedOrder, setSelectedOrder] =
        useState<SupplierOrder | null>(null);

    // Pedidos da organização ativa
    const organizationOrders = ordersMock.filter(
        (order) =>
            order.organizationId === activeOrganization.id
    );

    // Pesquisa e filtro por status
    const filteredOrders = organizationOrders.filter((order) => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("pt-BR");

        const matchesSearch =
            order.id
                .toLocaleLowerCase("pt-BR")
                .includes(normalizedSearch) ||
            order.customer
                .toLocaleLowerCase("pt-BR")
                .includes(normalizedSearch);

        const matchesStatus =
            statusFilter === "Todos" ||
            order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const hasActiveFilters =
        search.trim() !== "" || statusFilter !== "Todos";

    // Verifica se o pedido selecionado pertence
    // à organização atualmente ativa
    const visibleSelectedOrder =
        selectedOrder?.organizationId === activeOrganization.id
            ? selectedOrder
            : null;

    function clearFilters() {
        setSearch("");
        setStatusFilter("Todos");
    }

    function handleViewDetails(order: SupplierOrder) {
        if (order.organizationId !== activeOrganization.id) {
            return;
        }

        setSelectedOrder(order);
    }

    function handleCloseDetails() {
        setSelectedOrder(null);
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Pedidos
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Acompanhe os pedidos de {activeOrganization.name}.
                </p>
            </div>

            {/* Filtros */}
            <section
                aria-label="Filtros de pedidos"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Filtrar pedidos
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Pesquise pelo número do pedido ou nome do cliente.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    {/* Campo de pesquisa */}
                    <div className="flex-1">
                        <label
                            htmlFor="order-search"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Pesquisar
                        </label>

                        <input
                            id="order-search"
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Ex.: PED-101 ou Mercado Central"
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Filtro de status */}
                    <div className="w-full md:w-64">
                        <label
                            htmlFor="order-status"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Status
                        </label>

                        <select
                            id="order-status"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as StatusFilter
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status === "Todos"
                                        ? "Todos os status"
                                        : status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Limpar filtros */}
                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Limpar filtros
                    </button>
                </div>
            </section>

            {/* Lista de pedidos */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Lista de pedidos
                    </h2>

                    <p
                        aria-live="polite"
                        className="mt-1 text-sm text-slate-500"
                    >
                        {filteredOrders.length} de{" "}
                        {organizationOrders.length} pedido(s) encontrado(s)
                    </p>
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">
                                        Pedido
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Cliente
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Data
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Itens
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Total
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {order.id}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {order.customer}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(
                                                `${order.date}T12:00:00`
                                            ).toLocaleDateString("pt-BR")}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {order.items}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {currencyFormatter.format(order.total)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status]
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Nova coluna: ações */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetails(order)
                                                }
                                                aria-label={`Ver detalhes do pedido ${order.id}`}
                                                className="whitespace-nowrap font-medium text-blue-600 transition hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                Ver detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <h3 className="text-base font-semibold text-slate-900">
                            Nenhum pedido encontrado
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            {hasActiveFilters
                                ? "Não encontramos pedidos que correspondam aos filtros selecionados."
                                : "Esta organização ainda não possui pedidos cadastrados."}
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Modal de detalhes do pedido */}
            {visibleSelectedOrder && (
                <OrderDetailsModal
                    order={visibleSelectedOrder}
                    activeOrganization={activeOrganization}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
}
