import { authenticatedRequest } from "../../services/apiAuth.service";
import { ApiError } from "../../../shared/api/http";

// catalog/schemas.py: ProductResponse. No price, image or inventory fields.
export type CatalogProduct = {
    id: string; name: string; brand: string; category: string; gtin: string | null;
    net_content: number; net_content_unit: "g" | "ml" | "un";
    packaging_type: string; packaging_quantity: number; gross_weight_grams: number;
    volume_cm3: number; variant_attributes: Record<string, string>;
    publication_state: string; version: number; demo_run_id: string; is_synthetic: true;
};
export type CatalogPage = { items: CatalogProduct[]; total: number; page: number; page_size: number; is_synthetic: true; label: string };
type Transport = <T>(path: string, options?: RequestInit) => Promise<T>;
export class CatalogRepository {
    private organizationId: string;
    private transport: Transport;
    constructor(organizationId: string, transport: Transport = authenticatedRequest) {
        this.organizationId = organizationId;
        this.transport = transport;
    }
    private options(): RequestInit {
        if (!this.organizationId) throw new Error("Organização não disponível. Entre novamente.");
        return { headers: { "X-Organization-Id": this.organizationId } };
    }
    async list(page = 1, search = ""): Promise<CatalogPage> {
        const query = new URLSearchParams({page: String(page), page_size: "25"});
        if (search.trim()) query.set("search", search.trim());
        return this.transport<CatalogPage>(`/api/v1/products?${query}`, this.options());
    }
    async detail(id: string): Promise<CatalogProduct> {
        const product = await this.transport<CatalogProduct>(`/api/v1/products/${encodeURIComponent(id)}`, this.options());
        if (product.id !== id) throw new Error("Produto diferente do solicitado.");
        return product;
    }
}
export function catalogError(error: unknown): string {
    if (error instanceof ApiError) {
        const messages: Record<number, string> = {
            401: "Sessão expirada. Entre novamente.",
            403: "Sem autorização para consultar o catálogo.",
            404: "Produto não encontrado ou não publicado.",
            422: "Pesquisa inválida. Revise os dados informados.",
        };
        return messages[error.status] ?? "Não foi possível consultar o catálogo. Tente novamente.";
    }
    return error instanceof Error ? error.message : "Não foi possível consultar o catálogo.";
}
export function productCategory(category: string): string {
    return category === "ALIMENTO_SECO_INDUSTRIALIZADO" ? "Alimento seco industrializado" : category;
}
export function publicationLabel(state: string): string {
    return state === "PUBLISHED" ? "Publicado" : state === "DRAFT" ? "Rascunho" : state;
}
