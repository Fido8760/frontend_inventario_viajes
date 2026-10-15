import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AsignacionForm from "../../../components/admin/asignacion/AsignacionForm";
import { crearAsignacion, getCajas, getOperadores, getUnidades } from "../../../api/AsignacionAPI";
import { AsignacionFormData } from "../../../types/asignacion";

export default function CrearAsignacion() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const initialValues: AsignacionFormData = {
        unidadId: '' as any,
        operadorId: '' as any,
        cajaId: '' as any,
    };

    // Catálogos: ahora traen solo los 100% disponibles
    const { data: unidades, isLoading: loadingUnidades } = useQuery({ 
        queryKey: ['unidades', 'disponibles'], 
        queryFn: () => getUnidades(true) 
    });
    const { data: cajas, isLoading: loadingCajas } = useQuery({ 
        queryKey: ['cajas', 'disponibles'], 
        queryFn: () => getCajas(true) 
    });
    const { data: operadores, isLoading: loadingOperadores } = useQuery({ 
        queryKey: ['operadores', 'disponibles'], 
        queryFn: () => getOperadores(true) 
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AsignacionFormData>({
        defaultValues: initialValues
    });

    const unidadIdSeleccionada = watch("unidadId");
    const [cajaDisabled, setCajaDisabled] = useState(false);

    // 🔒 Deshabilitar remolque si la unidad seleccionada es Mudancero o Camioneta
    useEffect(() => {
        if (!unidadIdSeleccionada || !unidades) return;

        const unidad = unidades.find(u => u.id === Number(unidadIdSeleccionada));
        if (unidad?.tipo_unidad === "MUDANCERO" || unidad?.tipo_unidad === "CAMIONETA") {
            setCajaDisabled(true);
            setValue("cajaId", null);
        } else {
            setCajaDisabled(false);
        }
    }, [unidadIdSeleccionada, unidades, setValue]);

    const { mutate, isPending } = useMutation({
        mutationFn: crearAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            if (data) {
                toast.success(data.message);
                // Invalidamos para que la lista principal se actualice
                queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
                queryClient.invalidateQueries({ queryKey: ["unidades"] });
                queryClient.invalidateQueries({ queryKey: ["operadores"] });
                queryClient.invalidateQueries({ queryKey: ["cajas"] });

                // Redirigir al detalle de la asignación creada
                navigate(`/asignacion/${data.id}`, { replace: true });
            }
        }
    });

    const handleForm = (formData: AsignacionFormData) => {
        // Aseguramos que si es mudancero o camioneta, cajaId viaje en null
        const payload = {
            ...formData,
            cajaId: cajaDisabled || !formData.cajaId ? null : Number(formData.cajaId)
        };
        mutate(payload);
    };

    const isLoadingCatalogs = loadingUnidades || loadingCajas || loadingOperadores;

    return (
        <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a asignaciones
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#0f1f3d]">1</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Nueva asignación</h1>
                        <p className="text-sm text-gray-500">Selecciona la unidad, operador y remolque disponibles</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoadingCatalogs ? (
                    <div className="py-20 text-center text-sm text-gray-400">
                        Cargando catálogos disponibles...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(handleForm)}
                        noValidate
                        className="p-6"
                    >
                        <AsignacionForm
                            register={register}
                            errors={errors}
                            unidades={unidades || []}
                            cajas={cajas || []}
                            operadores={operadores || []}
                            cajaDisabled={cajaDisabled}
                        />

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`w-full mt-6 py-2.5 px-4 text-sm font-medium text-white rounded-lg transition-colors ${
                                isPending
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#0f1f3d] hover:bg-[#1a3a6b]'
                            }`}
                        >
                            {isPending ? 'Creando asignación...' : 'Crear asignación'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}