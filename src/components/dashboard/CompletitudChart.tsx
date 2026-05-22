import { CompletitudPorTipo } from "../../types";
import Skeleton from "./Skeleton";

function tipoLabel(tipo: string) {
    const map: Record<string, string> = {
        tractocamion: 'Tractocamion',
        mudancero: 'Mudancero',
        camioneta: 'Camioneta'
    }
}

const barColors: Record<string, string> = {
    tractocamion: '#0f1f3d',
    mudancero:    '#2563eb',
    camioneta:    '#93c5fd',
}
 
export default function CompletitudChart({ data, loading }: { data?: CompletitudPorTipo[]; loading: boolean }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Completitud por tipo de unidad
            </p>
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.map((item) => (
                        <div key={item.tipo}>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-gray-700">{tipoLabel(item.tipo)}</span>
                                <span className="text-sm font-medium text-gray-900">{item.porcentaje}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width:      `${item.porcentaje}%`,
                                        background: barColors[item.tipo] ?? '#0f1f3d'
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {item.completos} de {item.total} unidades
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
