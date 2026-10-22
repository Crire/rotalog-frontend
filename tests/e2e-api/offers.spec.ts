import {test,expect,type Page} from '@playwright/test';
const org='11111111-1111-4111-8111-111111111111';
const warehouse={id:'warehouse',supplier_organization_id:org,name:'Depósito Central',address:'Rua Central, 100',region:'Manaus',opening_hours:'08h às 18h',geocoding_state:'CONFIRMED',is_active:true,version:1,demo_run_id:'demo',is_synthetic:true,latitude:null,longitude:null};
const product={id:'product',name:'Arroz oficial',brand:'Marca',category:'ALIMENTO_SECO_INDUSTRIALIZADO',gtin:null,net_content:1000,net_content_unit:'g',packaging_type:'Pacote',packaging_quantity:1,gross_weight_grams:1050,volume_cm3:1000,variant_attributes:{},publication_state:'PUBLISHED',version:1,demo_run_id:'demo',is_synthetic:true};
const offer={id:'offer',product_id:product.id,product_name:product.name,supplier_organization_id:org,supplier_name:'Fornecedor',warehouse_id:warehouse.id,region:'Manaus',unit_price:'10.00',currency:'BRL',minimum_order_quantity:1,available_quantity:0,is_active:true,version:1,demo_run_id:'demo',is_synthetic:true};
async function setup(page:Page) {
    const state={warehouses:[{...warehouse},{...warehouse,id:'pending',name:'Origem pendente',geocoding_state:'PENDING'},{...warehouse,id:'inactive',name:'Origem inativa',is_active:false}],offers:[] as typeof offer[],posts:[] as {path:string;body:Record<string,unknown>}[],conflict:false,uncertain:false,network:false,foreign:false};
    await page.addInitScript(()=>sessionStorage.setItem('rotalog:api-csrf','csrf'));
    await page.route('http://localhost:8000/api/v1/**',async route=>{
        const request=route.request(),url=new URL(request.url()),path=url.pathname;
        const user={id:'user',name:'Fornecedor',email:'supplier@example.invalid',role:'SUPPLIER_OPERATOR',organization_id:org,organizations:[{id:org,name:'Fornecedor',role:'SUPPLIER_OPERATOR'}],capabilities:['catalog:read','offer:write','inventory:write','supplier_order:manage'],demo_run_id:'demo',is_synthetic:true};
        if(path.endsWith('/auth/refresh'))return route.fulfill({json:{access_token:'access',token_type:'bearer',expires_in:600,csrf_token:'csrf',refresh_token:null,user}});
        if(path.endsWith('/me'))return route.fulfill({json:user});
        expect(request.headers()['authorization']).toBe('Bearer access');
        expect(request.headers()['x-organization-id']).toBe(org);
        if(path==='/api/v1/supplier-orders')return route.fulfill({json:{items:[],total:0,page:1,page_size:100}});
        if(path==='/api/v1/products')return route.fulfill({json:{items:[product],total:1,page:1,page_size:25,is_synthetic:true}});
        if(path==='/api/v1/products/product')return route.fulfill({json:product});
        if(request.method()==='POST') {
            state.posts.push({path,body:request.postDataJSON()});
            if(state.conflict)return route.fulfill({status:409,json:{error:{code:'VERSION_CONFLICT'}}});
            if(path===`/api/v1/suppliers/${org}/offers`) {
                const body=request.postDataJSON();state.offers.push({...offer,unit_price:body.unit_price,minimum_order_quantity:body.minimum_order_quantity});
                if(state.uncertain)return route.abort('failed');
                return route.fulfill({status:201,json:state.offers[0]});
            }
            expect(request.postDataJSON().expected_version).toBe(state.offers[0].version);
            if(path.endsWith('/price-changes')) {
                const body=request.postDataJSON();Object.assign(state.offers[0],{unit_price:body.unit_price,minimum_order_quantity:body.minimum_order_quantity,version:state.offers[0].version+1});
                return route.fulfill({json:state.offers[0]});
            }
            if(path.endsWith('/pause')) {const paused={...state.offers[0],is_active:false,version:state.offers[0].version+1};state.offers=[];return route.fulfill({json:paused});}
            throw new Error(`Unexpected mutation: ${path}`);
        }
        if(state.network)return route.abort('failed');
        if(path==='/api/v1/warehouses')return route.fulfill({json:{items:state.warehouses,total:state.warehouses.length,page:1,page_size:100}});
        if(path==='/api/v1/offers') {
            expect(url.searchParams.get('supplier_id')).toBe(org);
            const items=state.foreign?[{...offer,supplier_organization_id:'other'}]:state.offers;
            return route.fulfill({json:{items,total:items.length,page:1,page_size:25}});
        }
        throw new Error(`Unexpected path: ${path}`);
    });
    return state;
}
async function reviewCreate(page:Page) {
    await page.getByRole('button',{name:'Criar oferta para produto existente',exact:true}).click();
    const dialog=page.getByRole('dialog');
    await dialog.getByRole('combobox',{name:'Produto publicado',exact:true}).selectOption(product.id);
    await expect(dialog.getByRole('combobox',{name:'Produto publicado',exact:true})).toHaveValue(product.id);
    await expect(dialog.getByRole('combobox',{name:'Depósito elegível',exact:true})).toBeEnabled();
    await dialog.getByRole('combobox',{name:'Depósito elegível',exact:true}).selectOption(warehouse.id);
    await dialog.getByLabel('Preço unitário (R$)',{exact:true}).fill('12,30');
    await dialog.getByLabel('Quantidade mínima de pedido',{exact:true}).fill('3');
    await dialog.getByRole('button',{name:'Revisar oferta',exact:true}).click();
    await expect(dialog.getByRole('region',{name:'Revisão da oferta'})).toContainText('Depósito Central');
    return dialog;
}
test('depósitos elegíveis, criar, alterar e pausar com versão e confirmação',async({page},testInfo)=>{
    const state=await setup(page);await page.goto('/fornecedor/produtos');
    const deposits=page.getByRole('region',{name:'Depósitos próprios',exact:true});
    await expect(deposits.getByText('Geocodificação pendente · Ativo')).toBeVisible();
    const dialog=await reviewCreate(page);
    expect(state.posts).toHaveLength(0);
    await dialog.getByRole('button',{name:'Confirmar criação',exact:true}).click();
    await expect(page.getByText('Oferta criada com sucesso.',{exact:true})).toBeVisible();
    expect(state.posts[0].body).toEqual({product_id:'product',warehouse_id:'warehouse',unit_price:'12.30',currency:'BRL',minimum_order_quantity:3});
    const offers=page.getByRole('region',{name:'Minhas ofertas',exact:true});
    await expect(offers.getByRole('cell',{name:'R$ 12,30',exact:true})).toBeVisible();
    await page.screenshot({path:testInfo.outputPath('ofertas-desktop.png'),fullPage:true});
    await offers.getByRole('button',{name:'Alterar oferta',exact:true}).click();
    await page.getByRole('dialog').getByLabel('Preço unitário (R$)',{exact:true}).fill('15.25');
    await page.getByRole('dialog').getByLabel('Quantidade mínima de pedido',{exact:true}).fill('5');
    await page.getByRole('dialog').getByRole('button',{name:'Revisar oferta',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Confirmar alteração',exact:true}).click();
    await expect(offers.getByRole('cell',{name:'R$ 15,25',exact:true})).toBeVisible();
    expect(state.posts[1].body).toEqual({expected_version:1,unit_price:'15.25',currency:'BRL',minimum_order_quantity:5});
    await offers.getByRole('button',{name:'Pausar oferta',exact:true}).click();
    expect(state.posts).toHaveLength(2);
    await page.getByRole('dialog').getByRole('button',{name:'Confirmar pausa',exact:true}).click();
    await expect(offers.getByText('Nenhuma oferta ativa nesta página.')).toBeVisible();
    expect(state.posts[2].body).toEqual({expected_version:2});
});
test('depósitos pendentes e inativos não permitem criar ofertas',async({page})=>{
    const state=await setup(page);state.warehouses=state.warehouses.filter(item=>item.id!=='warehouse');
    await page.goto('/fornecedor/produtos');
    await expect(page.getByText(/Nenhum depósito elegível para ofertas/)).toBeVisible();
    await expect(page.getByRole('button',{name:'Criar oferta para produto existente',exact:true})).toBeDisabled();
    expect(state.posts).toHaveLength(0);
});
test('conflito exige atualização e nova revisão',async({page})=>{
    const state=await setup(page);state.offers=[{...offer}];state.conflict=true;
    await page.goto('/fornecedor/produtos');
    await page.getByRole('button',{name:'Alterar oferta',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Revisar oferta',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Confirmar alteração',exact:true}).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Conflito de versão');
    await expect(page.getByRole('dialog').getByRole('button',{name:'Confirmar alteração',exact:true})).toBeDisabled();
    await page.getByRole('dialog').getByRole('button',{name:'Fechar',exact:true}).click();
    await page.getByRole('button',{name:'Atualizar ofertas e depósitos',exact:true}).click();
    await expect(page.getByRole('button',{name:'Alterar oferta',exact:true})).toBeEnabled();
    expect(state.posts).toHaveLength(1);
});
test('criação com resposta perdida não é repetida e permite conferir o resultado',async({page})=>{
    const state=await setup(page);state.uncertain=true;
    await page.goto('/fornecedor/produtos');const dialog=await reviewCreate(page);
    await dialog.getByRole('button',{name:'Confirmar criação',exact:true}).click();
    await expect(dialog.getByRole('alert')).toContainText('A criação pode ter sido concluída');
    await expect(dialog.getByRole('button',{name:'Confirmar criação',exact:true})).toBeDisabled();
    await dialog.getByRole('button',{name:'Fechar',exact:true}).click();
    await expect(page.getByRole('button',{name:'Criar oferta para produto existente',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Atualizar ofertas e depósitos',exact:true}).click();
    await expect(page.getByRole('cell',{name:'R$ 12,30',exact:true})).toBeVisible();
    expect(state.posts).toHaveLength(1);expect(state.offers).toHaveLength(1);
});
test('rede e resposta de outra organização não disponibilizam ações de gestão',async({page})=>{
    const state=await setup(page);state.network=true;await page.goto('/fornecedor/produtos');
    await expect(page.getByRole('region',{name:'Depósitos próprios',exact:true}).getByRole('alert')).toContainText('conectar');
    state.network=false;state.foreign=true;
    await page.getByRole('button',{name:'Atualizar ofertas e depósitos',exact:true}).click();
    await expect(page.getByRole('region',{name:'Minhas ofertas',exact:true}).getByRole('alert')).toContainText('outra organização');
    await expect(page.getByRole('button',{name:'Alterar oferta',exact:true})).toHaveCount(0);
    expect(state.posts).toHaveLength(0);
});
test('formulário de oferta utilizável em 360px com foco e Escape',async({page},testInfo)=>{
    await page.setViewportSize({width:360,height:800});await setup(page);
    await page.goto('/fornecedor/produtos');const dialog=await reviewCreate(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath('oferta-mobile.png'),fullPage:true});
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Criar oferta para produto existente',exact:true})).toBeFocused();
});
