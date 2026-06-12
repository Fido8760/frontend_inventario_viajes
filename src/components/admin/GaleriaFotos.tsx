import { Link } from "react-router-dom";

const FIELD_LABELS: Record<string, string> = {
    frontal:           'Foto Frontal',
    lateral_derecho:   'Lateral Derecha',
    lateral_izquierdo: 'Lateral Izquierda',
    trasera:           'Foto Trasera',
    interior_cabina:   'Interior Cabina',
    documentacion:     'Documentación',
    odometro:          'Odómetro',
    firma:             'Firma del Operador',
    motor:             'Motor',
};

const getLabel = (fieldId?: string) => {
    if (!fieldId) return 'Sin etiqueta';
    return FIELD_LABELS[fieldId] ?? fieldId.replace(/_/g, ' ');
};

type Imagen = {
    id: number;
    urlImagen: string;
    fieldId: string;
}

type GaleriaFotosProps = {
    imagenes: Imagen[];
    titulo?: string;
    subtitulo?: string;
    backTo: string;
    backLabel?: string;
}

export default function GaleriaFotos({ imagenes, titulo = 'Evidencia fotográfica', subtitulo, backTo, backLabel = 'Volver al detalle'}: GaleriaFotosProps) {
    return (
        <div>
            <div>
                <Link
                    to={backTo}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {backLabel}
                </Link>
                <h1 className=" text-xl font-semibold text-gray-900">{titulo}</h1>
                {subtitulo && <p className=" text-sm text-gray-400 mt-0.5">{subtitulo}</p>}
            </div>

            {imagenes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagenes.map(img => (
                        <a
                            key={img.id} 
                            href={img.urlImagen}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 no-underline block"
                        >
                            <div className="relative h-48 overflow-hidden bg-gray-50">
                                <img
                                    src={img.urlImagen}
                                    alt={getLabel(img.fieldId)}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className=" absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/70 rounded-full p-2">
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="px-3 py-2.5">
                                <p className=" text-xs font-medium text-gray-700 truncate">{getLabel(img.fieldId)}</p>
                                {img.fieldId.startsWith('opcional') && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">Foto adicional</p>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className=" flex flex-col items-center justify-center py-24 text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No hay imágenes registradas</p>
                </div>
            )}
        </div>
    )
}
