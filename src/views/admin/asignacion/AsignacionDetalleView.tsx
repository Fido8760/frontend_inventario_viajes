import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import { deleteRecorrido } from "../../../api/RecorridoAPI"; // 👈 Tu función de API
import { Rol } from "../../../types/roles";
import UnitIcon from "../../../components/ui/UnitIcon";
import StatusBadge from "../../../components/admin/asignacion/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import ModalNuevoRecorrido from "../../../components/admin/asignacion/ModalNuevoRecorrido";
import ModalCambioCaja from "../../../components/admin/asignacion/ModalCambioCaja";
import ModalDevolverAsignacion from "../../../components/admin/asignacion/ModalDevolverAsignacion";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import EstadisticasChecklistCard from "../../../components/admin/asignacion/EstadisticasChecklistCard";
import { RecorridoEnAsignacion } from "../../../types/recorrido";

function BadgeRecorrido({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        CREADA:              { label: 'Checklist iniciado',   className: 'bg-blue-50 text-blue-700' },
        CHECKLIST_PENDIENTE: { label: 'En preguntas',         className: 'bg-yellow-50 text-yellow-700' },
        FOTOS_PENDIENTES:    { label: 'Fotos pendientes',     className: 'bg-amber-50 text-amber-700' },
        EN_RUTA:             { label: 'En ruta',              className: 'bg-purple-50 text-purple-700' },
        COMPLETA:            { label: 'Completado',           className: 'bg-emerald-50 text-emerald-700' },
    };

    const item = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };

    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${item.className}`}>
            {item.label}
        </span>
    );
}

export default function AsignacionDetalleView() {
    const { data: authenticatedUser } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();

    const [isModalCajaOpen, setIsModalCajaOpen] = useState(false);
    const [isModalDevolverOpen, setIsModalDevolverOpen] = useState(false);
    const asignacionId = params.asignacionId ? parseInt(params.asignacionId, 10) : NaN; 
    const [isModalViajeOpen, setIsModalViajeOpen] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['Asignacion', asignacionId],
        queryFn: () => getAsignacionById(asignacionId),
        retry: false,
        enabled: !isNaN(asignacionId)
    });

    // ── Mutación para Eliminar Recorrido ──────────────────────────────
    const { mutate: eliminarViaje, isPending: isDeletingViaje } = useMutation({
        mutationFn: deleteRecorrido,
        onError: (error) => toast.error(error.message),
        onSuccess: (responseData) => {
            toast.success(responseData);
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });
            queryClient.invalidateQueries({ queryKey: ['kpisResumen'] });
        }
    });

    const handleDeleteRecorrido = async (recorridoId: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar este viaje?',
            text: 'Se eliminará el recorrido, el checklist y cualquier fotografía adjunta. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar viaje',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            eliminarViaje({ asignacionId, recorridoId });
        }
    };

    if (isNaN(asignacionId)) return <Navigate to="/404" replace />;

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando centro de control...</p>
        </div>
    );

    if (isError || !data) return (
        <div className="flex flex-col items-center justify-center py-32">
            <p className="text-red-500 text-sm mb-4">Error al cargar la asignación.</p>
            <Link to="/" className="text-xs text-gray-600 underline">Volver al inicio</Link>
        </div>
    );

    const { asignacion, kpis, alertaBaja, detalleBajas, recorridos, historialCajas } = data;
    const tieneViajeAbierto = kpis.recorridoActualId !== null;

    const canCreateViaje = authenticatedUser?.rol === Rol.CAPTURISTA || authenticatedUser?.rol === Rol.SISTEMAS;
    const esSistemas = authenticatedUser?.rol === Rol.SISTEMAS;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors no-underline"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Asignaciones
                </Link>
            </div>
            {alertaBaja && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </span>
                        <div>
                            <h4 className="text-sm font-semibold text-red-900">Atención: Componente dado de baja</h4>
                            <p className="text-xs text-red-700 mt-0.5">
                                {detalleBajas?.operadorInactivo && "El operador asignado está inactivo. "}
                                {detalleBajas?.unidadInactiva && "La unidad se encuentra dada de baja. "}
                                {detalleBajas?.cajaInactiva && "El remolque asignado está inactivo."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#e8edf5] rounded-2xl flex items-center justify-center shrink-0">
                            <UnitIcon tipo={asignacion.unidad.tipo_unidad} className="w-7 h-7 text-[#0f1f3d]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900">Unidad {asignacion.unidad.no_unidad}</h1>
                                <span className="text-xs text-gray-400 font-mono">({asignacion.unidad.u_placas})</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                {asignacion.unidad.tipo_unidad} · {asignacion.unidad.marca?.nombre ?? 'Sin marca'}
                            </p>
                        </div>
                    </div>
                    <StatusBadge asignacion={asignacion} />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                    <div>
                        <p className="text-xs text-gray-400">Operador asignado</p>
                        <p className="text-sm font-semibold text-gray-800 my-0.5">
                            {asignacion.operador
                                ? `${asignacion.operador.nombre} ${asignacion.operador.apellido_p} ${asignacion.operador.apellido_m}`
                                :'Sin asignar'
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">Remolque actual</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {asignacion.caja 
                                ? `Caja ${asignacion.caja.numero_caja} (${asignacion.caja.c_placas})` 
                                : 'Sin remolque'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">Fecha de entrega</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {formatDate(asignacion.fechaEntrega)}
                        </p>
                    </div>

                     <div>
                        <p className="text-xs text-gray-400">Registrado por</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                            {asignacion.usuario ? `${asignacion.usuario.name} ${asignacion.usuario.lastname}` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de Operación de la Asignación */}
            <div className="flex items-center gap-2">
                {asignacion.unidad.tipo_unidad === "TRACTOCAMION" && (
                    <button
                        type="button"
                        onClick={() => setIsModalCajaOpen(true)}
                        disabled={tieneViajeAbierto}
                        className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                        🔄 Cambiar Remolque
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setIsModalDevolverOpen(true)}
                    disabled={tieneViajeAbierto}
                    className="text-xs font-medium px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-all shadow-sm"
                >
                    🛑 Devolver Unidad
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Viajes Realizados</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalRecorridos}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        🛣️
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Días en Asignación</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.diasDesdeEntrega} días</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        📅
                    </div>
                </div>
                <div className="bg-[#0f1f3d] p-5 rounded-xl text-white flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-300 font-medium">Acción Operativa</p>
                        <p className="text-sm font-semibold mt-1">
                            {tieneViajeAbierto ? 'Viaje en progreso' : 'Lista para viaje'}
                        </p>
                    </div>
                    {canCreateViaje && (
                        <button
                            type="button"
                            onClick={() => setIsModalViajeOpen(true)}
                            disabled={tieneViajeAbierto}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                tieneViajeAbierto
                                    ? 'bg-white/20 text-gray-300 cursor-not-allowed'
                                    : 'bg-white text-[#0f1f3d] hover:bg-gray-100 active:scale-95'
                            }`}
                        >
                            {tieneViajeAbierto ? 'En curso' : '+ Iniciar Viaje'}
                        </button>
                    )}
                </div>
            </div>

            {asignacion.unidad.tipo_unidad === "TRACTOCAMION" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                                📦
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {asignacion.caja 
                                        ? `Remolque Actual: Caja ${asignacion.caja.numero_caja} (${asignacion.caja.c_placas})`
                                        : 'Sin remolque asignado actualmente'
                                    }
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {historialCajas.length > 0 
                                        ? `Se han registrado ${historialCajas.length} cambio(s) de remolque en esta asignación`
                                        : 'Esta unidad ha conservado su remolque original'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalCajaOpen(true)}
                            disabled={tieneViajeAbierto}
                            className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-all shadow-sm"
                        >
                            🔄 Cambiar Remolque
                        </button>
                    </div>

                    {historialCajas.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Historial de Movimientos de Remolque
                            </p>
                            <div className="space-y-2">
                                {historialCajas.map(h => (
                                    <div key={h.id} className="p-3 rounded-xl bg-gray-50 text-xs flex flex-wrap items-center justify-between gap-2 border border-gray-100">
                                        <div>
                                            <span className="font-semibold text-gray-800">
                                                {h.cajaAnterior ? `Caja ${h.cajaAnterior.numero_caja}` : 'Sin caja'}
                                            </span>
                                            <span className="text-gray-400 mx-2">➔</span>
                                            <span className="font-semibold text-blue-700">
                                                {h.cajaNueva ? `Caja ${h.cajaNueva.numero_caja}` : 'Desenganchada (Sin caja)'}
                                            </span>
                                            <span className="ml-2 text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                                                {h.motivo}
                                            </span>
                                           {h.observaciones && (
                                                <p className="text-gray-500 text-[11px] mt-1 italic">
                                                    "{h.observaciones}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-[11px] text-gray-400">
                                            <p>{formatDate(h.createdAt)}</p>
                                            {h.registradoPor && (
                                                <p className="text-[10px]">Por: {h.registradoPor.name} {h.registradoPor.lastname}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <EstadisticasChecklistCard asignacionId={asignacionId} />

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Historial de Recorridos</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Viajes y checklist asociados a esta asignación</p>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {recorridos.length} viajes
                    </span>
                </div>
                {recorridos.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-600">Aún no hay viajes registrados</p>
                        <p className="text-xs text-gray-400 mt-1">Presiona "Iniciar Viaje" para registrar la primera salida o entrega</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recorridos.map((r: RecorridoEnAsignacion, idx: number) => {
                            const numViaje = recorridos.length - idx;
                            const checklistId = r.checklist?.id;
                            // 🔒 Solo Sistemas y bloqueado en EN_RUTA / COMPLETA
                            const puedeEliminar = esSistemas && r.status !== 'EN_RUTA' && r.status !== 'COMPLETA';

                            return (
                                <div key={r.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                                            #{numViaje}
                                        </div>
                                       
                                        <div>
                                             <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {r.entregaInicial
                                                        ? (r.saleAViaje ? "Entrega Inicial + Salida" : "Entrega Inicial en Patio")
                                                        : (r.saleAViaje ? "Salida a Carretera" : "Movimiento en Patio")
                                                    }
                                                </h3>
                                                {r.entregaInicial && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                                        🔑 Entrega Inicial
                                                    </span>
                                                )}
                                                <BadgeRecorrido status={r.status} />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Iniciado el {formatDate(r.createdAt)} · Remolque: {r.caja_externa ? "Patio externo" : (r.cajaId ? `Caja ID ${r.cajaId}` : "Sin remolque")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── BOTONERA DE ACCIÓN POR VIAJE ── */}
                                    <div className="flex items-center gap-2">
                                        {/* 🗑️ Botón Eliminar Viaje (Exclusivo Sistemas) */}
                                        {puedeEliminar && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRecorrido(r.id)}
                                                disabled={isDeletingViaje}
                                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm"
                                                title="Eliminar este viaje cancelado"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        )}

                                        {/* Navegación según el estado del viaje */}
                                        {(() => {
                                            if (r.status === 'CHECKLIST_PENDIENTE' || r.status === 'CREADA') {
                                                return (
                                                    <Link
                                                        to={`/asignacion/${asignacionId}/recorridos/${r.id}/checklist/${checklistId}`}
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f1f3d] text-white hover:bg-[#1a3a6b] transition-all flex items-center gap-1.5 no-underline shadow-sm"
                                                    >
                                                        Continuar Checklist →
                                                    </Link>
                                                );
                                            }

                                            if (r.status === 'FOTOS_PENDIENTES') {
                                                return (
                                                    <Link
                                                        to={`/asignacion/${asignacionId}/recorridos/${r.id}/checklist/${checklistId}/uploadImages`}
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center gap-1.5 no-underline shadow-sm"
                                                    >
                                                        Subir Fotos →
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <Link
                                                    to={`/asignacion/${asignacionId}/recorridos/${r.id}`}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1.5 no-underline shadow-sm"
                                                >
                                                    {r.status === 'COMPLETA' ? 'Ver Inspección' : 'Ver Detalles'} →
                                                </Link>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ModalCambioCaja
                isOpen={isModalCajaOpen}
                onClose={() => setIsModalCajaOpen(false)}
                asignacionId={asignacion.id}
                cajaActualId={asignacion.caja?.id}
            />

            <ModalDevolverAsignacion
                isOpen={isModalDevolverOpen}
                onClose={() => setIsModalDevolverOpen(false)}
                asignacionId={asignacion.id}
                noUnidad={asignacion.unidad.no_unidad}
            />

            <ModalNuevoRecorrido
                isOpen={isModalViajeOpen}
                onClose={() => setIsModalViajeOpen(false)}
                asignacionId={asignacion.id}
                cajaActual={asignacion.caja}
                tipoUnidad={asignacion.unidad.tipo_unidad}
            />
        </div>
    );
}