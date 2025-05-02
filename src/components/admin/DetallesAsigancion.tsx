
import { AsignacionByIdApiResponse, PreguntaRespuesta } from '../../types';

type DetalleAsignacionProps = {
    data: AsignacionByIdApiResponse
}

const DetalleAsignacion = ({ data }: DetalleAsignacionProps) => {
    // Acceso seguro al último checklist y sus partes
    const ultimoChecklist = data.checklists?.[0];
    const respuestas = ultimoChecklist?.respuestas;
    const imagenes = ultimoChecklist?.imagenes;
    const tipoUnidadActual = data.unidad?.tipo_unidad; // Obtener tipo de unidad

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
            {/* Encabezado */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Detalle de Asignación</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Usar optional chaining y ?? para valores por defecto */}
                    <InfoItem label="Usuario de Creación" value={data.usuario?.name ?? 'N/A'} />
                    <InfoItem label="Unidad" value={`${data.unidad?.no_unidad ?? 'N/A'} - ${data.unidad?.tipo_unidad ?? 'N/A'}`} />
                    {/* Mejor manejo para caja null */}
                    <InfoItem label="Caja" value={data.caja ? `${data.caja.c_placas} - ${data.caja.c_marca}` : 'N/A'} />
                    <InfoItem label="Operador" value={`${data.operador?.nombre ?? ''} ${data.operador?.apellido_p ?? ''} ${data.operador?.apellido_m ?? ''}`.trim()} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <InfoItem label="Fecha Creación" value={data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'} />
                    <InfoItem label="Fecha Actualización" value={data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A'} />
                     <InfoItem label="Vigencia Licencia" value={data.operador?.vigencia_lic ?? 'N/A'} />
                     <InfoItem label="Vigencia Apto Médico" value={data.operador?.vigencia_apto ?? 'N/A'} />
                </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Checklist Realizado</h2>
                {/* Verificar que tengamos el objeto respuestas y el array secciones */}
                {respuestas?.secciones && Array.isArray(respuestas.secciones) && respuestas.secciones.length > 0 ? (
                    <div className="space-y-6">
                        {/* --- BUCLE EXTERNO: Iterar sobre SECCIONES --- */}
                        {respuestas.secciones.map((seccion, indexSeccion) => {
                            // Filtrar preguntas DENTRO de esta sección
                            const preguntasFiltradas = Array.isArray(seccion.preguntas)
                            ? seccion.preguntas.filter(p => {
                                // Obtener el tipo de unidad actual en minúsculas (y manejar si es undefined)
                                const tipoActualLower = tipoUnidadActual?.toLowerCase();

                                return (
                                    !p.aplicaA || // Mostrar si aplicaA no está definido
                                    p.aplicaA === 'todos' ||
                                    // --- COMPARACIÓN CORREGIDA ---
                                    p.aplicaA === tipoActualLower
                                );
                            })
                            : [];

                            // Si no hay preguntas VISIBLES para esta sección, no la renderizamos
                            if (preguntasFiltradas.length === 0) {
                                return null;
                            }

                            return (
                                <div key={`${seccion.nombre}-${indexSeccion}`}>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">{seccion.nombre}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* --- BUCLE INTERNO: Iterar sobre PREGUNTAS FILTRADAS --- */}
                                        {preguntasFiltradas.map((pregunta) => ( // Ahora 'pregunta' SÍ es una PreguntaRespuesta
                                            <div key={pregunta.idPregunta} className="border rounded p-3 shadow-sm bg-gray-50">
                                                <p className="text-sm text-gray-600 mb-1">{pregunta.pregunta}</p>
                                                {/* LLAMADAS CORRECTAS: Pasando el objeto pregunta */}
                                                <p className={`font-medium text-sm px-2 py-1 inline-block rounded ${getAnswerColor(pregunta)}`}>
                                                    {renderAnswer(pregunta)}
                                                </p>
                                                {/* LÓGICA CORRECTA: Verificando el tipo y respuesta de la pregunta */}
                                                {pregunta.tipo === 'texto' && pregunta.respuesta && (
                                                    <p className="mt-2 text-xs text-gray-500 bg-white p-2 border rounded">Comentario: "{pregunta.respuesta}"</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No hay datos de checklist disponibles para mostrar.</p>
                )}
            </div>

            {/* Imágenes */}
            {/* Verificar que tengamos el array imagenes */}
            {imagenes && Array.isArray(imagenes) && imagenes.length > 0 ? (
                 <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-semibold mb-4 border-b pb-2">Imágenes Adjuntas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Mapeo correcto sobre el array imagenes */}
                        {imagenes.map((imagen) => ( // Ahora 'imagen' es un objeto ImagenChecklist
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
                 <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                     <h2 className="text-xl font-semibold mb-4 border-b pb-2">Imágenes Adjuntas</h2>
                     <p className="text-center text-gray-500 py-4">No hay imágenes adjuntas.</p>
                 </div>
            )}
        </div>
    );
};

// Componente auxiliar para mostrar información

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

// Función para mostrar respuestas
const renderAnswer = (pregunta: PreguntaRespuesta) => {
    switch (pregunta.tipo) {
        case 'si_no':
            return pregunta.respuesta === 'si' ? '✅ Sí' : '❌ No';
        case 'opciones':
            return typeof pregunta.respuesta === 'string' 
            ? pregunta.respuesta.charAt(0).toUpperCase() + pregunta.respuesta.slice(1)
            : '';
        case 'numero':
            return `${pregunta.respuesta} kilómetros `;
        case 'texto':
            return pregunta.respuesta || 'Sin respuesta';
        default:
            const _exhaustiveCheck: never = pregunta.tipo;
            return _exhaustiveCheck;
    }
  };

// Función para colores según respuesta
const getAnswerColor = (pregunta: PreguntaRespuesta) => {
    if (pregunta.tipo === 'opciones' && typeof pregunta.respuesta === 'string') {
        const lowerCaseAnswer = pregunta.respuesta.toLowerCase();
        return {
            bueno: 'bg-green-100 text-green-800',
            regular: 'bg-yellow-100 text-yellow-800',
            malo: 'bg-red-100 text-red-800'
        }[lowerCaseAnswer] || 'bg-gray-100';
    } else if (pregunta.tipo === 'si_no') {
        return String(pregunta.respuesta).toLowerCase() === 'si' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

export default DetalleAsignacion;
