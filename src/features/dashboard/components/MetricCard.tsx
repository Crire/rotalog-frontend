
type MetricCardProps = {
    title: string;
    value: number;
    description: string;
};

export function MetricCard({
    title,
    value,
    description,
}: MetricCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">
                {title}
            </h3>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value.toLocaleString("pt-BR")}
            </p>

            <p className="mt-2 text-xs text-slate-500">
                {description}
            </p>
        </article>
    );
}
