import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getTemplateInspeccion, guardarRespuestasInspeccion, finalizarChecklistInspeccion } from '../../../api/InspeccionAPI';
import { useChecklistFlow, SeccionFlow } from '../../../hooks/useChecklistFlow';
import ChecklistForm from '../../../components/admin/ChecklistForm';
import { TemplateInspeccion } from '../../../types';

const normalizarTemplateInspeccion = (data: TemplateInspeccion): SeccionFlow[] => {
    if (!data.secciones) return [];
    return Object.entries(data.secciones).map(([nombre, preguntas]) => ({
        nombre,
        preguntas: preguntas.map(p => ({
            preguntaId: p.id,
            texto: p.texto,
            tipo: p.tipo,
            obligatorio: p.obligatorio,
            aplica_a: p.aplica_a as 'todos' | 'tractocamion',
            valor: null,
        }))
    }));
};

export default function InspeccionChecklistView() {
    const params = useParams();
    const navigate = useNavigate();

    const inspeccionId = params.inspeccionId ? +params.inspeccionId : NaN;

    if (isNaN(inspeccionId)) return <Navigate to="/inspecciones" replace />;

    const {
        data, isLoading, isError,
        secciones, seccionActual, setSeccionActual,
        totalSecciones, isGuardando, isFinalizando,
        checklistCompleto, handleGuardarSeccion, handleFinalizar
    } = useChecklistFlow({
        queryKey: ['InspeccionChecklist', inspeccionId],
        queryFn: () => getTemplateInspeccion(inspeccionId),
        normalizeSecciones: normalizarTemplateInspeccion,
        guardarFn: (respuestas) => guardarRespuestasInspeccion(inspeccionId, respuestas),
        finalizarFn: () => finalizarChecklistInspeccion(inspeccionId),
        onFinalizarSuccess: (data) => {
            toast.success(data.message);
            navigate(`/inspecciones/${inspeccionId}/fotos`);
        },
        estaCompleto: () => false, // inspecciones no tienen status en el template
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando checklist</p>
        </div>
    );

    if (isError || !data) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-red-500 text-sm">Error al cargar el checklist.</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Inspección de patio</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Sección {seccionActual + 1} de {totalSecciones}</p>
                    </div>
                </div>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#0f1f3d] rounded-full transition-all duration-300"
                        style={{ width: `${((seccionActual + 1) / totalSecciones) * 100}%` }}
                    />
                </div>
            </div>

            {secciones.length > 0 && (
                <ChecklistForm
                    seccion={secciones[seccionActual]}
                    seccionActual={seccionActual}
                    totalSecciones={totalSecciones}
                    isGuardando={isGuardando || isFinalizando}
                    estaCompleto={checklistCompleto}
                    onAnterior={() => setSeccionActual(s => s - 1)}
                    onSiguiente={(respuestas) => handleGuardarSeccion(respuestas, true)}
                    onFinalizar={handleFinalizar}
                />
            )}
        </div>
    );
}