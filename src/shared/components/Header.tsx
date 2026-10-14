
type HeaderProps = {
    userName: string;
    organizationName: string;
    userRole: string;
};

export function Header({
    userName,
    organizationName,
    userRole,
}: HeaderProps) {
    return (
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Organização ativa
                    </p>

                    <h2 className="truncate text-lg font-semibold text-slate-900">
                        {organizationName}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        Demonstração
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
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
                        aria-hidden="true"
                    >
                        {userName.trim().charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
            </div>
        </header>
    );
}
