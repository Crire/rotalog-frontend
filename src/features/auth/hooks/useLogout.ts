import { useNavigate } from "react-router-dom";

import { useAuth } from "./useAuth";
import { useCart } from "../../cart/hooks/useCart";

export function useLogout() {
    const { logout } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        clearCart();

        navigate("/login", {
            replace: true,
            state: null,
        });
    }

    return handleLogout;
}
