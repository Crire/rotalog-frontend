import { apiUrl } from "./config";

export class ApiError extends Error {
    status: number;
    constructor(status: number) {
        super(status === 401 ? "E-mail ou senha inválidos, ou sessão expirada." : status === 403 ? "Acesso não autorizado." : status === 429 ? "Muitas tentativas. Aguarde antes de tentar novamente." : "Não foi possível concluir a solicitação ao servidor.");
        this.status = status;
    }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${apiUrl}${path}`, { ...options, credentials: "include", cache: "no-store" });
    } catch {
        throw new Error("Não foi possível conectar ao Backend. Verifique sua conexão.");
    }
    if (!response.ok) throw new ApiError(response.status);
    return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
