const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const storage = new Map();
let failWrite = false;
const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if (failWrite) throw new Error('Storage full'); storage.set(key, value); } };
let queue = Promise.resolve();
const navigator = { locks: { request: (_name, callback) => { const result = queue.then(callback); queue = result.catch(() => {}); return result; } } };
function load(path, dependencies = {}) {
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, require: id => dependencies[id] ?? require(id), localStorage, navigator, window: { dispatchEvent() {} }, Event: class {} });
    return module.exports;
}
const productMocks = load('src/features/products/mocks/products.mock.ts');
const orderMocks = load('src/features/orders/mocks/orders.mock.ts');
const stock = load('src/features/inventory/services/stockReservation.ts');
const products = load('src/features/products/services/supplierProducts.service.ts', { '../mocks/products.mock': productMocks });
const orders = load('src/features/orders/services/supplierOrders.service.ts', {
    '../mocks/orders.mock': orderMocks,
    '../../inventory/services/stockReservation': stock,
    '../../products/services/supplierProducts.service': products,
});
const generator = load('src/features/orders/services/testOrderItems.ts', {
    '../../inventory/services/stockReservation': stock,
    '../../products/services/supplierProducts.service': products,
});
const org = 'fornecedor-001';
const makeOrder = (id, items, organizationId = org) => ({ id, organizationId, customer: 'Teste', date: '2026-10-19', total: 10, items: items?.length ?? 0, status: 'Pendente', commercialStatus: 'Aguardando aceite', custodyStatus: 'Aguardando separação', orderItems: items });
const item = (productId, quantity) => ({ productId, productName: 'Teste', quantity, unitPrice: 10 });
const key = 'rotalog:supplier-orders:v1';
function seed(...extra) { storage.clear(); orders.saveSupplierOrders([...orderMocks.ordersMock, ...extra]); }
async function run() {
    seed();
    const productsBeforeTest = JSON.stringify(products.getSupplierProducts(org));
    const savedBeforeTest = storage.get(key);
    const generatedItems = generator.getTestOrderItems(org, orders.getSupplierOrders());
    assert.equal(storage.get(key), savedBeforeTest, 'generation must not reserve');
    for (const line of generatedItems) {
        const catalogProduct = products.getSupplierProducts(org).find(p => p.id === line.productId);
        assert.ok(catalogProduct);
        assert.equal(line.productName, catalogProduct.name);
        assert.equal(line.unitPrice, catalogProduct.price);
        assert.ok(line.quantity > 0 && line.quantity <= catalogProduct.stock);
    }
    const testOrder = makeOrder('GENERATED', generatedItems);
    testOrder.total = generatedItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    orders.saveSupplierOrders([...orders.getSupplierOrders(), testOrder]);
    assert.equal(orders.getSupplierOrders().find(o => o.id === 'GENERATED').total, testOrder.total);
    const afterGenerated = await orders.localSupplierOrderAcceptanceService.accept(org, testOrder.id);
    for (const line of generatedItems) {
        const catalogProduct = products.getSupplierProducts(org).find(p => p.id === line.productId);
        const balance = stock.getStockBalance(catalogProduct, afterGenerated);
        assert.equal(balance.reserved, line.quantity);
        assert.equal(balance.available, catalogProduct.stock - line.quantity);
        assert.equal(balance.physical, catalogProduct.stock);
    }
    await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, testOrder.id));
    assert.equal(JSON.stringify(products.getSupplierProducts(org)), productsBeforeTest);
    const allProducts = products.getSupplierProducts(org);
    const allReserved = { ...makeOrder('ALL-RESERVED', []), commercialStatus: 'Aceito', stockReservation: { reservedAt: new Date().toISOString(), items: allProducts.filter(p => p.stock > 0).map(p => ({ productId: p.id, quantity: p.stock })) } };
    assert.throws(() => generator.getTestOrderItems(org, [allReserved]));
    assert.throws(() => generator.getTestOrderItems('unknown-organization', []));
    const fractional = { ...allReserved, stockReservation: { ...allReserved.stockReservation, items: allReserved.stockReservation.items.map(line => ({ ...line, quantity: line.productId === 'PROD-001' ? line.quantity - 0.25 : line.quantity })) } };
    const fractionalItems = generator.getTestOrderItems(org, [fractional]);
    assert.equal(fractionalItems.length, 1);
    assert.equal(fractionalItems[0].productId, 'PROD-001');
    assert.equal(fractionalItems[0].quantity, 0.25);
    const otherItems = generator.getTestOrderItems('fornecedor-002', []);
    assert.ok(otherItems.every(line => products.getSupplierProducts('fornecedor-002').some(p => p.id === line.productId)));
    const originalProducts = JSON.stringify(products.getSupplierProducts(org));
    seed(makeOrder('OK', [item('PROD-001', 2), item('PROD-002', 3)]));
    const accepted = await orders.localSupplierOrderAcceptanceService.accept(org, 'OK');
    assert.equal(accepted.find(o => o.id === 'OK').commercialStatus, 'Aceito');
    const product = products.getSupplierProducts(org).find(p => p.id === 'PROD-001');
    const balance = stock.getStockBalance(product, accepted);
    assert.equal(balance.physical, 120); assert.equal(balance.reserved, 2); assert.equal(balance.available, 118);
    assert.equal(JSON.stringify(products.getSupplierProducts(org)), originalProducts);
    assert.ok(!accepted.find(o => o.id === 'PED-002').stockReservation, 'no retroactive reservation');
    const separating = orders.changeSupplierOrderOperationalStatus(accepted, org, 'OK', 'start-separation');
    const ready = orders.changeSupplierOrderOperationalStatus(separating, org, 'OK', 'mark-ready');
    orders.saveSupplierOrders(ready);
    assert.equal(stock.getStockBalance(product, orders.getSupplierOrders()).reserved, 2);
    await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, 'OK'));
    assert.equal(stock.getStockBalance(product, orders.getSupplierOrders()).reserved, 2);
    for (const [name, items] of [
        ['insufficient', [item('PROD-001', 1), item('PROD-002', 999)]],
        ['missing', [item('MISSING', 1)]],
        ['foreign product', [item('PROD-101', 1)]],
        ['empty', []], ['legacy without items', undefined],
        ['negative', [item('PROD-001', -1)]],
        ['invalid', [item('PROD-001', NaN)]],
        ['duplicate lines exceed stock', [item('PROD-002', 5), item('PROD-002', 5)]],
    ]) {
        seed(makeOrder('BAD', items));
        const before = storage.get(key);
        await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, 'BAD'), name);
        assert.equal(storage.get(key), before, name + ' must not write partially');
    }
    seed(makeOrder('FOREIGN', [item('PROD-101', 1)], 'fornecedor-002'));
    const beforeForeign = storage.get(key);
    await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, 'FOREIGN'));
    assert.equal(storage.get(key), beforeForeign);
    seed(makeOrder('ORG1', [item('PROD-001', 2)]), makeOrder('ORG2', [item('PROD-001', 1)], 'fornecedor-002'));
    products.createSupplierProducts('fornecedor-002', [{ id: 'PROD-001', name: 'Outro fornecedor', category: 'Teste', unit: 'kg', stock: 10, price: 1 }]);
    await orders.localSupplierOrderAcceptanceService.accept(org, 'ORG1');
    await orders.localSupplierOrderAcceptanceService.accept('fornecedor-002', 'ORG2');
    const other = products.getSupplierProducts('fornecedor-002').find(p => p.id === 'PROD-001');
    assert.equal(stock.getStockBalance(other, orders.getSupplierOrders()).reserved, 1);
    assert.equal(stock.getStockBalance(product, orders.getSupplierOrders()).reserved, 2);
    seed(makeOrder('A', [item('PROD-002', 6)]), makeOrder('B', [item('PROD-002', 6)]));
    const results = await Promise.allSettled([
        orders.localSupplierOrderAcceptanceService.accept(org, 'A'),
        orders.localSupplierOrderAcceptanceService.accept(org, 'B'),
    ]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const sand = products.getSupplierProducts(org).find(p => p.id === 'PROD-002');
    assert.equal(stock.getStockBalance(sand, orders.getSupplierOrders()).available, 2);
    seed(makeOrder('SAME', [item('PROD-001', 2)]));
    const stale = orders.getSupplierOrders();
    const same = await Promise.allSettled([orders.localSupplierOrderAcceptanceService.accept(org, 'SAME'), orders.localSupplierOrderAcceptanceService.accept(org, 'SAME')]);
    assert.equal(same.filter(result => result.status === 'fulfilled').length, 1);
    assert.throws(() => orders.saveSupplierOrders(stale), 'stale snapshot cannot erase reservation');
    seed(makeOrder('FAIL', [item('PROD-001', 2)]));
    const before = storage.get(key); failWrite = true;
    await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, 'FAIL'));
    failWrite = false; assert.equal(storage.get(key), before);
    storage.set(key, '{invalid');
    await assert.rejects(() => orders.localSupplierOrderAcceptanceService.accept(org, 'FAIL'));
    assert.equal(storage.get(key), '{invalid');
    console.log('Stock reservation: sufficient/insufficient stock, invalid/missing items, duplicate reservation, organization isolation, atomic writes, serialized acceptance, physical stock and legacy compatibility OK');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
