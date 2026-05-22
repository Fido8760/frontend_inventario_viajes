import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { finalizarChecklist, getChecklist, guardarRespuestas, RespuestaItem } from '../../../api/ChecklistAPI';
import { toast } from 'react-toastify';
import ChecklistForm from '../../../components/admin/ChecklistForm';

export default function ChecklistLlenarView() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const asignacionId = params.asignacionId ? +params.asignacionId : NaN;
  const checklistId = params.checklistId ? +params.checklistId : NaN;

  const [seccionActual, setSeccionActual] = useState(0);

  if(isNaN(asignacionId) || isNaN(checklistId)) {
    return <Navigate to={"/?page=1"} replace />;
  }

  const { data: checklist, isLoading, isError } = useQuery({
    queryKey: ['Checklist', asignacionId, checklistId],
    queryFn: () => getChecklist(asignacionId, checklistId),
    staleTime: 0
  });

  const { mutate: guardar, isPending: isGuardando } = useMutation({
    mutationFn: guardarRespuestas,
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checklist', asignacionId, checklistId] })
    }
  });

  const { mutate: finalizar, isPending: isFinalizando } =useMutation({
    mutationFn: finalizarChecklist,
    onError: (error) => toast.error(error.message),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });
      navigate(`/asignacion/${asignacionId}/createChecklist/${checklistId}/uploadImages`)
    }
  });

  const secciones = useMemo(() => {
    if(!checklist?.secciones) return [];
    return Object.entries(checklist.secciones).map(([nombre, preguntas]) => ({
      nombre,
      preguntas
    }));
  }, [checklist]);

  const totalSecciones = secciones.length;
  const esUltimaSeccion = seccionActual === totalSecciones - 1;
  const estaCompleto = checklist?.status === 'COMPLETO';

  const handleGuardarSeccion = (respuestas: RespuestaItem[], avanzar: boolean) => {
    guardar(
      {asignacionId, checklistId, respuestas },
      {
        onSuccess: () => {
          if(avanzar && !esUltimaSeccion) {
            setSeccionActual(s => s + 1)
          }
        }
      }
    );
  };

  const handlerFinalizar = (respuestaUltimaSeccion: RespuestaItem[]) => {
    guardar(
      { asignacionId, checklistId, respuestas: respuestaUltimaSeccion },
      {
        onSuccess: () => finalizar({ asignacionId, checklistId })
      }
    );
  };

  if(isLoading) return (
    <div className=' flex items-center justify-center py-32'>
      <p className=' text-gray-400 text-sm'>Cargando checklist</p>
    </div>
  )

  if (isError || !checklist) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-red-500 text-sm">Error al cargar el checklist.</p>
    </div>
  );

  return (
    <div className=' max-w-3xl mx-auto'>
      <div className=' mb-6'>
        <div className=' flex items-center justify-between'>
          <div>
            <h1 className=' text-2xl font-semibold text-gray-900'>Llenar Checklist</h1>
            <p className=' text-sm text-gray-500 mt-0.5'>Sección {seccionActual + 1 } de {totalSecciones}</p>
          </div>
          <span className={` text-xs font-medium px-3 py-1 rounded-full ${
            estaCompleto
              ? ' bg-green-100 text-green-800'
              : ' bg-yellow-100 text-yellow-800'
          }`}>
            {estaCompleto ? 'Completado' : 'En progreso'}
          </span>
        </div>
        <div className=' mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
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
          estaCompleto={estaCompleto}
          onAnterior={() => setSeccionActual(s => s - 1)}
          onSiguiente={(respuestas) => handleGuardarSeccion(respuestas, true)}
          onFinalizar={handlerFinalizar}
        />
      )}
    </div>
  )
}
