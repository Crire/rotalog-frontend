
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { Organization } from "../../organizations/mocks/organizations.mock";

import {
    productsMock,
    type ProductAvailability,
} from "../../products/mocks/products.mock";

type InventoryContext = {
    activeOrganization: Organization;
};

type StockFilter = "Todos" | ProductAvailability;

const statusStyles: Record<ProductAvailability, string> = {
    Disponível: "bg-green-100 text-green-800",
    "Estoque baixo": "bg-amber-100 text-amber-800",
    Indisponível: "bg-red-100 text-red-800",
};

export function SupplierInventory() {
    const { activeOrganization } =
        useOutletContext<InventoryContext>();

    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] =
        useState<StockFilter>("Todos");

    const organizationProducts = productsMock.filter(
        (product) =>
            product.organizationId === activeOrganization.id
    );

    const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("pt-BR");

    const filteredProducts = organizationProducts.filter(
        (product) => {
            const matchesSearch = [
                product.id,
                product.name,
                product.category,
            ].some((value) =>
                value
                    .toLocaleLowerCase("pt-BR")
                    .includes(normalizedSearch)
            );

            const matchesStatus =
                stockFilter === "Todos" ||
                product.availability === stockFilter;

            return matchesSearch && matchesStatus;
        }
    );

    const totalProducts = organizationProducts.length;

    const availableProducts = organizationProducts.filter(
        (product) => product.availability === "Disponível"
    ).length;

    const lowStockProducts = organizationProducts.filter(
        (product) => product.availability === "Estoque baixo"
    ).length;

    const unavailableProducts = organizationProducts.filter(
        (product) => product.availability === "Indisponível"
    ).length;

    function clearFilters() {
        setSearch("");
        setStockFilter("Todos");
    }

    const hasActiveFilters =
        search.trim() !== "" || stockFilter !== "Todos";

    const indicators = [
        {
            label: "Total de produtos",
            value: totalProducts,
        },
        {
            label: "Disponíveis",
            value: availableProducts,
        },
        {
            label: "Estoque baixo",
            value: lowStockProducts,
        },
        {
            label: "Indisponíveis",
            value: unavailableProducts,
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Estoque
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Acompanhe o estoque de {activeOrganization.name}.
                </p>
            </div>

            {/* Indicadores */}
            <section
                aria-label="Resumo do estoque"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {indicators.map((indicator) => (
                    <div
                        key={indicator.label}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-medium text-slate-500">
                            {indicator.label}
                        </p>

                        <p className="mt-3 text-3xl font-bold text-slate-900">
                            {indicator.value}
                        </p>
                    </div>
                ))}
            </section>

            {/* Filtros */}
            <section
                aria-label="Filtros de estoque"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <h2 className="text-lg font-semibold text-slate-900">
                    Consultar estoque
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Pesquise produtos e filtre por disponibilidade.
                </p>

                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <label
                            htmlFor="inventory-search"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Pesquisar produto
                        </label>

                        <input
                            id="inventory-search"
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Código, nome ou categoria"
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="w-full md:w-64">
                        <label
                            htmlFor="inventory-status"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Disponibilidade
                        </label>

                        <select
                            id="inventory-status"
                            value={stockFilter}
                            onChange={(event) =>
                                setStockFilter(event.target.value as StockFilter)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="Todos">Todas</option>
                            <option value="Disponível">Disponível</option>
                            <option value="Estoque baixo">
                                Estoque baixo
                            </option>
                            <option value="Indisponível">
                                Indisponível
                            </option>
                        </select>
                    </div>

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

            {/* Tabela */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Posição de estoque
                    </h2>

                    <p
                        aria-live="polite"
                        className="mt-1 text-sm text-slate-500"
                    >
                        {filteredProducts.length} de {totalProducts} produto(s)
                    </p>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">
                                        Código
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Produto
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Quantidade
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Unidade
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Disponibilidade
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {product.id}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {product.name}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {product.category}
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {product.stock}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {product.unit}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles[product.availability]
                                                    }`}
                                            >
                                                {product.availability}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <h3 className="font-semibold text-slate-900">
                            Nenhum produto encontrado
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            {hasActiveFilters
                                ? "Tente ajustar os filtros de pesquisa."
                                : "Esta organização ainda não possui produtos cadastrados."}
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
