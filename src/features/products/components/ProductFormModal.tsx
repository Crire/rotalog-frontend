import { useState, useRef, type FormEvent } from "react";
import type { SupplierProduct } from "../mocks/products.mock";
import { createSupplierProducts, editSupplierProduct } from "../services/supplierProducts.service";
import { ProductManagementDialog } from "./ProductManagementDialog";

type Props = { organizationId: string; product?: SupplierProduct; onClose: () => void; onSaved: () => void };
export function ProductFormModal({ organizationId, product, onClose, onSaved }: Props) {
    const [error, setError] = useState<string | null>(null);
    const saving = useRef(false);
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving.current) return;
        saving.current = true;
        try {
            const data = new FormData(event.currentTarget);
            const changes = { name: String(data.get("name") ?? ""), category: String(data.get("category") ?? ""), unit: String(data.get("unit") ?? ""), price: Number(data.get("price")) };
            if (product) editSupplierProduct(organizationId, product.id, changes);
            else createSupplierProducts(organizationId, [{ ...changes, id: String(data.get("id") ?? ""), stock: Number(data.get("stock")) }]);
            onSaved();
        } catch (failure) { saving.current = false; setError(failure instanceof Error ? failure.message : "Falha ao salvar produto."); }
    }
    const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-2 focus:outline-blue-200";
    return <ProductManagementDialog title={product ? "Editar produto" : "Novo produto"} onClose={onClose}>
        <form onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Código do produto<input name="id" required defaultValue={product?.id} readOnly={!!product} className={`${fieldClass} read-only:bg-slate-100`} /></label>
                <label className="text-sm font-medium">Nome<input name="name" required defaultValue={product?.name} className={fieldClass} /></label>
                <label className="text-sm font-medium">Categoria<input name="category" required defaultValue={product?.category} className={fieldClass} /></label>
                <label className="text-sm font-medium">Unidade de medida<input name="unit" required defaultValue={product?.unit} placeholder="Ex.: Unidade, kg, m³" className={fieldClass} /></label>
                <label className="text-sm font-medium">Preço unitário (R$)<input name="price" type="number" required min="0.01" step="0.01" defaultValue={product?.price} className={fieldClass} /></label>
                {!product && <label className="text-sm font-medium">Quantidade inicial em estoque<input name="stock" type="number" required min="0" step="any" defaultValue="0" className={fieldClass} /></label>}
            </div>
            {product && <p className="mt-4 text-xs text-slate-500">Código e fornecedor são preservados. Quantidades devem ser ajustadas no módulo Estoque, com registro de movimentação.</p>}
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <footer className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button><button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Salvar produto</button></footer>
        </form>
    </ProductManagementDialog>;
}
