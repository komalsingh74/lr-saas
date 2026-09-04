type TableBodyLoaderProps = {
    colSpan: number;
    label?: string;
};

export default function TableBodyLoader({ colSpan, label = "Loading" }: TableBodyLoaderProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="p-0">
                <div className="flex min-h-56 flex-col items-center justify-center gap-4 bg-white">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
                        <div className="absolute inset-3 animate-pulse rounded-full bg-indigo-100" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                        <span className="flex gap-1" aria-hidden="true">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                        </span>
                    </div>
                </div>
            </td>
        </tr>
    );
}
