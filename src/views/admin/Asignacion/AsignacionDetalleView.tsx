import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { getAsignacionById } from '../../../api/AsignacionAPI';
import DetallesAsignacion from '../../../components/admin/DetallesAsignacion';
import { deleteChecklist } from '../../../api/ChecklistAPI';
import { toast } from 'react-toastify';
import { asignacionByIdApiResponseSchema, AsignacionByIdApiResponse } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { Rol } from '../../../types/roles';

export default function AsignacionDetalleView() {
    const { data: authenticatedUser } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();
    const asignacionId = params.asignacionId ? parseInt(params.asignacionId, 10) : NaN;

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

    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteChecklist,
        onError: (error) => toast.error(`Error al eliminar: ${error.message}`),
        onSuccess: (responseData) => {
            toast.success(responseData?.message || 'Checklist eliminado correctamente');
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });
        }
    });

    const handleDelete = async () => {
        const checklistId = data?.checklist?.id;
        if (!checklistId) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir la eliminación de este checklist!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            mutate({ asignacionId, checklistId });
        }
    };

    if (isNaN(asignacionId)) return <Navigate to="/404" replace />;

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    );

    if (isError || !data) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-red-500 text-sm">Error al cargar la asignación.</p>
        </div>
    );

    const esSistemas = authenticatedUser?.rol === Rol.SISTEMAS;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Unidad {data.unidad.no_unidad}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Detalle de asignación y checklist
                </p>
            </div>

            <DetallesAsignacion
                data={data}
                asignacionId={asignacionId}
                onDeleteChecklist={esSistemas ? handleDelete : undefined}
                isDeletingChecklist={isDeleting}
            />
        </div>
    );
}