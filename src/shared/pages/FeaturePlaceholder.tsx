
type FeaturePlaceholderProps = {
    title: string;
    description: string;
};

export function FeaturePlaceholder({
    title,
    description,
}: FeaturePlaceholderProps) {
    return (
        <div className="mx-auto w-full max-w-7xl">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    Em desenvolvimento
                </span>

                <h1 className="mt-4 text-2xl font-bold text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    {description}
                </p>

                <p className="mt-6 text-sm text-slate-500">
                    Esta página está em preparação. Os dados e as
                    funcionalidades serão integrados à API do RotaLog
                    conforme os contratos disponibilizados pelo Backend.
                </p>
            </div>
        </div>
    );
}
