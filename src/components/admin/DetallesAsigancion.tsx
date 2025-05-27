import { useMemo } from 'react';
import { AsignacionByIdApiResponse, PreguntaRespuesta } from '../../types';
import plantillaCompleta from '../../views/admin/checklist/preguntas.json';
import { exportChecklistToPdf } from '../../utils/exportPDF';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

type DetalleAsignacionProps = {
    data: AsignacionByIdApiResponse;
};

// --- Componente Principal ---
const DetalleAsignacion = ({ data }: DetalleAsignacionProps) => {
    const ultimoChecklist = data.checklist;
    const respuestasGuardadas = ultimoChecklist?.respuestas; // El objeto { secciones: [...] } guardado en la BD
    const imagenes = ultimoChecklist?.imagenes;
    const tipoUnidadActual = data.unidad?.tipo_unidad; // El tipo de unidad actual de la asignación

    // 2. Crear un Map con las respuestas guardadas para búsqueda eficiente
    const respuestasMap = useMemo(() => {
        const map = new Map<number, PreguntaRespuesta>();
        if (respuestasGuardadas?.secciones && Array.isArray(respuestasGuardadas.secciones)) {
            for (const seccion of respuestasGuardadas.secciones) {
                if (seccion.preguntas && Array.isArray(seccion.preguntas)) {
                    for (const pregRespuesta of seccion.preguntas) {
                        if (typeof pregRespuesta.idPregunta === 'number') {
                            // Almacena el objeto completo de la respuesta guardada
                            map.set(pregRespuesta.idPregunta, pregRespuesta);
                        }
                    }
                }
            }
        }
        return map;
    }, [respuestasGuardadas]); // Se recalcula solo si cambian las respuestas guardadas

    const handleExportPdf = async () => {
            try {
                toast.info('Generando PDF...', { autoClose: 2000 });
                await exportChecklistToPdf(data, {
                    fileName: `Checklist_${data.unidad?.no_unidad}.pdf`,
                    includeImages: true,
                    includeLogo:true
                });
                toast.success('PDF generado con éxito', { autoClose: 3000 });
            } catch (error) {
                console.error('Error al generar PDF:', error);
                toast.error('Error al generar el PDF');
            }
        };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
            {/* Encabezado con detalles de la asignación */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Detalle de Asignación</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem label="Usuario de Creación" value={data.usuario?.name ?? 'N/A'} />
                    <InfoItem label="Unidad" value={`${data.unidad?.no_unidad ?? 'N/A'} - ${data.unidad?.tipo_unidad ?? 'N/A'}`} />
                    <InfoItem label="Caja" value={data.caja ? `${data.caja.c_placas} - ${data.caja.c_marca}` : 'N/A'} />
                    <InfoItem label="Operador" value={`${data.operador?.nombre ?? ''} ${data.operador?.apellido_p ?? ''} ${data.operador?.apellido_m ?? ''}`.trim() || 'N/A'} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <InfoItem label="Fecha Creación" value={data.createdAt ? formatDate(data.createdAt) : 'N/A'} />
                    <InfoItem label="Fecha Actualización" value={data.updatedAt ? formatDate(data.updatedAt) : 'N/A'} />
                    <InfoItem label="Vigencia Licencia" value={formatDate(data.operador?.vigencia_lic) ?? 'N/A'} />
                    <InfoItem label="Vigencia Apto Médico" value={formatDate(data.operador?.vigencia_apto) ?? 'N/A'} />
                </div>
            </div>

            {/* Sección del Checklist */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Checklist Realizado</h2>
                {/* 3. Renderizar basado en la PLANTILLA, no en las respuestas guardadas */}
                {plantillaCompleta?.preguntas && Array.isArray(plantillaCompleta.preguntas) ? (
                    <div className="space-y-6">
                        {/* Iterar sobre las SECCIONES de la PLANTILLA */}
                        {plantillaCompleta.preguntas.map((seccionPlantilla, indexSeccion) => {
                            // Filtrar las PREGUNTAS de la PLANTILLA que aplican al tipo de unidad ACTUAL
                            const preguntasRelevantesPlantilla = Array.isArray(seccionPlantilla.preguntas)
                                ? seccionPlantilla.preguntas.filter(pPlantilla => {
                                    const tipoActualLower = tipoUnidadActual?.toLowerCase();
                                    const aplicaALower = pPlantilla.aplicaA?.toLowerCase();
                                    // Lógica de filtro: mostrar si no tiene aplicaA, es 'todos', o coincide con el tipo actual
                                    return !aplicaALower || aplicaALower === 'todos' || aplicaALower === tipoActualLower;
                                })
                                : [];

                            // Si ninguna pregunta de esta sección de la plantilla es relevante, no mostrar la sección
                            if (preguntasRelevantesPlantilla.length === 0) {
                                return null;
                            }

                            // Renderizar la sección si tiene preguntas relevantes
                            return (
                                <div key={`${seccionPlantilla.nombre}-${indexSeccion}`}>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">{seccionPlantilla.nombre}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Iterar sobre las PREGUNTAS RELEVANTES de la PLANTILLA */}
                                        {preguntasRelevantesPlantilla.map((preguntaPlantilla) => {
                                            // Buscar la respuesta guardada para esta pregunta de la plantilla
                                            const respuestaGuardada = respuestasMap.get(preguntaPlantilla.idPregunta);

                                            // Crear el objeto a mostrar: combina datos de plantilla con respuesta guardada (o default)
                                            const displayPregunta: PreguntaRespuesta = {
                                                idPregunta: preguntaPlantilla.idPregunta,
                                                pregunta: preguntaPlantilla.pregunta,
                                                tipo: preguntaPlantilla.tipo as PreguntaRespuesta['tipo'], // Asegurar tipo
                                                aplicaA: preguntaPlantilla.aplicaA as ('todos' | 'tractocamion'), // Asegurar tipo
                                                // Usar la respuesta guardada si existe, sino un valor por defecto según el tipo
                                                respuesta: respuestaGuardada?.respuesta ?? (preguntaPlantilla.tipo === 'texto' ? '' : null)
                                            };

                                            // Renderizar el cuadro de la pregunta/respuesta
                                            return (
                                                <div key={displayPregunta.idPregunta} className="border rounded p-3 shadow-sm bg-gray-50">
                                                    <p className="text-sm text-gray-600 mb-1">{displayPregunta.pregunta}</p>
                                                    <p className={`font-medium text-sm px-2 py-1 inline-block rounded ${getAnswerColor(displayPregunta)}`}>
                                                        {renderAnswer(displayPregunta)}
                                                    </p>
                                                    {/* Mostrar comentario solo si es tipo texto y tiene respuesta */}
                                                    {displayPregunta.tipo === 'texto' && displayPregunta.respuesta && (
                                                        <p className="mt-2 text-xs text-gray-500 bg-white p-2 border rounded">Comentario: "{displayPregunta.respuesta}"</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Mensaje si no se pudo cargar la plantilla
                    <p className="text-center text-gray-500 py-4">Error al cargar la plantilla del checklist.</p>
                )}
                 {/* Mensaje si no hay checklist guardado */}
                 {!ultimoChecklist && plantillaCompleta?.preguntas && (
                    <p className="text-center text-gray-500 py-4">No se ha realizado el checklist para esta asignación.</p>
                 )}
            </div>

            {/* Sección de Imágenes (se muestra solo si hay un checklist con imágenes) */}
            {imagenes && Array.isArray(imagenes) && imagenes.length > 0 ? (
                 <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                     <h2 className="text-xl font-semibold mb-4 border-b pb-2">Imágenes Adjuntas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imagenes.map((imagen) => (
                            <div key={imagen.id} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border hover:shadow-lg transition-shadow">
                                <a href={imagen.urlImagen} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imagen.urlImagen}
                                        alt={`Checklist ${imagen.checklistId} - Imagen ${imagen.id}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 // Mostrar sección pero indicar que no hay imágenes SI hay un checklist realizado
                 ultimoChecklist && (
                     <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                         <h2 className="text-xl font-semibold mb-4 border-b pb-2">Imágenes Adjuntas</h2>
                         <p className="text-center text-gray-500 py-4">No hay imágenes adjuntas.</p>
                         <Link
                            // Esta ruta debe coincidir o ser compatible con la que usas después de crear el checklist
                            // data.id es el asignacionId
                            // ultimoChecklist.id es el checklistId
                            to={`/asignacion/${data.id}/createChecklist/${ultimoChecklist.id}/uploadImages`} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            Subir Imágenes
                        </Link>
                     </div>
                 )
            )}
            <div className='flex justify-center mt-6'>

                <button 
                    onClick={handleExportPdf}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Exportar a PDF
                </button>

            </div>

        </div>
        
    );
};

// --- Componentes y Funciones Helper (Sin cambios respecto a la versión anterior) ---

type InfoItemProps = {
    label: string;
    value: React.ReactNode;
}

const InfoItem = ({ label, value } : InfoItemProps) => (
  <div className="space-y-1">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <p className="text-gray-800">{value || 'N/A'}</p>
  </div>
);

const renderAnswer = (pregunta: PreguntaRespuesta) => {
    // Manejar explícitamente null para respuestas limpiadas
    if (pregunta.respuesta === null) {
        return 'N/A'; // O 'Sin respuesta', o ''
    }
    switch (pregunta.tipo) {
        case 'si_no':
            return pregunta.respuesta === 'si' ? '✅ Sí' : '❌ No';
        case 'opciones':
             // Asegurarse que es string antes de capitalizar
            return typeof pregunta.respuesta === 'string'
            ? pregunta.respuesta.charAt(0).toUpperCase() + pregunta.respuesta.slice(1).toLowerCase() // Asegurar formato
            : 'N/A';
        case 'numero':
            // Evitar mostrar 'null kilómetros'
            return pregunta.respuesta !== null ? `${pregunta.respuesta} kilómetros` : 'N/A';
        case 'texto':
             // Mostrar "Sin respuesta" si está vacío o null
            return pregunta.respuesta || 'Sin respuesta';
        default:
            // Ayuda a TypeScript a verificar que todos los casos están cubiertos
            const _exhaustiveCheck: never = pregunta.tipo;
            console.warn("Tipo de pregunta no manejado en renderAnswer:", _exhaustiveCheck);
            return 'N/A';
    }
};

const getAnswerColor = (pregunta: PreguntaRespuesta) => {
    // Manejar null primero
    if (pregunta.respuesta === null) {
         return 'bg-gray-100 text-gray-500'; // Color para N/A o limpiado
    }
    if (pregunta.tipo === 'opciones' && typeof pregunta.respuesta === 'string') {
        const lowerCaseAnswer = pregunta.respuesta.toLowerCase();
        return {
            bueno: 'bg-green-100 text-green-800',
            regular: 'bg-yellow-100 text-yellow-800',
            malo: 'bg-red-100 text-red-800'
        }[lowerCaseAnswer] || 'bg-gray-100'; // Fallback para opción desconocida
    } else if (pregunta.tipo === 'si_no') {
        return String(pregunta.respuesta).toLowerCase() === 'si' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else if (pregunta.tipo === 'texto' && !pregunta.respuesta) {
        return 'bg-gray-100 text-gray-500'; // Color para "Sin respuesta" en texto
    }
    // Color por defecto para números o texto con contenido
    return 'bg-blue-100 text-blue-800';
  };

export default DetalleAsignacion;