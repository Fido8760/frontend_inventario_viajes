import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { finalizarChecklist, getChecklist, guardarRespuestas } from '../../../api/ChecklistAPI';
import { toast } from 'react-toastify';
import ChecklistForm from '../../../components/admin/ChecklistForm';
import { ChecklistDetalle } from '../../../types';
import { RespuestaFlow, SeccionFlow, useChecklistFlow } from '../../../hooks/useChecklistFlow';

const normalizarChecklistAsignacion = ( data: ChecklistDetalle): SeccionFlow[] => {
  if(!data.secciones) return [];
  return Object.entries(data.secciones).map(([nombre, preguntas]) => ({
    nombre,
    preguntas: preguntas.map(p => ({
      preguntaId: p.preguntaId,
      texto: p.texto,
      tipo: p.tipo,
      obligatorio: p.obligatorio,
      aplica_a: p.aplica_a,
      valor: p.valor ?? null,
    }))
  }));
};

export default function ChecklistLlenarView() {
  const params = useParams();
  const navigate = useNavigate();

  const asignacionId = params.asignacionId ? +params.asignacionId : NaN;
  const checklistId = params.checklistId ? +params.checklistId : NaN;


  if(isNaN(asignacionId) || isNaN(checklistId)) {
    return <Navigate to={"/?page=1"} replace />;
  }

  const { data, isLoading, isError, secciones, seccionActual, setSeccionActual, totalSecciones, isGuardando, isFinalizando, checklistCompleto, handleGuardarSeccion, handleFinalizar } = useChecklistFlow({
    queryKey: ['Checklist', asignacionId, checklistId],
    queryFn: () => getChecklist(asignacionId, checklistId),
    normalizeSecciones: normalizarChecklistAsignacion,
    guardarFn: (respuestas: RespuestaFlow[]) => guardarRespuestas({ 
    asignacionId, 
    checklistId, 
    respuestas: respuestas.map(r => ({ 
        preguntaId: r.preguntaId, 
        valor: r.valor ?? '' 
    }))
}),
    finalizarFn: () => finalizarChecklist({ asignacionId, checklistId }),
    onFinalizarSuccess: (data) => {
      toast.success(data.message);
      navigate(`/asignacion/${asignacionId}/createChecklist/${checklistId}/uploadImages`)
    },
    estaCompleto: (data: ChecklistDetalle) => data.status === 'COMPLETO',
  });

  if(isLoading) return (
    <div className=' flex items-center justify-center py-32'>
      <p className=' text-gray-400 text-sm'>Cargando checklist</p>
    </div>
  )

  if (isError || !data) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-red-500 text-sm">Error al cargar el checklist.</p>
    </div>
  );

  return (
    <div className=' max-w-3xl mx-auto'>
      <div className='mb-6'>
        <div className=' flex items-center justify-between'>
          <div>
            <h1 className=' text-2xl font-semibold text-gray-900'>Llenar Checklist</h1>
            <p className=' text-sm text-gray-500 mt-0.5'>Sección {seccionActual} de {totalSecciones}</p>
          </div>
          <span className={` text-xs font-medium px-3 py-1 rounded-full ${
            checklistCompleto ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {checklistCompleto ? 'Completado' : 'En Progreso'}
          </span>
        </div>
        <div className='mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
          <div 
            className='h-full bg-[#0f1f3d] rounded-full transition-all duration-300'
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
  )
}
