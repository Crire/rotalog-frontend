
import type { Organization } from "../../features/organizations/mocks/organizations.mock";
import type { MockUser } from "../../features/auth/mocks/users.mock";

type HeaderProps = {
    userName: string;
    userRole: string;
    organizationName: string;
    organizations: Organization[];
    activeOrganizationId: string;
    onOrganizationChange: (id: string) => void;
    users: MockUser[];
    activeUserId: string;
    onUserChange: (id: string) => void;
};

export function Header({
    userName,
    userRole,
    organizationName,
    organizations,
    activeOrganizationId,
    onOrganizationChange,
    users,
    activeUserId,
    onUserChange,
}: HeaderProps) {
    return (
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <label
                        htmlFor="organization-select"
                        className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                        Organização ativa
                    </label>

                    <select
                        id="organization-select"
                        value={activeOrganizationId}
                        onChange={(event) =>
                            onOrganizationChange(event.target.value)
                        }
                        className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                        {organizations.map((organization) => (
                            <option key={organization.id} value={organization.id}>
                                {organization.name}
                            </option>
                        ))}
                    </select>

                    <p className="sr-only">
                        Organização selecionada: {organizationName}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="mock-user-select"
                            className="text-xs font-medium text-slate-500"
                        >
                            Usuário de teste
                        </label>

                        <select
                            id="mock-user-select"
                            value={activeUserId}
                            onChange={(event) =>
                                onUserChange(event.target.value)
                            }
                            className="max-w-56 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-slate-900"
                        >
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        Demo
                    </span>

                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                            {userName}
                        </p>
                        <p className="text-xs text-slate-500">
                            {userRole}
                        </p>
                    </div>

                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
                        aria-hidden="true"
                    >
                        {userName.trim().charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
            </div>
        </header>
    );
}
