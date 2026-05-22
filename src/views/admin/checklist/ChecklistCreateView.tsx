import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { postChecklist } from '../../../api/ChecklistAPI';
import { toast } from 'react-toastify';

export default function ChecklistCreateView() {

    const navigate   = useNavigate();
    const params     = useParams();
    const queryClient = useQueryClient();
    const asignacionId = params.asignacionId ? +params.asignacionId : undefined;
 
    const { mutate, isPending } = useMutation({
        mutationFn: postChecklist,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });
            toast.success(data.message);
            // Redirige al llenado del checklist recién creado
            navigate(`/asignacion/${asignacionId}/editChecklist/${data.id}`);
        }
    });
 
    if (!asignacionId) return <p>ID de asignación no especificado.</p>;

    return (
        <div className=' max-w-md mx-auto mt-20 text-center'>
            <div className=' bg-white rounded-xl border border-gray-100 p-10 shadow-sm'>
                <div className=' w-16 h-16 bg-[#e8edf5] rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className="w-8 h-8 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h1 className=' text-xl font-semibold text-gray-900 mb-2'>Iniciar Checklist</h1>
                <p className=' text-sm text-gray-500 mb-8'>Se creará un checklist para esta asignación. Podrás llenarlo sección por sección y guardar tu progreso</p>
                <button
                    onClick={() => mutate({ asignacionId })}
                    disabled={isPending}
                    className={` w-full py-3 px-4 rounded-lg text-white text-sm font-medium transition-colors ${
                        isPending 
                            ? 'bg-gray-400 cursor-not-allowed'
                            : ' bg-[#0f1f3d] hover:bg-[#1a3a6b]'
                    }`}
                >
                    {isPending ? 'Creando...' : 'Iniciar Checklist'}
                </button>
            </div>
        </div>
    )
}
