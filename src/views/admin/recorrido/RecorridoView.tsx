import { Link, Navigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { RespuestaItem } from "../../../types/recorrido";
import { getRecorridoById } from "../../../api/RecorridoAPI";
import { deleteChecklist } from "../../../api/ChecklistAPI";
import { useMemo, useState } from "react";
import { exportChecklistToPdf } from "../../../utils/exportPDF";
import { Rol } from "../../../types/roles";
import { formatDate } from "../../../utils/formatDate";
import ImageLightboxModal from "../../../components/ui/ImageLightboxModal";

const renderValor = (item: RespuestaItem) => {
    const val = item.valor;
    const tipo = item.pregunta?.tipo;

    if (val === null || val === '' || val === undefined) {
        return { text: 'Sin respuesta', color: 'bg-gray-100 text-gray-400' };
    }
    if (tipo === 'si_no') {
        return val === 'si'
            ? { text: '✓ Sí', color: 'bg-emerald-50 text-emerald-700' }
            : { text: '✗ No', color: 'bg-red-50 text-red-700' };
    }
    if (tipo === 'opciones') {
        const map: Record<string, { text: string; color: string }> = {
            BUENO:   { text: 'Bueno',   color: 'bg-emerald-50 text-emerald-700' },
            REGULAR: { text: 'Regular', color: 'bg-amber-50 text-amber-700' },
            MALO:    { text: 'Malo',    color: 'bg-red-50 text-red-700' },
        };
        return map[val] ?? { text: val, color: 'bg-gray-100 text-gray-600' };
    }
    if (tipo === 'numero') {
        return { text: `${val} km`, color: 'bg-blue-50 text-blue-700' };
    }
    return { text: val, color: 'bg-gray-50 text-gray-600' };
};

const statusConfig: Record<string, { label: string; badge: string }> = {
    CREADA:              { label: 'Checklist iniciado',   badge: 'bg-blue-50 text-blue-700' },
    CHECKLIST_PENDIENTE: { label: 'Checklist pendiente',  badge: 'bg-yellow-50 text-yellow-700' },
    FOTOS_PENDIENTES:    { label: 'Fotos pendientes',     badge: 'bg-amber-50 text-amber-700' },
    EN_RUTA:             { label: 'En ruta',              badge: 'bg-purple-50 text-purple-700' },
    COMPLETA:            { label: 'Completado',           badge: 'bg-emerald-50 text-emerald-700' },
};

function InfoCell({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
        </div>
    );
}

export default function RecorridoView() {
    const { data: authenticatedUser } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();

    const asignacionId = params.asignacionId ? parseInt(params.asignacionId) : NaN;
    const recorridoId = params.recorridoId ? parseInt(params.recorridoId) : NaN;

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['Recorrido', asignacionId, recorridoId],
        queryFn: () => getRecorridoById(asignacionId, recorridoId),
        retry: false,
        enabled: !isNaN(asignacionId) && !isNaN(recorridoId)
    });

    const { mutate: eliminarChecklist, isPending: isDeleting } = useMutation({
        mutationFn: deleteChecklist,
        onError: (error) => toast.error(error.message),
        onSuccess: (responseData) => {
            toast.success(responseData);
            queryClient.invalidateQueries({ queryKey: ['Recorrido', asignacionId, recorridoId] });
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId], });
        }
    });

    const secciones = useMemo(() => {
        const respuestas = data?.checklist?.respuestas ?? [];
        const map = new Map<string, RespuestaItem[]>();
        const ordenadas = [...respuestas].sort((a, b) => (a.pregunta?.orden ?? 0) - (b.pregunta?.orden ?? 0));

        for (const r of ordenadas) {
            const seccion = r.pregunta?.seccion ?? 'General';
            if (!map.has(seccion)) map.set(seccion,[]);
            map.get(seccion)!.push(r);
        }
        return Array.from(map.entries());
    }, [data?.checklist.respuestas]);

    const handleExportPdf = async () => {
        if (!data) return;
        try {
            toast.info('Generando PDF...', { autoClose: 2000 });
            await exportChecklistToPdf(data as any, {
                fileName: `Checklist_Viaje_${data.id}_Unidad_${data.asignacion.unidad.no_unidad}.pdf`,
                includeImages: true,
                includeLogo: true
            });
            toast.success('PDF generado correctamente');
        } catch {
            toast.error('Error al generar el PDF');
        }
    };

     const handleDelete = async () => {
        const checklistId = data?.checklist?.id;
        if (!checklistId) return;

        const result = await Swal.fire({
            title: '¿Eliminar este checklist?',
            text: "Esta acción devolverá el viaje a estado CREADA y borrará las fotos en Cloudinary.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            eliminarChecklist({ asignacionId, recorridoId, checklistId });
        }
    };

     if (isNaN(asignacionId) || isNaN(recorridoId)) return <Navigate to="/404" replace />;

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando inspección del viaje...</p>
        </div>
    );

    if (isError || !data) return (
        <div className="flex flex-col items-center justify-center py-32">
            <p className="text-red-500 text-sm mb-3">Error al cargar el recorrido.</p>
            <Link to={`/asignacion/${asignacionId}`} className="text-xs text-gray-500 underline">
                Volver a la asignación
            </Link>
        </div>
    );

    const esSistemas = authenticatedUser?.rol === Rol.SISTEMAS;
    const { asignacion, checklist } = data;
    const statusInfo = statusConfig[data.status] ?? statusConfig.CREADA;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <Link
                    to={`/asignacion/${asignacionId}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors no-underline"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a la asignación
                </Link>

                <div className="flex items-center gap-2">
                    {checklist && checklist.imagenes.length > 0 && (
                        <Link
                            to={`/asignacion/${asignacionId}/recorridos/${recorridoId}/ver-fotos`}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 p-2 hover:bg-gray-50 transition-colors shadow-sm no-underline"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ver Fotografías ({checklist.imagenes.length})
                        </Link>
                    )}
                    {checklist.respuestas.length > 0 && (
                        <button
                            onClick={handleExportPdf}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar PDF
                        </button>
                    )}

                    {esSistemas && checklist && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 text-xs  text-red-600 border border-e-red-200 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-40 transition-colors"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar checklist'}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-bold text-gray-900">Inspección · Viaje #{data.id}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{data.saleAViaje ? "Salida a Carretera" : "Entrega Fisíca en Patio"}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.badge}`}>
                        {statusInfo.label}
                    </span>
                </div>

                <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCell label="Unidad" value={`Unidad ${asignacion.unidad.no_unidad} · ${asignacion.unidad.tipo_unidad}`} />
                    <InfoCell label="Placas" value={asignacion.unidad.u_placas} />
                    <InfoCell label="Operador" value={`${asignacion.operador.nombre} ${asignacion.operador.apellido_p}`} />
                    <InfoCell label="Remolque del viaje" value={data.caja_externa ? "Patio externo" : (asignacion.caja ? `Caja ${asignacion.caja.numero_caja}` : "Sin remolque")} />
                    <InfoCell label="Fecha del viaje" value={formatDate(data.createdAt)} />
                    <InfoCell label="Estado de Inspección" value={checklist?.status === 'COMPLETO' ? '✓ Preguntas completas' : 'En progreso'} />
                </div>
            </div>

            {checklist && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Resultados de la inspección</h2>
                        <span className="text-xs text-gray-400">{checklist.respuestas.length} respuesas</span>
                    </div>
                    {secciones.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">
                            Este checklist aún no tiene respuestas guardadas
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {secciones.map(([nombre, items]) => (
                                <div className="px-6 py-5">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{nombre}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {items.map(item => {
                                            const { text, color } = renderValor(item);
                                            const esTexto = item.pregunta?.tipo === 'texto';
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`rounded-xl p-3 border border-gray-100 bg-white ${
                                                        esTexto ? 'sm:col-span-2 lg:col-span-3' : ''
                                                    }`}
                                                >
                                                    <p className="text-xs text-gray-500 mb-1">{item.pregunta?.texto}</p>
                                                    {esTexto ? (
                                                        <p className="text-sm text-gray-800 font-medium">{text}</p>
                                                    ) : (
                                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${color}`}>
                                                            {text}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {checklist && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Fotografías de Evidencia</h2>
                        <span className="text-xs text-gray-400">{checklist.imagenes.length} imágenes</span>
                    </div>

                    {checklist.imagenes.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">
                            No hay fotografías adjuntas a este viaje aún.
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {checklist.imagenes.map((img, idx) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedImageIndex(idx);
                                        setIsLightboxOpen(true);
                                    }}
                                    className="aspect-square overflow-hidden rounded-xl border border-gray-100 hover:border-gray-300 transition-colors block shadow-sm relative group cursor-pointer"
                                >
                                    <img
                                        src={img.urlImagen}
                                        alt={`Foto ${img.fieldId}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs bg-black/60 px-2 py-1 rounded-md">Ver grande</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {checklist && (
                <ImageLightboxModal
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    images={checklist.imagenes}
                    initialIndex={selectedImageIndex}
                />
            )}
        </div>
    )
}
