import {useEffect, useMemo, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {formatMoney} from "../../orders/api/orderAdapter";
import {OffersRepository, eligibleWarehouse, offerError, type OfferPage, type Warehouse} from "./offersRepository";
import {OfferDialog, type OfferCommand, type OfferSelection} from "./OfferDialog";

const button = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50";
const geocodingLabel = (state:string) => state === "CONFIRMED" ? "Geocodificação confirmada" : state === "PENDING" ? "Geocodificação pendente" : state;
export function SupplierOffers({organizationId}:{organizationId:string}) {
    const {hash}=useLocation();
    const anchorReached=useRef(false);
    const repository = useMemo(()=>new OffersRepository(organizationId),[organizationId]);
    const [warehouses,setWarehouses] = useState<Warehouse[] | null>(null);
    const [warehouseError,setWarehouseError] = useState<string | null>(null);
    const [offers,setOffers] = useState<OfferPage | null>(null);
    const [listError,setListError] = useState<string | null>(null);
    const [query,setQuery] = useState({page:1,refresh:0});
    const [selection,setSelection] = useState<OfferSelection | null>(null);
    const [pending,setPending] = useState(false);
    const submitting = useRef(false);
    const mounted = useRef(true);
    const [error,setError] = useState<string | null>(null);
    const [failed,setFailed] = useState(false);
    const [success,setSuccess] = useState<string | null>(null);
    const [needsReview,setNeedsReview] = useState(false);
    const [checked,setChecked] = useState(false);
    const [reviewedAfterFailure,setReviewedAfterFailure] = useState(false);
    useEffect(()=>{
        if(hash!=="#minhas-ofertas"){anchorReached.current=false;return;}
        if(offers&&warehouses&&!anchorReached.current){
            document.getElementById("minhas-ofertas")?.scrollIntoView({block:"start"});
            anchorReached.current=true;
        }
    },[hash,offers,warehouses]);
    useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
    useEffect(()=>{
        let active=true;
        void repository.offers(query.page).then(value=>{if(active){setOffers(value);setFailed(false);if(repository.creationNeedsReview())setReviewedAfterFailure(true);}}).catch(failure=>{if(active)setListError(offerError(failure));});
        void repository.warehouses().then(value=>{if(active)setWarehouses(value);}).catch(failure=>{if(active)setWarehouseError(offerError(failure));});
        return()=>{active=false;};
    },[repository,query]);
    function refresh(page=query.page) {
        setOffers(null);setWarehouses(null);setListError(null);setWarehouseError(null);
        setQuery(previous=>({page,refresh:previous.refresh+1}));
    }
    function choose(value:OfferSelection) {setError(null);setFailed(false);setSuccess(null);setSelection(value);}
    async function confirm(command:OfferCommand) {
        if(!selection || submitting.current)return;
        submitting.current=true;setPending(true);setError(null);
        try {
            if(selection.kind === "create") {
                if(!command.product || !command.warehouse)throw new Error("Selecione produto e depósito.");
                await repository.create(command.product,command.warehouse,command.price,command.quantity);
            } else if(selection.kind === "edit") await repository.update(selection.offer,command.price,command.quantity);
            else await repository.pause(selection.offer);
            if(!mounted.current)return;
            setSuccess(selection.kind === "create" ? "Oferta criada com sucesso, com saldo inicial zero. Acesse Estoque para ajustar o vendável e disponibilizar a oferta para compra. Não é necessário cadastrar a oferta novamente." : selection.kind === "edit" ? "Oferta atualizada com sucesso." : "Oferta pausada. Ela não aparece mais na lista de ofertas ativas.");
            setSelection(null);refresh(1);
        } catch(failure) {
            if(!mounted.current)return;
            const uncertain=repository.creationNeedsReview();
            setNeedsReview(uncertain);setChecked(false);setReviewedAfterFailure(false);setFailed(true);
            setError(`${offerError(failure)}${uncertain ? " A criação pode ter sido concluída. Confira a listagem antes de iniciar outra tentativa." : ""}`);
        } finally {submitting.current=false;if(mounted.current)setPending(false);}
    }
    const canCreate = offers !== null && !listError && warehouses !== null && warehouses.some(item=>eligibleWarehouse(item,organizationId)) && !warehouseError && !pending && !needsReview && !failed;
    return <section aria-label="Depósitos e ofertas" className="min-w-0 space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Depósitos próprios"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Meus depósitos</h2><button type="button" disabled={pending || selection !== null} onClick={()=>refresh()} className={button}>Atualizar ofertas e depósitos</button></div>
            {!warehouses && !warehouseError && <p role="status" className="mt-3 text-sm">Carregando depósitos…</p>}
            {warehouseError && <p role="alert" className="mt-3 text-sm text-red-700">{warehouseError}</p>}
            {warehouses && <><div className="mt-3 grid gap-3 md:grid-cols-2">{warehouses.map(item=><article key={item.id} className="min-w-0 rounded-lg border border-slate-200 p-3 text-sm [overflow-wrap:anywhere]"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-slate-600">{item.address} · {item.region}</p><p className="text-slate-600">Horário: {item.opening_hours}</p><p className="mt-2 font-medium">{geocodingLabel(item.geocoding_state)} · {item.is_active ? "Ativo" : "Inativo"}</p><p className="text-xs text-slate-500">{eligibleWarehouse(item,organizationId) ? "Elegível para criar ofertas" : "Não elegível para criar ofertas"}</p><details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer">Informações técnicas do depósito</summary><p className="break-all">UUID: {item.id}</p><p>Versão: {item.version}</p></details></article>)}</div>{!warehouses.length && <p className="mt-3 text-sm text-slate-500">Nenhum depósito cadastrado para esta organização.</p>}{!warehouses.some(item=>eligibleWarehouse(item,organizationId)) && <p className="mt-3 text-sm text-amber-800">Nenhum depósito elegível para ofertas. Solicite à administração o cadastro ou a regularização de uma origem ativa e a confirmação da geocodificação. Essa aprovação não é realizada pelo fornecedor.</p>}</>}
        </section>
        <section id="minhas-ofertas" aria-label="Minhas ofertas" className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Minhas ofertas {offers && <span className="text-sm font-normal text-slate-500">({offers.total} ativas)</span>}</h2><button type="button" className={button} disabled={!canCreate} onClick={()=>choose({kind:"create"})}>Criar oferta para produto existente</button></header>
            <p className="mt-2 text-xs text-slate-500">Somente ofertas ativas. Ofertas pausadas não são retornadas pela API e ainda não podem ser reativadas.</p>
            {success && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
            {error && !selection && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            {failed && !selection && <p className="mt-2 text-sm text-slate-600">Atualize a lista para revisar os dados antes de tentar novamente.</p>}
            {needsReview && <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><p>Não há garantia de idempotência na criação. Use “Atualizar ofertas e depósitos” e confira todas as páginas, o produto e o depósito antes de liberar uma nova tentativa.</p><label className="mt-2 flex items-start gap-2"><input type="checkbox" checked={checked} onChange={event=>setChecked(event.target.checked)}/>Conferi as ofertas e entendo que uma nova tentativa pode duplicar uma oferta.</label><button type="button" className={`${button} mt-2`} disabled={!checked || !offers || !reviewedAfterFailure || pending} onClick={()=>{repository.acknowledgeCreationReview();setNeedsReview(false);setFailed(false);setError(null);setChecked(false);}}>Liberar nova tentativa após conferência</button></div>}
            {!offers && !listError && <p role="status" className="mt-3 text-sm">Carregando ofertas…</p>}
            {listError && <p role="alert" className="mt-3 text-sm text-red-700">{listError}</p>}
            {offers && <>{!offers.items.length ? <p className="py-6 text-center text-sm text-slate-500">Nenhuma oferta ativa nesta página.</p> : <div role="region" aria-label="Tabela de ofertas ativas" tabIndex={0} className="mt-3 max-w-full overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><caption className="sr-only">Ofertas ativas do fornecedor autenticado</caption><thead className="bg-slate-50"><tr>{["Produto","Depósito","Preço unitário","Quantidade mínima","Ações"].map(label=><th scope="col" key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{offers.items.map(offer=><tr key={offer.id} className="border-t border-slate-100"><td className="max-w-64 break-words px-3 py-3 [overflow-wrap:anywhere]">{offer.product_name}<details className="mt-1 text-xs text-slate-500"><summary className="cursor-pointer">Informações técnicas da oferta</summary><p className="break-all">UUID: {offer.id}</p><p className="break-all">Produto: {offer.product_id}</p><p className="break-all">Depósito: {offer.warehouse_id}</p><p>Versão: {offer.version}</p></details></td><td className="px-3 py-3">{warehouses?.find(item=>item.id===offer.warehouse_id)?.name ?? "Depósito não disponível na consulta"}<span className="block text-xs text-slate-500">{offer.region}</span></td><td className="px-3 py-3">{formatMoney(offer.unit_price)}</td><td className="px-3 py-3">{offer.minimum_order_quantity}</td><td className="px-3 py-3"><div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={pending || failed || !offer.is_active} onClick={()=>choose({kind:"edit",offer})}>Alterar oferta</button><button type="button" className={button} disabled={pending || failed || !offer.is_active} onClick={()=>choose({kind:"pause",offer})}>Pausar oferta</button></div></td></tr>)}</tbody></table></div>}<nav aria-label="Páginas de ofertas" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm"><p>Página {offers.page} de {Math.max(1,Math.ceil(offers.total/offers.page_size))}</p><div className="flex gap-2"><button className={button} type="button" disabled={pending || offers.page<=1} onClick={()=>refresh(offers.page-1)}>Ofertas anteriores</button><button className={button} type="button" disabled={pending || offers.page*offers.page_size>=offers.total} onClick={()=>refresh(offers.page+1)}>Próximas ofertas</button></div></nav></>}
        </section>
        <section aria-label="Solicitação de novos produtos" className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm"><h2 className="text-base font-semibold">Produto não encontrado no catálogo?</h2><p className="mt-2 text-sm text-slate-600">Para um produto já publicado, use Criar oferta. Para um produto inexistente, a futura solicitação de cadastro será analisada pela administração antes de sua inclusão no catálogo.</p><button type="button" className={`${button} mt-3`} disabled aria-describedby="product-request-dependency">Solicitar cadastro de produto</button><p id="product-request-dependency" className="mt-2 text-xs text-slate-500">Envio indisponível: depende dos contratos de solicitação e análise do Backend. Nenhum produto ou solicitação é criado por esta opção.</p><details className="mt-3 text-sm"><summary className="cursor-pointer font-medium">Como funcionará a solicitação</summary><p className="mt-2 text-slate-600">O formulário proposto reunirá nome, marca, categoria, GTIN opcional, conteúdo líquido e unidade, embalagem e sua quantidade, peso bruto, volume e atributos da variante.</p><p className="mt-2 text-slate-600">Após o envio estar disponível, a solicitação ficará pendente de análise. O fornecedor acompanhará a aprovação ou rejeição; somente um produto oficial aprovado e publicado poderá receber uma oferta.</p></details></section>
        {selection && <OfferDialog selection={selection} organizationId={organizationId} warehouses={warehouses ?? []} pending={pending} error={error} failed={failed} onClose={()=>{setSelection(null);}} onConfirm={confirm}/>}
    </section>;
}
