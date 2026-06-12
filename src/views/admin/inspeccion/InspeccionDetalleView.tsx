import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteInspeccion, getInspeccionById } from "../../../api/InspeccionAPI";
import { InspeccionById, inspeccionByIdSchema } from "../../../types";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Rol } from "../../../types/roles";
import DetalleInspeccion from "../../../components/admin/inspeccion/DetalleInspeccion";

export default function InspeccionDetalleView() {
    const { data: user } = useAuth();
    const params = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const inspeccionId = params.inspeccionId ? parseInt(params.inspeccionId, 10) : NaN;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['Insoeccion', inspeccionId],
        queryFn: () => getInspeccionById(inspeccionId),
        retry: false,
        enabled: !isNaN(inspeccionId),
        select: (responseData): InspeccionById | undefined => {
            const parsed = inspeccionByIdSchema.safeParse(responseData);
            if (!parsed.success) {
                console.error('Zod Error (Inspeccion Details):', parsed.error);
                throw new Error('Los datos de la inspección recibidos son inválidos.');
            }
            return parsed.data;
        }
    });

    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteInspeccion,
        onError: (error) => toast.error(`Error al eliminar: ${error.message}`),
        onSuccess: (responseData) => {
            toast.success(responseData?.message || 'Inspección eliminada correctamente');
            queryClient.invalidateQueries({ queryKey: ['Inspecciones'] });
            navigate('/inspecciones')
        }
    });

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir la eliminación de esta inspección!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) mutate(inspeccionId);
    };

    if (isNaN(inspeccionId)) return <Navigate to="/404" replace />;

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    );

    if (isError || !data) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-red-500 text-sm">Error al cargar la inspección.</p>
        </div>
    );

    const esSistemas = user?.rol === Rol.SISTEMAS;
    const identificador = data.tipo === 'REMOLQUE' ? `Remolque ${data.caja?.numero_caja ?? ''}` : `Unidad ${data.unidad?.no_unidad ?? ''}`;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className=" text-2xl font-semibold text-gray-900">{identificador}</h1>
                <p className=" text-sm text-gray-500 mt-0.5">Detalle de inspección de patio</p>
            </div>
            <DetalleInspeccion 
                data={data}
                inspeccionId={inspeccionId}
                onDelete={esSistemas ? handleDelete : undefined}
                isDeleting={isDeleting}
            />
        </div>
    )
}
