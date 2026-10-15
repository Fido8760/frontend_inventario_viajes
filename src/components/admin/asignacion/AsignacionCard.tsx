import { Link } from "react-router-dom";
import { AsignacionItem } from "../../../types/asignacion"
import { formatDate } from "../../../utils/formatDate";
import UnitIcon from "../../ui/UnitIcon";
import StatusBadge from "./StatusBadge";

type AsignacionCardProps = {
    asignacion: AsignacionItem;
    canDelete: boolean;
    onDelete: (id: number) => void;
    canEdit?: boolean;
}

export default function AsignacionCard({ asignacion, canDelete, onDelete, canEdit }: AsignacionCardProps) {
    return (
        <div className={`bg-white rounded-xl border overflow-hidden transition-all ${
            asignacion.alertaBaja ? 'border-red-200 ring-1 ring-red-100' : ' border-gray-100 hover:border-gray-200'
        }`}>
            {asignacion.alertaBaja && (
                <div className="bg-red-50 px-4 py-1.5 border-b border-red-100 flex items-center justify-between text-xs text-red-700">
                    <span className="flex items-center gap-1.5 font-medium">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Requiere atención:
                    </span>
                    <span className="text-[11px] font-medium">
                        {asignacion.detalleBajas?.operadorInactivo && 'Operador inactivo'}
                        {asignacion.detalleBajas?.unidadInactiva && 'Unidad dada de baja'}
                        {asignacion.detalleBajas?.cajaInactiva && 'Remolque inactivo'}
                    </span>
                </div>
            )}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <UnitIcon tipo={asignacion.unidad.tipo_unidad} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">Unidad {asignacion.unidad.no_unidad}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {asignacion.unidad.u_placas} - {asignacion.unidad.tipo_unidad}
                        </p>
                    </div>
                </div>
                <StatusBadge asignacion={asignacion} />
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-400">Operador</p>
                        <p className={`text-sm font-medium ${
                            asignacion.operador && !asignacion.operador.activo ? ' text-red-600 line-through' : 'text-gray-800'
                        }`}>
                            {asignacion.operador ? 
                                `${asignacion.operador.nombre} ${asignacion.operador.apellido_p} ${asignacion.operador.apellido_m}`
                                : 'No asignado'}
                        </p>
                    </div>
                </div>

                {asignacion.caja && (
                    <div className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                        <div>
                            <p className="text-xs text-gray-400">Remolque</p>
                            <p className="text-sm font-medium text-gray-800">
                                {asignacion.caja.numero_caja ? `Caja ${asignacion.caja.numero_caja} - ` : ''}
                                {asignacion.caja.c_placas}
                            </p>
                        </div>
                    </div>
                )}
                <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-400">Registrado por:</p>
                        <p className="text-sm font-medium text-gray-800">
                            {asignacion.usuario ? `${asignacion.usuario.name} ${asignacion.usuario.lastname}` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(asignacion.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                    <Link
                        to={`/asignacion/${asignacion.id}`}
                        className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-100 font-medium transition-colors no-underline"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver viajes
                    </Link>
                    {canEdit && (
                        <Link
                            to={`/asignacion/${asignacion.id}/edit`}
                            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors no-underline"
                        >
                            Editar
                        </Link>
                    )}

                    {canDelete && (
                        <button
                            onClick={() => onDelete(asignacion.id)}
                            className="flex items-center gap-1 text-xs text-red-500 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
