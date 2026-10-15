import { CompletitudPorTipo } from "../../types/dashboard";
import { Skeleton } from "../../utils/kpiHelpers";

const barColors: Record<string, string> = {
    tractocamion: '#0f1f3d',
    mudancero:    '#2563eb',
    camioneta:    '#93c5fd',
};

export default function CompletitudChart({ data, cajas, loading }: {
    data?:  CompletitudPorTipo[];
    cajas?: { total: number; conInspeccion: number; porcentaje: number };
    loading: boolean;
}) {
    const rows = data ?? [];

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mt-2">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-bold text-gray-900">Cobertura de revisiones por tipo</p>
                    <p className="text-xs text-gray-400">Unidades con revisión registrada contra flota activa</p>
                </div>
                {cajas && (
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Cajas {cajas.porcentaje}%
                    </span>
                )}
            </div>
            {loading ? (
                <div>
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {rows.map(item => (
                        <div key={item.tipo}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-gray-600">{item.tipo}</span>
                                <span className="text-gray-400">{item.completos}/{item.total}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${item.porcentaje}%`,
                                        backgroundColor: barColors[item.tipo] ?? '#0f1f3d',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    {cajas && (
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-gray-600">Remolques</span>
                                <span className="text-gray-400">{cajas.conInspeccion}/{cajas.total}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-red-700" style={{ width: `${cajas.porcentaje}%` }} />
                            </div>
                        </div>
                    )}
                    {!rows.length && !cajas && (
                        <p className="py-6 text-center text-xs text-gray-400">Sin datos para mostrar.</p>
                    )}
                </div>
            )}
        </div>
    )
}
