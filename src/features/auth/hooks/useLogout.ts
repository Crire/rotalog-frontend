import { useNavigate } from "react-router-dom";

import { useAuth } from "./useAuth";

export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();

        navigate("/login", {
            replace: true,
            state: null,
        });
    }

    return handleLogout;
}
