import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AsignacionForm from "./AsignacionForm";
import { AsignacionCompleta, AsignacionFormData, UnidadBase } from "../../types";
import { getCajas, getOperadores, getUnidades, updateAsignacion } from "../../api/AsignacionAPI";

type Props = {
    data: AsignacionCompleta;
    asignacionId: number;
};

export default function EditarAsignacionForm({ data, asignacionId }: Props) {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();
    const [cajaExterna, setCajaExterna] = useState(false);

    const { data: unidades }   = useQuery({ queryKey: ['unidades'],   queryFn: getUnidades,   staleTime: Infinity });
    const { data: cajas }      = useQuery({ queryKey: ['cajas'],      queryFn: getCajas,      staleTime: Infinity });
    const { data: operadores } = useQuery({ queryKey: ['operadores'], queryFn: getOperadores, staleTime: Infinity });

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AsignacionFormData>();

    const tipoUnidadOriginal = data.unidad.tipo_unidad;

    useEffect(() => {
        if (data && unidades && cajas && operadores) {
            reset({
                unidadId:   data.unidadId,
                cajaId:     data.cajaId ?? undefined,
                operadorId: data.operadorId ?? 0
            });
        }
    }, [data, unidades, cajas, operadores, reset]);

    const selectedUnidadId = watch('unidadId');
    const selectedUnidad   = useMemo(() => {
        const id = selectedUnidadId ? +selectedUnidadId : undefined;
        return unidades?.find((u: UnidadBase) => u.id === id);
    }, [selectedUnidadId, unidades]);

    const isTractocamion = selectedUnidad?.tipo_unidad === 'TRACTOCAMION';

    useEffect(() => {
        if (selectedUnidad !== undefined && unidades && !isTractocamion) {
            setValue('cajaId', null, { shouldValidate: true, shouldDirty: true });
        }
    }, [selectedUnidad, isTractocamion, unidades, setValue]);

    const { mutate, isPending } = useMutation({
        mutationFn: updateAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (responseData, variables) => {
            queryClient.invalidateQueries({ queryKey: ['editarAsignacion', asignacionId] });
            queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });

            toast.success(responseData || 'Asignación actualizada correctamente');

            const nuevaUnidad = unidades?.find((u: UnidadBase) => u.id === +variables.formData.unidadId);
            if (tipoUnidadOriginal && nuevaUnidad?.tipo_unidad && tipoUnidadOriginal !== nuevaUnidad.tipo_unidad) {
                toast.info("El tipo de unidad cambió. Por favor, revise el checklist.", { autoClose: 6000 });
                navigate(`/asignacion/${asignacionId}`);
            } else {
                navigate('/?page=1');
            }
        }
    });

    const handleCajaExterna = (checked: boolean) => {
        setCajaExterna(checked)
        setValue("caja_externa", checked)
        if(checked) setValue("cajaId", null)
    }

    const handleForm = (formData: AsignacionFormData) => mutate({ formData, asignacionId });

    return (
        <div className="max-w-xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                        to="/?page=1"
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
                        <p className="text-sm text-gray-500">Modifica la unidad, remolque u operador</p>
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
                        unidades={unidades || []}
                        cajas={cajas || []}
                        operadores={operadores || []}
                        cajaDisabled={!isTractocamion}
                        cajaExterna={cajaExterna}
                        onCajaExterna={handleCajaExterna}
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
                        {isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}