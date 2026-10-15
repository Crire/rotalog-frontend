
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { Organization } from "../../organizations/mocks/organizations.mock";

import { ProductDetailsModal } from "../components/ProductDetailsModal";

import {
    productsMock,
    type ProductAvailability,
    type SupplierProduct,
} from "../mocks/products.mock";

type ProductsContext = {
    activeOrganization: Organization;
};

type AvailabilityFilter = "Todos" | ProductAvailability;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const availabilityStyles: Record<
    ProductAvailability,
    string
> = {
    Disponível: "bg-green-100 text-green-800",
    "Estoque baixo": "bg-amber-100 text-amber-800",
    Indisponível: "bg-red-100 text-red-800",
};

const availabilityOptions: AvailabilityFilter[] = [
    "Todos",
    "Disponível",
    "Estoque baixo",
    "Indisponível",
];

export function SupplierProducts() {
    const { activeOrganization } =
        useOutletContext<ProductsContext>();

    const [search, setSearch] = useState("");

    const [availabilityFilter, setAvailabilityFilter] =
        useState<AvailabilityFilter>("Todos");

    const [selectedProduct, setSelectedProduct] =
        useState<SupplierProduct | null>(null);

    // Produtos pertencentes à organização ativa
    const organizationProducts = productsMock.filter(
        (product) =>
            product.organizationId === activeOrganization.id
    );

    // Pesquisa por código, nome ou categoria
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

            const matchesAvailability =
                availabilityFilter === "Todos" ||
                product.availability === availabilityFilter;

            return matchesSearch && matchesAvailability;
        }
    );

    const hasActiveFilters =
        search.trim() !== "" ||
        availabilityFilter !== "Todos";

    // Não permite exibir detalhes de outra organização
    const visibleSelectedProduct =
        selectedProduct?.organizationId === activeOrganization.id
            ? selectedProduct
            : null;

    function handleViewDetails(product: SupplierProduct) {
        if (product.organizationId !== activeOrganization.id) {
            return;
        }

        setSelectedProduct(product);
    }

    function handleCloseDetails() {
        setSelectedProduct(null);
    }

    function clearFilters() {
        setSearch("");
        setAvailabilityFilter("Todos");
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Produtos
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    Consulte os produtos de {activeOrganization.name}.
                </p>
            </div>

            {/* Filtros */}
            <section
                aria-label="Filtros de produtos"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Filtrar produtos
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Pesquise pelo código, nome ou categoria.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    {/* Pesquisa */}
                    <div className="flex-1">
                        <label
                            htmlFor="product-search"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Pesquisar
                        </label>

                        <input
                            id="product-search"
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Ex.: PROD-101 ou Tinta"
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Disponibilidade */}
                    <div className="w-full md:w-64">
                        <label
                            htmlFor="product-availability"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Disponibilidade
                        </label>

                        <select
                            id="product-availability"
                            value={availabilityFilter}
                            onChange={(event) =>
                                setAvailabilityFilter(
                                    event.target.value as AvailabilityFilter
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {availabilityOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === "Todos"
                                        ? "Todas as disponibilidades"
                                        : option}
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

            {/* Listagem de produtos */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Lista de produtos
                    </h2>

                    <p
                        aria-live="polite"
                        className="mt-1 text-sm text-slate-500"
                    >
                        {filteredProducts.length} de{" "}
                        {organizationProducts.length} produto(s) encontrado(s)
                    </p>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
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
                                        Unidade
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Preço
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Estoque
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Disponibilidade
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-slate-50"
                                    >
                                        {/* Código */}
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {product.id}
                                        </td>

                                        {/* Nome */}
                                        <td className="px-6 py-4 text-slate-700">
                                            {product.name}
                                        </td>

                                        {/* Categoria */}
                                        <td className="px-6 py-4 text-slate-600">
                                            {product.category}
                                        </td>

                                        {/* Unidade */}
                                        <td className="px-6 py-4 text-slate-600">
                                            {product.unit}
                                        </td>

                                        {/* Preço */}
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {currencyFormatter.format(product.price)}
                                        </td>

                                        {/* Estoque */}
                                        <td className="px-6 py-4 text-slate-700">
                                            {product.stock}
                                        </td>

                                        {/* Disponibilidade */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${availabilityStyles[product.availability]
                                                    }`}
                                            >
                                                {product.availability}
                                            </span>
                                        </td>

                                        {/* Ações */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetails(product)
                                                }
                                                className="whitespace-nowrap rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
                    /* Nenhum produto encontrado */
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <h3 className="text-base font-semibold text-slate-900">
                            Nenhum produto encontrado
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            {hasActiveFilters
                                ? "Não encontramos produtos que correspondam aos filtros selecionados."
                                : "Esta organização ainda não possui produtos cadastrados."}
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

            {/* Modal de detalhes do produto */}
            {visibleSelectedProduct && (
                <ProductDetailsModal
                    key={`${activeOrganization.id}-${visibleSelectedProduct.id}`}
                    product={visibleSelectedProduct}
                    activeOrganization={activeOrganization}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
}
