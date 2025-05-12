import AsignacionForm from "./AsignacionForm";
import { Link, useNavigate } from "react-router-dom";
import { AsignacionCompleta, AsignacionFormData, UnidadBase } from "../../types";
import { useForm } from "react-hook-form";
import { getCajas, getOperadores, getUnidades, updateAsignacion } from "../../api/AsignacionAPI";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";

type EditarAsignacionFormProps = {
  data: AsignacionCompleta;
  asignacionId: number;
};

export default function EditarAsignacionForm({ data, asignacionId }: EditarAsignacionFormProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- Queries para los Selects ---
    const { data: unidades } = useQuery({
        queryKey: ['unidades'],
        queryFn: getUnidades,
        staleTime: Infinity, // Buena idea para listas que cambian poco
    });

    const { data: cajas } = useQuery({
        queryKey: ['cajas'],
        queryFn: getCajas,
        staleTime: Infinity,
    });

    const { data: operadores } = useQuery({
        queryKey: ['operadores'],
        queryFn: getOperadores,
        staleTime: Infinity,
    });

    // --- useForm ---
    const { register, handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<AsignacionFormData>();

    // --- Guardar el tipo de unidad original (antes de cualquier cambio) ---
    const tipoUnidadOriginal = data.unidad.tipo_unidad;

    // --- useEffect para inicializar el formulario ---
    useEffect(() => {
        // Ejecutar solo cuando todos los datos necesarios estén disponibles
        if (data && unidades && cajas && operadores) {
            const formDataValues: AsignacionFormData = {
                unidadId: data.unidadId,
                cajaId: data.cajaId ?? undefined, // Mapear null a undefined
                operadorId: data.operadorId
            };
            reset(formDataValues); // Inicializa el formulario
        }
    }, [data, unidades, cajas, operadores, reset]); // Dependencias correctas

    // --- Lógica para deshabilitar/limpiar caja si no es Tractocamión ---
    const selectedUnidadId = watch('unidadId'); // Observa el ID de unidad seleccionado
    const selectedUnidad = useMemo(() => { // Memoizar la búsqueda para eficiencia
        // Asegurar que selectedUnidadId sea número para la comparación
        const currentUnidadId = selectedUnidadId ? +selectedUnidadId : undefined;
        return unidades?.find((unidad: UnidadBase) => unidad.id === currentUnidadId);
    }, [selectedUnidadId, unidades]);

    const isTractocamion = selectedUnidad?.tipo_unidad === 'TRACTOCAMION';

    useEffect(() => {
        // Si la unidad seleccionada cambia Y tenemos la lista de unidades
        if (selectedUnidad !== undefined && unidades) { // Usar selectedUnidad que ya está calculado
            if (!isTractocamion) {
                // Si NO es tractocamión, limpia y deshabilita cajaId
                setValue('cajaId', null, { shouldValidate: true, shouldDirty: true });
            }
            // Si es tractocamión, el campo se habilita (manejado en AsignacionForm)
            // y el usuario puede seleccionar una caja si quiere.
        }
    }, [selectedUnidad, isTractocamion, unidades, setValue]); // Depende de la unidad encontrada


    // --- Mutación para Actualizar ---
    const { mutate, isPending: isUpdating } = useMutation({ // Renombrado isPending a isUpdating
        mutationFn: updateAsignacion,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (responseData, variables) => { // responseData: API response, variables: args pasados a mutate
            // 'responseData' aquí es la respuesta de tu API (probablemente un string como 'Asignación actualizada')
            // 'variables' es el objeto que pasaste a mutate: { asignacionId, formData }

            // 1. Invalida Queries (Correcto)
            queryClient.invalidateQueries({ queryKey: ['editarAsignacion', asignacionId] });
            queryClient.invalidateQueries({ queryKey: ['asignaciones'] }); // Asumiendo que 'asignaciones' es la key de tu lista general
            queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });

            // 2. Muestra Éxito (Usar responseData si es un objeto con message, o un mensaje genérico)
            //    Si tu API sólo devuelve un string, úsalo directamente.
            //    Si devuelve { message: '...' }, usa responseData.message
            toast.success(responseData || 'Asignación actualizada correctamente'); // Ajusta según tu API response

            // --- LÓGICA DE REDIRECCIÓN CONDICIONAL ---
            // 3. Determina el NUEVO tipo de unidad
            const nuevaUnidadId = variables.formData.unidadId; // ID de la unidad seleccionada en el form
            const unidadSeleccionadaPostUpdate = unidades?.find((u: UnidadBase) => u.id === +nuevaUnidadId); // Busca en la lista cargada
            const tipoUnidadNuevo = unidadSeleccionadaPostUpdate?.tipo_unidad;

            console.log("Tipo Unidad Original:", tipoUnidadOriginal);
            console.log("Tipo Unidad Nuevo:", tipoUnidadNuevo);

            // 4. Compara si el tipo cambió Y ambos tipos son válidos
            if (tipoUnidadOriginal && tipoUnidadNuevo && tipoUnidadOriginal !== tipoUnidadNuevo) {
                toast.info("El tipo de unidad cambió. Por favor, revise/actualice el checklist.", { autoClose: 6000 });

                // 5. Navega a la vista de detalle de la asignación
                //    (Permite al usuario elegir el checklist desde ahí)
                navigate(`/asignacion/${asignacionId}`);

            } else {
                // Si el tipo NO cambió (o no se pudo determinar), navega a la lista principal o detalle
                navigate('/?page=1'); // O a `/asignacion/${asignacionId}`
            }
        }
    });

    // --- Manejador de Envío ---
    const handleForm = (formData: AsignacionFormData) => {
        // Prepara el objeto de argumentos esperado por tu `updateAsignacion` y `useMutation`
        const dataToSend = {
            formData, // Los datos validados del formulario
            asignacionId // El ID de la asignación a actualizar
        };
        mutate(dataToSend); // Llama a la mutación con los datos correctos
    };

    // --- JSX ---
    return (
        <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Editar Asignación</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">
                    Selecciona la Unidad, Remolque y el nombre del Operador
                </p>
                <nav className=" my-5">
                    <Link
                        className="  bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
                        to={'/?page=1'} // Vuelve a la lista
                    >
                        Volver
                    </Link>
                </nav>
                <form
                    className=" mt-10 bg-white shadow-lg p-10 rounded-lg"
                    onSubmit={handleSubmit(handleForm)} // Llama a handleForm al enviar
                    noValidate
                >
                    {/* Pasa el estado de deshabilitado a AsignacionForm */}
                    <AsignacionForm
                        register={register}
                        errors={errors}
                        control={control} // Pasa control si AsignacionForm usa useController
                        unidades={unidades || []}
                        cajas={cajas || []}
                        operadores={operadores || []}
                        cajaDisabled={!isTractocamion} // Controla si el select de caja está deshabilitado
                    />
                    <input
                        type="submit"
                        value={isUpdating ? "Guardando..." : "Guardar Cambios"} // Texto y estado de carga
                        disabled={isUpdating} // Deshabilita al guardar
                        className={`w-full mt-8 p-3 text-white uppercase font-bold transition-colors rounded ${ // Añadido rounded
                            isUpdating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-800 hover:bg-red-900 cursor-pointer'
                        }`}
                    />
                </form>
            </div>
        </>
    );
}