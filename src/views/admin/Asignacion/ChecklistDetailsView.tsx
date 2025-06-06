import { Link, useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2'
import { getAsignacionById } from '../../../api/AsignacionAPI';
import DetallesAsigancion from '../../../components/admin/DetallesAsigancion';
import { deleteChecklist, DeleteChecklistArgs } from '../../../api/ChecklistAPI';
import { toast } from 'react-toastify';
import { asignacionByIdApiResponseSchema, AsignacionByIdApiResponse } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';

export default function ChecklistDetailsView() {
    const { data: authenticatedUser } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();
    const asignacionIdParam = params.asignacionId;
    const asignacionId = asignacionIdParam ? parseInt(asignacionIdParam, 10) : NaN;

    if (isNaN(asignacionId)) {
        return <Navigate to="/404" replace />;
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['Asignacion', asignacionId],
        queryFn: () => getAsignacionById(asignacionId),
        retry: false,
        enabled: !isNaN(asignacionId),
        select: (responseData): AsignacionByIdApiResponse | undefined => {
            const parsed = asignacionByIdApiResponseSchema.safeParse(responseData);
            if (!parsed.success) {
                console.error("Zod Error (Asignacion Details):", parsed.error);
                throw new Error("Los datos de la asignación recibidos son inválidos.");
            }
            return parsed.data;
        },
    });

    const firstChecklist = data?.checklist;
    const checklistIdParaAcciones = firstChecklist?.id;

    // --- Mutación para Eliminar Checklist ---
    const { mutate, isPending: isDeleting } = useMutation({ 

        mutationFn: (args: DeleteChecklistArgs) => deleteChecklist(args),
        onError: (error) => {
            toast.error(`Error al eliminar: ${error.message}`);
        },
        onSuccess: (responseData) => {
            toast.success(responseData?.message || 'Checklist eliminado correctamente');
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });

        }
    });

    const handleDelete = async () => {
        if (checklistIdParaAcciones === undefined) {
            toast.warn("No se puede eliminar: ID de checklist no encontrado.");
            return;
        }

        // 2. Usar Swal.fire para confirmar
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir la eliminación de este checklist!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const args: DeleteChecklistArgs = {
                asignacionId: asignacionId,
                checklistId: checklistIdParaAcciones
            };
            mutate(args);
        }
    };


    if (isLoading) { return <p className='text-center text-2xl mt-10'>Cargando...</p>; }
    if (isError) { /* ... (manejo de error como antes) ... */ }

    if (data) {
        return (
            <>
                <div className='flex flex-col max-w-4xl mx-auto p-4'>
                    <h1 className='text-3xl font-bold mb-2'> Checklist de la Unidad {data.unidad.no_unidad}</h1>
                    <p className='text-xl font-light text-gray-500 mt-1 mb-5'>Aquí está el resultado del checklist realizado</p>

                    <nav className="flex flex-col md:flex-row items-center gap-4 mt-4 mb-6">
                    {/* Botón Volver - Siempre visible para todos los roles */}
                    <Link
                        to="/?page=1"
                        className="bg-blue-800 hover:bg-blue-900 px-10 py-3 rounded-md text-white text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center"
                    >
                        Volver
                    </Link>

                    {/* Mostrar acciones solo si el usuario tiene rol 1 (admin) */}
                    {authenticatedUser?.rol === 1 && (
                        <>
                            {checklistIdParaAcciones ? (
                                <>
                                    {/* Botón Editar - Solo para admin */}
                                    <Link
                                        to={`/asignacion/${asignacionId}/editChecklist/${checklistIdParaAcciones}`}
                                        className="bg-yellow-600 hover:bg-yellow-700 px-10 py-3 rounded-md text-white text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center"
                                    >
                                        Editar Checklist
                                    </Link>

                                    {/* Botón Eliminar - Solo para admin */}
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className={`px-10 py-3 rounded-md text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center ${
                                        isDeleting
                                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                    >
                                        {isDeleting ? 'Eliminando...' : 'Eliminar Checklist'}
                                    </button>
                                </>
                            ) : (
                                /* Botón Crear - Solo para admin cuando no hay checklist */
                                <Link
                                    to={`/asignacion/${asignacionId}/createChecklist`}
                                    className="bg-green-600 hover:bg-green-700 px-10 py-3 rounded-md text-white text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center"
                                >
                                    Crear Checklist
                                </Link>
                            )}
                        </>
                    )}
                    </nav>
                    <DetallesAsigancion
                        data={data}
                    />
                </div>
            </>
        );
    }

    // Fallback
    return <Navigate to="/404" replace />;
}