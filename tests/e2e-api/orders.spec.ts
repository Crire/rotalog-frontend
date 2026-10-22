import { test, expect, type Page } from "@playwright/test";

const org = "11111111-1111-4111-8111-111111111111";
const id = "22222222-2222-4222-8222-222222222222";
const user = { id: "test-user", name: "Fornecedor do teste", email: "supplier@example.invalid", role: "SUPPLIER_OPERATOR", organization_id: org, organizations: [{ id: org, name: "Organização sintética", role: "SUPPLIER_OPERATOR" }], capabilities: ["supplier_order:manage", "offer:write", "inventory:write"], demo_run_id: "demo", is_synthetic: true };
function makeOrder(orderId = id, state = "AWAITING_SUPPLIER_DECISION") {
    return {
        id: orderId, state, purchase_id: "purchase", buyer_organization_id: "buyer-id", supplier_organization_id: org,
        warehouse_id: "warehouse", version: 3, accepts_partial: false, acceptance_deadline: "2099-01-01T00:00:00Z",
        currency: "BRL", total: "0.30", cancellation_reason: null, allowed_actions: ["acceptance"], is_synthetic: true,
        items: [{ id: "line", offer_id: "offer", product: { id: "product", name: "Arroz do pedido", net_content: 1, net_content_unit: "un", packaging_type: "Pacote" }, unit_price: "0.10", currency: "BRL", requested_quantity: 3, reserved_quantity: 3, supplier_accepted_quantity: 0, supplier_refused_quantity: 0, separated_quantity: 0 }],
        fulfillments: [] as { id: string; supplier_order_id: string; state: string; version: number; lines: {id:string; order_item_id:string; allocated_quantity:number; separated_quantity:number}[] }[],
    };
}
async function setup(page: Page, items: ReturnType<typeof makeOrder>[]) {
    const state = { items, identity: { ...user }, posts: [] as { path: string; key: string | undefined; body: Record<string, unknown> }[], reads: 0, failList: 0, failPost: false, conflict: false };
    await page.addInitScript(() => {
        sessionStorage.setItem("rotalog:api-csrf", "test-csrf");
        localStorage.setItem("rotalog:supplier-orders:v1", JSON.stringify([{id:"LOCAL-ONLY",organizationId:"fornecedor-001",customer:"Mock",total:999,status:"Pendente"}]));
    });
    await page.route("http://localhost:8000/api/v1/**", async route => {
        const request = route.request(), url = new URL(request.url()), path = url.pathname;
        if (path.endsWith("/auth/refresh") || path.endsWith("/auth/login")) return route.fulfill({json:{access_token:"test-access",token_type:"bearer",expires_in:600,csrf_token:"test-csrf",refresh_token:null,user:state.identity}});
        if (path.endsWith("/me")) return route.fulfill({json:state.identity});
        if (path.endsWith("/auth/logout")) return route.fulfill({status:204});
        expect(request.headers()["authorization"]).toBe("Bearer test-access");
        expect(request.headers()["x-organization-id"]).toBe(state.identity.organization_id);
        if (request.method() === "POST") {
            state.posts.push({path,key:request.headers()["idempotency-key"],body:request.postDataJSON()});
            if (state.failPost) { state.failPost=false; return route.abort("failed"); }
            if (state.conflict) return route.fulfill({status:409,json:{error:{code:"VERSION_CONFLICT"}}});
            const target=state.items[0];
            if (path.endsWith("/acceptance")) {
                target.items[0].supplier_accepted_quantity=request.postDataJSON().lines[0].accepted_quantity;
                target.state=target.items[0].supplier_accepted_quantity ? "ACCEPTED" : "REFUSED";
                target.allowed_actions=target.state==="ACCEPTED" ? ["start-separation"] : []; target.version++;
            } else if (path.endsWith("/start-separation")) {
                target.state="SEPARATING"; target.allowed_actions=["fulfillments"]; target.version++;
            } else if (path.endsWith("/fulfillments")) {
                target.fulfillments.push({id:"batch",supplier_order_id:target.id,state:"SEPARATING",version:1,lines:[{id:"batch-line",order_item_id:"line",allocated_quantity:3,separated_quantity:0}]}); target.version++;
            } else if (path.endsWith("/separation-results")) {
                target.fulfillments[0].lines[0].separated_quantity=3; target.fulfillments[0].version++; target.version++; target.items[0].separated_quantity=3;
            } else if (path.endsWith("/mark-ready")) {
                target.fulfillments[0].state="READY_TO_DISPATCH"; target.fulfillments[0].version++; target.state="READY_TO_DISPATCH"; target.allowed_actions=[]; target.version++;
            }
            return route.fulfill({json:path.includes("/api/v1/fulfillments/") || path.endsWith("/fulfillments") ? target.fulfillments[0] : target});
        }
        if (path==="/api/v1/supplier-orders") {
            state.reads++;
            if (state.failList) return route.fulfill({status:state.failList,json:{error:{code:"TEST_ERROR"}}});
            const number=Number(url.searchParams.get("page"));
            return route.fulfill({json:{items:state.items.slice((number-1)*100,number*100),total:state.items.length,page:number,page_size:100,is_synthetic:true,label:"SIMULAÇÃO — dados sintéticos"}});
        }
        const target=state.items.find(item=>path.endsWith(`/${item.id}`));
        return target ? route.fulfill({json:target}) : route.fulfill({status:404,json:{error:{code:"NOT_FOUND"}}});
    });
    return state;
}
async function openDetails(page: Page) {
    await page.goto("/fornecedor/pedidos");
    await page.getByRole("button",{name:`Ver detalhes do pedido ${id}`}).click();
    return page.getByRole("dialog");
}
test("vazio sem mocks ou datas fictícias; navegação somente consulta", async ({page}) => {
    const state=await setup(page,[]); await page.goto("/fornecedor");
    await expect(page.getByRole("link",{name:"Pedidos recebidos: 0. Ver pedidos"})).toBeVisible();
    await expect(page.getByLabel("Ano do Dashboard")).toHaveCount(0);
    await expect(page.getByText("LOCAL-ONLY")).toHaveCount(0);
    await page.getByRole("navigation").getByRole("link",{name:"Pedidos",exact:true}).click();
    await expect(page.getByText("Nenhum pedido retornado pelo Backend para esta organização.")).toBeVisible();
    expect(state.posts).toHaveLength(0); expect(state.reads).toBe(1);
});
test("101 pedidos: paginação, contadores iguais e estado desconhecido acessível", async ({page}) => {
    const items=Array.from({length:100},(_,i)=>makeOrder(`order-${i}`)); items.push(makeOrder(id,"FUTURE_STATE"));
    const state=await setup(page,items); await page.goto("/fornecedor");
    await expect(page.getByRole("link",{name:"Pedidos recebidos: 101. Ver pedidos"})).toBeVisible();
    await expect(page.getByRole("link",{name:"Aguardando aceite: 100. Ver pedidos"})).toBeVisible();
    const menu=page.getByRole("navigation").getByRole("link",{name:"Pedidos 100 pedidos aguardando aceite"});
    await expect(menu).toBeVisible(); await menu.click();
    await expect(page.getByLabel("100 pedidos na etapa Novos")).toBeVisible();
    const unknown=page.getByRole("region",{name:"Outros estados",exact:true});
    await expect(unknown.getByText("FUTURE_STATE")).toBeVisible();
    await unknown.getByRole("button",{name:`Ver detalhes do pedido ${id}`}).click();
    await expect(page.getByRole("dialog").getByText("FUTURE_STATE (FUTURE_STATE)")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("button",{name:"Aceitar pedido",exact:true})).toHaveCount(0);
    expect(state.posts).toHaveLength(0); expect(state.reads).toBe(2);
});
test("aceite repete chave após falha e atualiza menu, Kanban e dashboard", async ({page}) => {
    const state=await setup(page,[makeOrder()]); state.failPost=true;
    const dialog=await openDetails(page);
    await expect(dialog.getByRole("timer")).toContainText("d");
    await dialog.getByRole("button",{name:"Aceitar pedido",exact:true}).click();
    await dialog.getByRole("button",{name:"Confirmar aceite",exact:true}).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await dialog.getByRole("button",{name:"Confirmar aceite",exact:true}).click();
    await expect(dialog.getByText("Aceito (ACCEPTED)")).toBeVisible();
    expect(state.posts).toHaveLength(2); expect(state.posts[0].key).toBeTruthy(); expect(state.posts[0].key).toBe(state.posts[1].key);
    expect(state.posts[0].body.expected_version).toBe(3);
    await dialog.getByRole("button",{name:"Fechar",exact:true}).click();
    await expect(page.getByLabel("1 pedidos na etapa Aceitos")).toBeVisible();
    await expect(page.getByRole("navigation").getByLabel("1 pedido aguardando aceite")).toHaveCount(0);
    await page.getByRole("navigation").getByRole("link",{name:"Dashboard",exact:true}).click();
    await expect(page.getByRole("link",{name:"Aguardando aceite: 0. Ver pedidos"})).toBeVisible();
    await expect(page.getByRole("link",{name:"Em preparação: 1. Ver pedidos"})).toBeVisible();
});
test("separação explícita com versões distintas até pronto para coleta", async ({page}) => {
    const item=makeOrder(id,"ACCEPTED"); item.allowed_actions=["start-separation"]; item.items[0].supplier_accepted_quantity=3;
    const state=await setup(page,[item]); const dialog=await openDetails(page);
    await dialog.getByRole("button",{name:"Iniciar separação",exact:true}).click();
    await dialog.getByRole("region",{name:"Confirmação da operação"}).getByRole("button",{name:"Iniciar separação",exact:true}).click();
    await expect(dialog.getByText("Em separação (SEPARATING)")).toBeVisible();
    await dialog.getByRole("button",{name:"Criar lote",exact:true}).click();
    await dialog.getByRole("button",{name:"Criar lote de atendimento",exact:true}).click();
    await expect(dialog.getByText("SEPARATING · Versão do lote: 1")).toBeVisible();
    await expect(dialog.getByRole("button",{name:"Marcar lote como pronto",exact:true})).toBeDisabled();
    await dialog.getByRole("button",{name:"Registrar separação do lote",exact:true}).click();
    await dialog.getByRole("spinbutton").fill("3");
    await dialog.getByRole("button",{name:"Registrar separação",exact:true}).click();
    await expect(dialog.getByText("SEPARATING · Versão do lote: 2")).toBeVisible();
    await dialog.getByRole("button",{name:"Marcar lote como pronto",exact:true}).click();
    await dialog.getByRole("region",{name:"Confirmação da operação"}).getByRole("button",{name:"Marcar lote como pronto",exact:true}).click();
    await expect(dialog.getByText("Pronto para coleta (READY_TO_DISPATCH)")).toBeVisible();
    expect(state.posts.map(post=>post.body.expected_version)).toEqual([3,4,1,2]);
    expect(state.posts.every(post=>post.key===undefined)).toBe(true);
    await dialog.getByRole("button",{name:"Fechar",exact:true}).click();
    await page.getByRole("navigation").getByRole("link",{name:"Dashboard",exact:true}).click();
    await expect(page.getByRole("link",{name:"Prontos para coleta: 1. Ver pedidos"})).toBeVisible();
});
test("autorização e falha temporária não recorrem aos dados locais", async ({page}) => {
    const state=await setup(page,[makeOrder()]); state.failList=403; await page.goto("/fornecedor");
    await expect(page.getByRole("alert")).toContainText("Sem autorização");
    await expect(page.getByRole("link",{name:/Pedidos recebidos:/})).toHaveCount(0);
    state.failList=503; await page.getByRole("button",{name:"Tentar novamente"}).click();
    await expect(page.getByRole("alert")).toContainText("Não foi possível");
    state.failList=0; await page.getByRole("button",{name:"Tentar novamente"}).click();
    await expect(page.getByRole("link",{name:"Pedidos recebidos: 1. Ver pedidos"})).toBeVisible();
    await expect(page.getByText("LOCAL-ONLY")).toHaveCount(0);
});
test("conflito de versão não avança o pedido e permite revisão", async ({page}) => {
    const state=await setup(page,[makeOrder()]); state.conflict=true; const dialog=await openDetails(page);
    await dialog.getByRole("button",{name:"Aceitar pedido",exact:true}).click();
    await dialog.getByRole("button",{name:"Confirmar aceite",exact:true}).click();
    await expect(dialog.getByRole("alert")).toContainText("Conflito de versão");
    await expect(dialog.getByText("Aguardando aceite (AWAITING_SUPPLIER_DECISION)")).toBeVisible();
    expect(state.posts).toHaveLength(1);
    await dialog.getByRole("button",{name:"Atualizar pedido e revisar"}).click();
    await expect(dialog.getByRole("region",{name:"Confirmação da operação"})).toHaveCount(0);
});
test("portal API e detalhes permanecem utilizáveis no celular", async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await setup(page,[makeOrder()]);
    const dialog=await openDetails(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("R$ 0,30",{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await dialog.getByRole("button",{name:"Fechar",exact:true}).click();
    await page.getByRole("button",{name:"Abrir menu"}).click();
    await expect(page.getByRole("dialog",{name:"Menu do fornecedor"}).getByLabel("1 pedido aguardando aceite")).toBeVisible();
});
test("logout e nova organização limpam pedidos e contadores anteriores", async ({page}) => {
    const state=await setup(page,[makeOrder()]);
    await page.goto("/fornecedor");
    await expect(page.getByRole("link",{name:"Pedidos recebidos: 1. Ver pedidos"})).toBeVisible();
    await page.getByRole("button",{name:"Sair",exact:true}).click();
    await expect(page).toHaveURL(/\/login$/);
    const nextOrg="77777777-7777-4777-8777-777777777777";
    state.identity={...user,id:"another-user",organization_id:nextOrg,organizations:[{id:nextOrg,name:"Outra organização",role:"SUPPLIER_OPERATOR"}]};
    state.items=[];
    await page.getByLabel("E-mail",{exact:true}).fill("another@example.invalid");
    await page.getByLabel("Senha",{exact:true}).fill("test-input-only");
    await page.getByRole("button",{name:"Entrar",exact:true}).click();
    await expect(page.getByRole("link",{name:"Pedidos recebidos: 0. Ver pedidos"})).toBeVisible();
    await expect(page.getByText(id,{exact:true})).toHaveCount(0);
    await expect(page.getByRole("navigation").getByLabel("1 pedido aguardando aceite")).toHaveCount(0);
    expect(state.posts).toHaveLength(0);
});
test("prazo expirado bloqueia aceite sem inventar transição de estado", async ({page}) => {
    const item=makeOrder(); item.acceptance_deadline="2000-01-01T00:00:00Z";
    const state=await setup(page,[item]); const dialog=await openDetails(page);
    await expect(dialog.getByRole("timer")).toHaveText("Prazo encerrado");
    await expect(dialog.getByRole("button",{name:"Aceitar pedido",exact:true})).toHaveCount(0);
    await expect(dialog.getByText("Aguardando aceite (AWAITING_SUPPLIER_DECISION)")).toBeVisible();
    expect(state.posts).toHaveLength(0);
});
