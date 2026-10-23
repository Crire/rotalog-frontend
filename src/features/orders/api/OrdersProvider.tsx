import { useEffect, useMemo, type ReactNode } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { OrdersRepository } from "./ordersRepository";
import { OrdersContext } from "./ordersContext";

export function ApiOrdersProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const organizationId = user?.organization_id ?? "";
    return <SessionOrdersProvider key={`${user?.id}:${organizationId}`} organizationId={organizationId}>{children}</SessionOrdersProvider>;
}
function SessionOrdersProvider({ organizationId, children }: { organizationId: string; children: ReactNode }) {
    const repository = useMemo(() => new OrdersRepository(organizationId), [organizationId]);
    useEffect(() => {
        repository.activate();
        void repository.refresh();
        let failures = 0;
        let timer: number;
        let active = true;
        const poll = async () => {
            if (!active) return;
            if (document.visibilityState !== "hidden") {
                await repository.refresh();
                failures = repository.snapshot().error ? Math.min(failures + 1, 3) : 0;
            }
            if (active) timer = window.setTimeout(() => void poll(), 15_000 * 2 ** failures);
        };
        const refresh = () => { if (document.visibilityState !== "hidden") void repository.refresh(); };
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        timer = window.setTimeout(() => void poll(), 15_000);
        return () => { active = false; repository.deactivate(); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.clearTimeout(timer); };
    }, [repository]);
    return <OrdersContext.Provider value={repository}>{children}</OrdersContext.Provider>;
}
