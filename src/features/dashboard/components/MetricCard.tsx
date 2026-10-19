
type MetricCardProps = {
    title: string;
    value: number;
};

export function MetricCard({
    title,
    value,
}: MetricCardProps) {
    return (
        <article className="flex h-full min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="min-h-10 text-sm font-medium text-slate-500">
                {title}
            </h3>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value.toLocaleString("pt-BR")}
            </p>

        </article>
    );
}
