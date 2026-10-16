
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../../services/auth.service";

type ProtectedRouteProps = {
    allowedRoles: UserRole[];
    children: ReactNode;
};

export function ProtectedRoute({
    allowedRoles,
    children,
}: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={user.role === "BUYER_ADMIN" ? "/" : "/fornecedor"}
                replace
            />
        );
    }

    return <>{children}</>;
}
