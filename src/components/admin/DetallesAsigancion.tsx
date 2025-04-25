
import { AsignacionConChecklist, QuestionsTypes } from '../../types';

// Tipo para las respuestas individuales
type RespuestaChecklist = QuestionsTypes['preguntas'][number];

type DetalleAsignacionProps = {
    data: AsignacionConChecklist
}

const DetalleAsignacion = ({ data } : DetalleAsignacionProps) => {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Detalle de Asignación</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem label="Usuario de Creación" value={`${data.usuario.name}`} />
            <InfoItem label="Unidad" value={`${data.unidad.no_unidad} - ${data.unidad.tipo_unidad}`} />
            <InfoItem label="Caja" value={`${data.caja.c_placas} - ${data.caja.c_marca}`} />
            <InfoItem label="Operador" value={`${data.operador.nombre} ${data.operador.apellido_p} ${data.operador.apellido_m}`} />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
            <InfoItem label="Fecha Creación" value={new Date(data.createdAt).toLocaleDateString()} />
            <InfoItem label="Fecha Actualización" value={new Date(data.updatedAt).toLocaleDateString()} />
            </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {data.checklists.length ? (
                <>
                    <h2 className="text-xl font-semibold mb-4">Checklist</h2>
            
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.checklists[0].respuestas.preguntas.map((pregunta, index) => (
                        <div key={pregunta.idPregunta} className="border-b pb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pregunta {index + 1}</span>
                            <span className={`px-2 py-1 rounded ${getAnswerColor(pregunta)}`}>
                            {renderAnswer(pregunta)}
                            </span>
                        </div>
                        {pregunta.tipo === 'texto' && pregunta.respuesta && (
                            <p className="mt-1 text-sm text-gray-500">"{pregunta.respuesta}"</p>
                        )}
                        </div>
                    ))}
                    </div>
                    {/* Imágenes */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Imágenes Adjuntas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.checklists[0].imagenes.map((imagen) => (
                            <div key={imagen.id} className="aspect-square overflow-hidden rounded-lg">
                            <img
                                src={imagen.urlImagen}
                                alt={`Checklist ${imagen.checklistId}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                loading="lazy"
                            />
                            </div>
                        ))}
                        </div>
                    </div>
                </>
            ) : (
                <p>No hay checklist</p>
            )}
            
        </div>

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
const renderAnswer = (pregunta: RespuestaChecklist) => {
    switch (pregunta.tipo) {
        case 'si_no':
            return pregunta.respuesta === 'si' ? '✅ Sí' : '❌ No';
        case 'opciones':
            return typeof pregunta.respuesta === 'string' 
            ? pregunta.respuesta.charAt(0).toUpperCase() + pregunta.respuesta.slice(1)
            : '';
        case 'numero':
            return `#${pregunta.respuesta}`;
        case 'texto':
            return pregunta.respuesta || 'Sin respuesta';
        default:
            const _exhaustiveCheck: never = pregunta.tipo;
            return _exhaustiveCheck;
    }
  };

// Función para colores según respuesta
const getAnswerColor = (pregunta: RespuestaChecklist) => {
    if (pregunta.tipo === 'opciones' && typeof pregunta.respuesta === 'string') {
        return {
            bueno: 'bg-green-100 text-green-800',
            regular: 'bg-yellow-100 text-yellow-800',
            malo: 'bg-red-100 text-red-800'
        }[pregunta.respuesta] || 'bg-gray-100';
    }
    return 'bg-blue-100 text-blue-800';
  };

export default DetalleAsignacion;
