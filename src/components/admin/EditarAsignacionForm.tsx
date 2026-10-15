import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AsignacionForm from "./asignacion/AsignacionForm";
import { getCajas, getOperadores, getUnidades, updateAsignacion } from "../../api/AsignacionAPI";
import { AsignacionFormData, AsignacionItem } from "../../types/asignacion";

type Props = {
    data: AsignacionItem;
    asignacionId: number;
};

export default function EditarAsignacionForm({ data, asignacionId }: Props) {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();

    const { data: unidades, isLoading: loadingUnidades } = useQuery({ queryKey: ['unidades'],   queryFn: () => getUnidades(),   staleTime: Infinity });
    const { data: cajas, isLoading: loadingCajas } = useQuery({ queryKey: ['cajas'],      queryFn: () => getCajas(),      staleTime: Infinity });
    const { data: operadores, isLoading: loadingOperadores } = useQuery({ queryKey: ['operadores'], queryFn: () => getOperadores(), staleTime: Infinity });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AsignacionFormData>({
        defaultValues: {
            unidadId: data.unidadId,
            cajaId: data.cajaId ?? undefined,
            operadorId: data.operadorId ?? 0,
        }
    });
    
    const [cajaDisabled, setCajaDisabled] = useState(false);
    const selectedUnidadId = watch('unidadId');

    const listaUnidades = useMemo(() => {
        if (!unidades) return data.unidad ? [data.unidad] : [];
        const existe = unidades.some(u => u.id === data.unidad.id);
        return existe ? unidades : [data.unidad, ...unidades]; 
    }, [unidades, data.unidad]);

    const listaCajas = useMemo(() => {
        if (!cajas) return data.caja ? [data.caja] : [];
        if (!data.caja) return cajas;
        const existe = cajas.some(c => c.id === data.caja?.id);
        return existe ? cajas : [data.caja, ...cajas];
    }, [cajas, data.caja]);

    const listaOperadores = useMemo(() => {
        if (!operadores) return data.operador ? [data.operador] : [];
        const existe = operadores.some(o => o.id === data.operador?.id);
        return existe ? operadores : [data.operador, ...operadores];
    }, [operadores, data.operador]);

    useEffect(() => {
        const id = selectedUnidadId ? Number(selectedUnidadId) : data.unidadId;
        const unidad = listaUnidades.find(u => u.id === id);

        if (unidad?.tipo_unidad === "MUDANCERO" || unidad?.tipo_unidad === "CAMIONETA") {
            setCajaDisabled(true);
            setValue('cajaId', null);
        } else {
            setCajaDisabled(false);
        }
    }, [selectedUnidadId, listaUnidades, data.unidadId, setValue]);

        const { mutate, isPending } = useMutation({
        mutationFn: updateAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
            queryClient.invalidateQueries({ queryKey: ['asignacion', asignacionId] });
            queryClient.invalidateQueries({ queryKey: ['unidades'] });
            queryClient.invalidateQueries({ queryKey: ['operadores'] });
            queryClient.invalidateQueries({ queryKey: ['cajas'] });

            toast.success(res?.message || 'Asignación actualizada correctamente');
            navigate('/');
        }
    });

      const handleForm = (formData: AsignacionFormData) => {
        const payload = {
            ...formData,
            cajaId: cajaDisabled || !formData.cajaId ? null : Number(formData.cajaId)
        };
        mutate({ formData: payload, asignacionId });
    };

    if (loadingUnidades || loadingCajas || loadingOperadores) {
    return (
        <div className="py-20 text-center text-sm text-gray-400">
            Cargando unidades disponibles...
        </div>
    );
}
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
                        Volver
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Editar asignación</h1>
                        <p className="text-sm text-gray-500">Corrige la unidad, operador o remolque de esta asignación</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <form
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                    className="p-6"
                >
                    <AsignacionForm
                        register={register}
                        errors={errors}
                        unidades={listaUnidades}
                        cajas={listaCajas}
                        operadores={listaOperadores}
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
                        {isPending ? 'Guardando cambios...' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}