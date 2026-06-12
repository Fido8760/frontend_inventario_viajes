// src/components/admin/DetallesInspeccion.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InspeccionById, RespuestaInspeccion } from '../../../types';
import { formatDate } from '../../../utils/formatDate';
import { toast } from 'react-toastify';
import { exportInspeccionToPdf } from '../../../utils/exportInspeccionPDF';


type DetallesInspeccionProps = {
    data: InspeccionById;
    inspeccionId: number;
    onDelete?: () => void;
    isDeleting?: boolean;
}

const renderValor = (item: RespuestaInspeccion) => {
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

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    EN_PROGRESO:      { label: 'En progreso',     dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700' },
    FOTOS_PENDIENTES: { label: 'Fotos pendientes', dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700' },
    COMPLETA:         { label: 'Completa',          dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700' },
};

export default function DetallesInspeccion({ data, inspeccionId, onDelete, isDeleting }: DetallesInspeccionProps) {
    const respuestas = data.respuestas ?? [];
    const imagenes = data.imagenes ?? [];
    const statusInfo = statusConfig[data.status] ?? statusConfig.EN_PROGRESO;
    const esRemolque = data.tipo === 'REMOLQUE';

    const secciones = useMemo(() => {
        const map = new Map<string, RespuestaInspeccion[]>();
        const ordenadas = [...respuestas].sort((a, b) => (a.pregunta?.orden ?? 0) - (b.pregunta?.orden ?? 0));
        for (const r of ordenadas) {
            const seccion = r.pregunta?.seccion ?? 'General';
            if (!map.has(seccion)) map.set(seccion, []);
            map.get(seccion)!.push(r);
        }
        return Array.from(map.entries());
    }, [respuestas]);

    const handleExportPdf = async () => {
        try {
            toast.info('Generando PDF...', { autoClose: 2000 });
            await exportInspeccionToPdf(data, {
                fileName: `Inspeccion_${data.tipo}_${data.caja?.numero_caja ?? data.unidad?.no_unidad}.pdf`,
                includeImages: true,
                includeLogo: true
            });
            toast.success('PDF generado correctamente');
        } catch (error) {
            toast.error('Error al generar el PDF')
        }
    }

    return (
        <div className="space-y-5">

            {/* Info general */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Información de la inspección</h2>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.label}
                    </span>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCell label="Tipo" value={esRemolque ? 'Remolque' : 'Unidad'} />
                    {esRemolque ? (
                        <>
                            <InfoCell label="Caja" value={data.caja?.numero_caja} />
                            <InfoCell label="Placas" value={data.caja?.c_placas} />
                            <InfoCell label="Marca" value={data.caja?.c_marca} />
                        </>
                    ) : (
                        <>
                            <InfoCell label="Unidad" value={`${data.unidad?.no_unidad} · ${data.unidad?.tipo_unidad}`} />
                            <InfoCell label="Placas" value={data.unidad?.u_placas} />
                            <InfoCell label="Tipo" value={data.unidad?.tipo_unidad} />
                        </>
                    )}
                    <InfoCell label="Registrado por" value={data.usuario ? `${data.usuario.name} ${data.usuario.lastname}` : '—'} />
                    <InfoCell label="Fecha creación" value={formatDate(data.createdAt)} />
                    <InfoCell label="Última actualización" value={formatDate(data.updatedAt)} />
                    <InfoCell label="Respuestas" value={`${respuestas.length} registradas`} />
                </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
                <Link
                    to="/inspecciones"
                    className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors no-underline"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                </Link>

                {data.status === 'EN_PROGRESO' && (
                    <Link
                        to={`/inspecciones/${inspeccionId}/checklist`}
                        className="flex items-center gap-1.5 text-sm text-white bg-[#0f1f3d] rounded-lg px-3 py-2 hover:bg-[#1a3a6b] transition-colors no-underline"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {respuestas.length > 0 ? 'Continuar checklist' : 'Iniciar checklist'}
                    </Link>
                )}

                {data.status === 'FOTOS_PENDIENTES' && (
                    <Link
                        to={`/inspecciones/${inspeccionId}/fotos`}
                        className="flex items-center gap-1.5 text-sm text-white bg-amber-500 rounded-lg px-3 py-2 hover:bg-amber-600 transition-colors no-underline"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Subir fotos
                    </Link>
                )}
                {respuestas.length > 0 && (
                    <button
                        onClick={handleExportPdf}
                        className='flex items-center gap-1.5 text-sm text-white bg-blue-600 rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar PDF
                    </button>
                )}

                {data.status === 'COMPLETA' && (
                    <Link
                        to={`/inspecciones/${inspeccionId}/galeria`}
                        className="flex items-center gap-1.5 text-white bg-[#0f1f3d] rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors no-underline text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver fotos
                    </Link>
                )}

                {onDelete && (
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {isDeleting ? 'Eliminando...' : 'Eliminar inspección'}
                    </button>
                )}
            </div>

            {/* Respuestas */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Checklist</h2>
                    <span className="text-xs text-gray-400">{respuestas.length} respuestas</span>
                </div>
                {secciones.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="text-sm text-gray-400">Aún no se han registrado respuestas.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {secciones.map(([nombre, items]) => (
                            <div key={nombre} className="px-5 py-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    {nombre}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {items.map(item => {
                                        const { text, color } = renderValor(item);
                                        const esTexto = item.pregunta?.tipo === 'texto';
                                        return (
                                            <div
                                                key={item.id}
                                                className={`rounded-lg p-3 border border-gray-100 ${esTexto ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                                            >
                                                <p className="text-xs text-gray-500 mb-1.5">{item.pregunta?.texto}</p>
                                                {esTexto ? (
                                                    <p className="text-sm text-gray-700">{text}</p>
                                                ) : (
                                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md ${color}`}>
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

            {/* Fotografías */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Fotografías</h2>
                    <span className="text-xs text-gray-400">{imagenes.length} imágenes</span>
                </div>
                {imagenes.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="text-sm text-gray-400">No hay fotografías adjuntas aún.</p>
                    </div>
                ) : (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {imagenes.map( img => (
                            <a
                                key={img.id} 
                                href={img.urlImagen}
                                target='_blank'
                                rel='noopener noreferer'
                                className=' aspect-square overflow-hidden rounded-lg border border-gray-100 hover:border-gray-300 transition-colors block'
                            >
                                <img 
                                    src={img.urlImagen} 
                                    alt={img.fieldId}
                                    className=' w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                                    loading='lazy' 
                                />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCell({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
        </div>
    );
}