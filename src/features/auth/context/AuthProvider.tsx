
import { useState, type ReactNode } from "react";

import { AuthContext } from "./AuthContext";

import {
    mockAuthService,
    type AuthUser,
    type LoginCredentials,
} from "../../services/auth.service";

type AuthProviderProps = {
    children: ReactNode;
};

const SESSION_KEY = "rotalog:mock-auth-user";

function getStoredUser(): AuthUser | null {
    try {
        const storedUser = sessionStorage.getItem(SESSION_KEY);

        if (!storedUser) {
            return null;
        }

        const parsedUser: unknown = JSON.parse(storedUser);

        if (
            typeof parsedUser !== "object" ||
            parsedUser === null ||
            !("id" in parsedUser) ||
            !("name" in parsedUser) ||
            !("email" in parsedUser) ||
            !("role" in parsedUser) ||
            typeof parsedUser.id !== "string" ||
            typeof parsedUser.name !== "string" ||
            typeof parsedUser.email !== "string" ||
            (parsedUser.role !== "BUYER_ADMIN" &&
                parsedUser.role !== "SUPPLIER_OPERATOR")
        ) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }

        return {
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role,
        };
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(getStoredUser);

    async function login(credentials: LoginCredentials) {
        const authenticatedUser = await mockAuthService.login(credentials);

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(authenticatedUser)
        );

        setUser(authenticatedUser);

        return authenticatedUser;
    }

    async function logout() {
        await mockAuthService.logout();

        sessionStorage.removeItem(SESSION_KEY);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
