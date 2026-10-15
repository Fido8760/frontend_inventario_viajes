import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";

export type HistorialItemNormalizado = {
    id: number;
    createdAt: string;
    fechaDevolucion: string | null;
    motivoDevolucion: string | null;
    tituloPrincipal: string;
    cajaId: number | null;
    cajaLabel: string | null;
    totalViajes: number;
    totalFotos: number;
    estaActiva: boolean;
    tieneViajeEnRuta: boolean;
};

// ── Normalizador para cuando buscas por UNIDAD ─────────────────────────
export function normalizarHistorialUnidad(item: any): HistorialItemNormalizado {
    const recorridos = item.recorridos ?? [];
    
    // Sumamos todas las fotos tomadas en los viajes de esta asignación
    const totalFotos = recorridos.reduce(
        (acc: number, r: any) => acc + (r.checklist?.imagenes?.length ?? 0), 0
    );

    return {
        id: item.id,
        createdAt: item.createdAt,
        fechaDevolucion: item.fechaDevolucion,
        motivoDevolucion: item.motivoDevolucion,
        tituloPrincipal: item.operador
            ? `${item.operador.nombre} ${item.operador.apellido_p} ${item.operador.apellido_m ?? ''}`.trim()
            : 'Sin operador asignado',
        cajaId: item.caja?.id ?? null,
        cajaLabel: item.caja?.numero_caja ?? item.caja?.c_placas ?? null,
        totalViajes: recorridos.length,
        totalFotos,
        estaActiva: item.fechaDevolucion === null,
        tieneViajeEnRuta: recorridos.some((r: any) => r.status === 'EN_RUTA')
    };
}

// ── Normalizador para cuando buscas por OPERADOR ───────────────────────
export function normalizarHistorialOperador(item: any): HistorialItemNormalizado {
    const recorridos = item.recorridos ?? [];
    
    const totalFotos = recorridos.reduce(
        (acc: number, r: any) => acc + (r.checklist?.imagenes?.length ?? 0), 0
    );

    return {
        id: item.id,
        createdAt: item.createdAt,
        fechaDevolucion: item.fechaDevolucion,
        motivoDevolucion: item.motivoDevolucion,
        tituloPrincipal: `Unidad ${item.unidad?.no_unidad ?? '—'} (${item.unidad?.u_placas ?? ''})`,
        cajaId: item.caja?.id ?? null,
        cajaLabel: item.caja?.numero_caja ?? item.caja?.c_placas ?? null,
        totalViajes: recorridos.length,
        totalFotos,
        estaActiva: item.fechaDevolucion === null,
        tieneViajeEnRuta: recorridos.some((r: any) => r.status === 'EN_RUTA')
    };
}

type HistorialCardProps = {
    item: HistorialItemNormalizado;
    cambioDeRemolque: boolean;
};

export default function HistorialCard({ item, cambioDeRemolque }: HistorialCardProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/asignacion/${item.id}`)}
            className={`cursor-pointer bg-white rounded-xl border p-4 transition-all hover:border-gray-300 hover:shadow-sm ${
                item.estaActiva 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-gray-100'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    {/* Badges de Estado de la Asignación */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {item.estaActiva ? (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Asignación Activa
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                Devuelta · {item.motivoDevolucion ? item.motivoDevolucion.replace(/_/g, ' ') : 'Fin de turno'}
                            </span>
                        )}

                        {item.tieneViajeEnRuta && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                En carretera
                            </span>
                        )}

                        {cambioDeRemolque && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                Cambio de remolque
                            </span>
                        )}
                    </div>

                    {/* Título (Chofer o Unidad) */}
                    <p className="text-sm font-bold text-gray-900">{item.tituloPrincipal}</p>
                    
                    {/* Metadatos */}
                    <p className="text-xs text-gray-400 mt-1">
                        Entrega: {formatDate(item.createdAt)}
                        {item.fechaDevolucion && ` · Cierre: ${formatDate(item.fechaDevolucion)}`}
                        {item.cajaLabel && ` · Remolque: Caja ${item.cajaLabel}`}
                    </p>
                </div>

                {/* Contador de Viajes */}
                <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                        {item.totalViajes} viaje{item.totalViajes !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Footer de la Tarjeta */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400">
                    {item.totalFotos} fotografía{item.totalFotos !== 1 ? 's' : ''} de evidencia acumuladas
                </span>
                <Link
                    to={`/asignacion/${item.id}`}
                    onClick={e => e.stopPropagation()}
                    className="text-xs font-semibold text-[#0f1f3d] hover:underline flex items-center gap-1"
                >
                    Ver centro de mando →
                </Link>
            </div>
        </div>
    );
}