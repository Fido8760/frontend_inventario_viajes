import { Link } from "react-router-dom";
import { InspeccionListItem } from "../../../types"
import { formatDate } from "../../../utils/formatDate";

type InspeccionRowProps = {
    inspeccion: InspeccionListItem
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    EN_PROGRESO:      { label: 'En progreso',      dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700' },
    FOTOS_PENDIENTES: { label: 'Fotos pendientes',  dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700' },
    COMPLETA:         { label: 'Completa',           dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700' },
};

export default function InspeccionRow({inspeccion} : InspeccionRowProps) {
    
    const statusInfo = statusConfig[inspeccion.status] ?? statusConfig.EN_PROGRESO;
    const esRemolque = inspeccion.tipo === 'REMOLQUE';
    const identificador = esRemolque ? inspeccion.caja?.numero_caja ?? '-' : inspeccion.unidad?.no_unidad ?? '-';
    const subtitulo = esRemolque ? inspeccion.caja?.c_placas ?? '-' : inspeccion.unidad?.u_placas ?? '-';

    return (
        <Link
            to={`/inspecciones/${inspeccion.id}`}
            className=" flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors no-underline group"
        >
            <div className=" flex items-center gap-4">
                <div className=" w-9 h-9 bg-[#e8edf5] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d={esRemolque
                                ? "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                                : "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            }
                        />
                    </svg>
                </div>
                <div>
                    <p className=" text-sm font-medium text-gray-900 group-hover:text-[#0f1f3d]">{esRemolque ? 'Remolque' : 'Unidad'} {identificador}</p>
                    <p className=" text-xs text-gray-400 mt-0.5">{subtitulo} · {inspeccion.usuario?.name} {inspeccion.usuario?.lastname}  · {formatDate(inspeccion.createdAt)}</p>
                </div>
            </div>
            <div className=" flex items-center gap-3">
                <span className=" text-xs text-gray-400">{inspeccion.imagenes.length} fotos</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    )
}
