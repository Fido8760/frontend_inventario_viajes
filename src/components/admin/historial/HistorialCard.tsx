import { Link, useNavigate } from "react-router-dom"
import { HistorialOperadorItem, HistorialUnidadItem } from "../../../views/admin/historial/types"
import { formatDate } from "../../../utils/formatDate"

export type HistorialItemNormalizado = {
    id: number
    createdAt: string
    updatedAt: string
    status: string
    entregaInicial: boolean
    observaciones_entrada: string | null
    tituloPrincipal: string
    cajaId: number | null
    cajaLabel: string | null
    totalFotos: number
    esVigenteEnRuta: boolean
}

export function normalizarHistorialUnidad(item: HistorialUnidadItem): HistorialItemNormalizado {
    return {
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        entregaInicial: item.entregaInicial,
        observaciones_entrada: item.observaciones_entrada,
        tituloPrincipal: item.operador
            ? `${item.operador.nombre} ${item.operador.apellido_p} ${item.operador.apellido_m}`
            : 'Sin operador',
        cajaId: item.caja?.id ?? null,
        cajaLabel: item.caja?.numero_caja ?? null,
        totalFotos: item.checklist?.imagenes?.length ?? 0,
        esVigenteEnRuta: item.status === 'EN_RUTA'
    }
}

export function normalizarHistorialOperador(item: HistorialOperadorItem): HistorialItemNormalizado {
    return {
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        entregaInicial: item.entregaInicial,
        observaciones_entrada: item.observaciones_entrada,
        tituloPrincipal: `Unidad ${item.unidad.no_unidad}`,
        cajaId: item.caja?.id ?? null,
        cajaLabel: item.caja?.numero_caja ?? null,
        totalFotos: item.checklist?.imagenes?.length ?? 0,
        esVigenteEnRuta: item.status === 'EN_RUTA'
    }
}

const statusLabel: Record<string, string> = {
    CREADA: 'Creada',
    CHECKLIST_PENDIENTE: 'Checklist pendiente',
    FOTOS_PENDIENTES: 'Fotos pendientes',
    EN_RUTA: 'En ruta',
    COMPLETA: 'Completa'
}

const statusColor: Record<string, string> = {
    CREADA: 'bg-gray-100 text-gray-600',
    CHECKLIST_PENDIENTE: 'bg-amber-50 text-amber-700',
    FOTOS_PENDIENTES: 'bg-amber-50 text-amber-700',
    EN_RUTA: 'bg-blue-50 text-blue-700',
    COMPLETA: 'bg-green-50 text-green-700'
}

type HistorialCardProps = {
    item: HistorialItemNormalizado
    cambioDeRemolque: boolean
}

export default function HistorialCard({ item, cambioDeRemolque }: HistorialCardProps) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/asignacion/${item.id}`)}
            className={`cursor-pointer bg-white rounded-xl border p-4 transition-colors hover:border-gray-300 ${
                item.entregaInicial
                    ? 'border-blue-200 bg-blue-50/40'
                    : 'border-gray-100'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {item.entregaInicial && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                Entrega inicial
                            </span>
                        )}
                        {cambioDeRemolque && !item.entregaInicial && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                Cambio de remolque
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{item.tituloPrincipal}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(item.createdAt)}
                        {item.cajaLabel && ` · Caja ${item.cajaLabel}`}
                    </p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColor[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[item.status] ?? item.status}
                </span>
            </div>


            {item.observaciones_entrada && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                    {item.observaciones_entrada}
                </p>
            )}

            <div
                className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50"
            >
                <span className="text-xs text-gray-400">{item.totalFotos} foto{item.totalFotos !== 1 ? 's' : ''} en este viaje</span>
                <Link
                    to={`/asignacion/${item.id}/ver-fotos`}
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-[#0f1f3d] font-medium hover:underline"
                >
                    Ver fotos →
                </Link>
            </div>
        </div>
    )
}
