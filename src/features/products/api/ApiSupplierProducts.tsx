import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { PageHeader } from "../../../shared/components/PageHeader";
import { CatalogRepository, catalogError, productCategory, publicationLabel, type CatalogPage } from "./catalogRepository";
import { ApiCatalogDetails } from "./ApiCatalogDetails";
import { SupplierOffers } from "./SupplierOffers";

const button = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50";
export function ApiSupplierProducts() {
    const {user} = useAuth();
    return <SessionCatalog key={`${user?.id}:${user?.organization_id}`} organizationId={user?.organization_id ?? ""} />;
}
function SessionCatalog({organizationId}: {organizationId: string}) {
    const repository = useMemo(() => new CatalogRepository(organizationId), [organizationId]);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState({page:1, search:""});
    const [result, setResult] = useState<CatalogPage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let active = true;
        void repository.list(query.page, query.search).then(data => {if (active) setResult(data);}).catch(failure => {if (active) setError(catalogError(failure));});
        return () => {active = false;};
    }, [repository, query, attempt]);
    const loading = !result && !error;
    function changeQuery(page: number, name: string) {setResult(null); setError(null); setQuery({page, search:name});}
    function retry() {setResult(null); setError(null); setAttempt(value => value + 1);}
    return <div className="flex w-full min-w-0 flex-col gap-4">
        <PageHeader title="Produtos" subtitle="Consulte os produtos publicados no catálogo oficial do RotaLog." actions={<Link to="/fornecedor/estoque" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium">Consultar estoque das minhas ofertas</Link>} />
        <section aria-label="Como cadastrar um item para venda" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
            <h2 className="font-semibold">Como cadastrar um item para venda</h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Selecione uma variante publicada no catálogo. Produtos novos são cadastrados e publicados pela administração; na demo, essa preparação pode ser feita pelo Swagger.</li>
                <li>Em Minhas ofertas, crie sua oferta com depósito confirmado, preço e quantidade mínima.</li>
                <li>Acesse <Link to="/fornecedor/estoque" className="font-semibold underline">Estoque</Link> e registre o saldo vendável inicial com justificativa. Criar oferta não cria estoque.</li>
            </ol>
        </section>
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Catálogo oficial">
            <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Catálogo oficial {result && <span className="text-sm font-normal text-slate-500">({result.total} produtos)</span>}</h2>
            <form className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto" onSubmit={event => {event.preventDefault(); changeQuery(1, search.trim());}}><label className="sr-only" htmlFor="catalog-search">Pesquisar por nome</label><input id="catalog-search" type="search" maxLength={200} value={search} onChange={event => setSearch(event.target.value)} placeholder="Pesquisar por nome…" className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-64" /><button className={button} type="submit">Pesquisar</button><button className={button} type="button" onClick={() => {setSearch(""); changeQuery(1, "");}}>Limpar</button></form></header>
            {loading && <p role="status" className="mt-4 text-sm text-slate-600">Carregando catálogo…</p>}
            {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error} <button className="underline" type="button" onClick={retry}>Tentar novamente</button></div>}
            {result && <>{result.items.length === 0 ? <p role="status" className="py-8 text-center text-sm text-slate-500">{query.search ? "Nenhum produto encontrado para esta pesquisa." : "Nenhum produto publicado no catálogo."}</p> : <div role="region" aria-label="Produtos publicados" tabIndex={0} className="mt-4 max-h-[65dvh] overflow-auto focus-visible:outline-2 focus-visible:outline-blue-600"><table className="w-full min-w-[800px] text-left text-sm"><caption className="sr-only">Produtos publicados no catálogo oficial</caption><thead className="sticky top-0 bg-slate-50 text-slate-600"><tr>{["Produto", "Marca", "Categoria", "Conteúdo e embalagem", "GTIN", "Publicação", "Ações"].map(label => <th scope="col" key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{result.items.map(product => <tr key={product.id} className="border-t border-slate-100"><td className="max-w-64 break-words px-3 py-3 font-medium [overflow-wrap:anywhere]">{product.name}</td><td className="max-w-40 break-words px-3 py-3">{product.brand}</td><td className="px-3 py-3">{productCategory(product.category)}</td><td className="px-3 py-3">{product.net_content} {product.net_content_unit}<span className="block text-xs text-slate-500">{product.packaging_type} · {product.packaging_quantity} unidades</span></td><td className="px-3 py-3">{product.gtin ?? "Não informado"}</td><td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{publicationLabel(product.publication_state)}</span></td><td className="px-3 py-3"><button type="button" className="rounded px-2 py-2 font-medium text-blue-700" aria-label={`Ver detalhes de ${product.name}`} onClick={() => setSelected(product.id)}>Ver detalhes</button></td></tr>)}</tbody></table></div>}
            <nav aria-label="Paginação do catálogo" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><p aria-live="polite">Página {result.page} de {Math.max(1, Math.ceil(result.total / result.page_size))} · {result.total} produtos</p><div className="flex gap-2"><button type="button" className={button} disabled={result.page <= 1} onClick={() => changeQuery(result.page - 1, query.search)}>Anterior</button><button type="button" className={button} disabled={result.page * result.page_size >= result.total} onClick={() => changeQuery(result.page + 1, query.search)}>Próxima</button></div></nav></>}
        </section>
        <SupplierOffers organizationId={organizationId}/>
        {result?.is_synthetic && <p className="text-xs text-slate-500">Catálogo consultado na API. Este ambiente retorna produtos sintéticos de demonstração.</p>}
        {selected && <ApiCatalogDetails key={selected} id={selected} repository={repository} onClose={() => setSelected(null)} />}
    </div>;
}
