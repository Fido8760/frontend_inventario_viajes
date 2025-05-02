import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import ChecklistForm from '../../../components/admin/ChecklistForm';
import { PostChecklistArgs, postChecklist, BackendChecklistPayload } from '../../../api/ChecklistAPI';
import preguntasData from './preguntas.json';
import { PreguntasDataSchemaUI, PreguntasDataUI, checklistValidationSchema, ChecklistFormData, QuestionType } from '../../../types';
import { getAsignacionById } from '../../../api/AsignacionAPI';
import { useEffect, useMemo } from 'react';

function getDefaultValueForType(tipo: QuestionType, initialValue: string | number | null | undefined): string | number | undefined | null {
    if (initialValue !== null && initialValue !== undefined) {
        if (tipo === 'numero') return typeof initialValue === 'number' ? initialValue : (initialValue === '' ? undefined : Number(initialValue))
        if (tipo === 'si_no' || tipo === 'opciones') return typeof initialValue === 'string' ? initialValue : ''
        return initialValue
    }
    switch (tipo) {
        case 'numero': return undefined
        case 'si_no': return ''
        case 'opciones': return ''
        case 'texto': return ''
        default: return null
    }
}

export default function ChecklistCreateView() {

    const navigate = useNavigate()
    const params = useParams()
    const asignacionId = +params.asignacionId!

    const parsedPlantilla: PreguntasDataUI | null = useMemo(() => {
        try {
            return PreguntasDataSchemaUI.parse(preguntasData)

        } catch (error) {
            console.error("Error parseando plantilla JSON:", error);
            toast.error("Error interno: No se pudo cargar la plantilla del checklist.");
            return null;
        }

    }, [])

    const { data: asignacionData, isLoading: isLoadingAsignacion, isError: isErrorAsignacion, error: errorAsignacion} = useQuery({
        queryKey:['Asignacion', asignacionId],
        queryFn: () => {
            if (!asignacionId) return Promise.reject(new Error("ID inválido"));
            return getAsignacionById(asignacionId);
        },
        enabled: !!asignacionId && !!parsedPlantilla,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
    
    const seccionesFiltradas = useMemo(() => {
        const tipoUnidadActual = asignacionData?.unidad.tipo_unidad;
        if (!tipoUnidadActual || !parsedPlantilla?.preguntas) return [];
        const tipoActualLower = tipoUnidadActual.toLowerCase();
        return parsedPlantilla.preguntas
            .map((seccion) => {
                const preguntasFiltradas = seccion.preguntas.filter((p) => {
                    const aplicaA = p.aplicaA?.toLowerCase() || "todos";
                    return aplicaA === "todos" || aplicaA === tipoActualLower;
                });
                // Corregir el tipo de aplicaA aquí
                const preguntasConTipoCorrecto = preguntasFiltradas.map(pregunta => ({
                    ...pregunta,
                    aplicaA: pregunta.aplicaA === 'todos' || pregunta.aplicaA === 'tractocamion' ? pregunta.aplicaA : 'todos' as 'todos' | 'tractocamion'
                }));
    
                return { ...seccion, preguntas: preguntasConTipoCorrecto };
            })
            .filter((seccion) => seccion.preguntas.length > 0);
    }, [parsedPlantilla, asignacionData]);
    
    // Inicializar formulario con el schema generado
    const { handleSubmit, formState: { errors}, control, reset } = useForm<ChecklistFormData>({ // Agregamos touchedFields y watch
        resolver: zodResolver(checklistValidationSchema),
        defaultValues: {
            respuestas: {
                preguntas: seccionesFiltradas.flatMap(seccion => 
                    seccion.preguntas.map(preguntaUI => ({
                        idPregunta: preguntaUI.idPregunta,
                        tipo: preguntaUI.tipo,
                        respuesta: getDefaultValueForType(preguntaUI.tipo, preguntaUI.respuesta)
                    }))
                ) as ChecklistFormData['respuestas']['preguntas']
            }
        }
    });

    useEffect(() => {
        if(!isLoadingAsignacion && seccionesFiltradas.length > 0 ) {
            console.log("RESETTING FORM with secciones:", seccionesFiltradas);
            const calculatedDefaults = {
                respuestas: {
                    preguntas: seccionesFiltradas.flatMap(seccion => 
                        seccion.preguntas.map(preguntaUI => ({
                            idPregunta: preguntaUI.idPregunta,
                            tipo: preguntaUI.tipo,
                            respuesta: getDefaultValueForType(preguntaUI.tipo, preguntaUI.respuesta)
                        }))
                    ) as ChecklistFormData['respuestas']['preguntas']
                }
            }
            reset(calculatedDefaults)
        }
    }, [seccionesFiltradas, isLoadingAsignacion, reset])

    const { mutate } = useMutation({
        mutationFn: postChecklist,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if (data?.id) {
                toast.success(data.message)
                navigate(`/asignacion/${asignacionId}/createChecklist/${data.id}/uploadImages`);
            } else {
                console.warn("No se recibió ID después de guardar el checklist.");
            }
        }
    })

    const handleCreateChecklist = (formData: ChecklistFormData) => {
        if(!parsedPlantilla?.preguntas) {
            toast.error("Error interno: Plantilla de checklist no disponible")
            return
        }

        const respuestasMap = new Map<number, any>()
        formData.respuestas.preguntas.forEach(p => respuestasMap.set(p.idPregunta, p.respuesta))

        const finalBody: BackendChecklistPayload = {
            checklist: {
                secciones: seccionesFiltradas.map(seccionFiltrada => ({
                    nombre: seccionFiltrada.nombre,
                    preguntas: seccionFiltrada.preguntas.map( preguntaUI => {
                        const preguntaOriginal = (parsedPlantilla.preguntas ?? [])
                        .find(s => s.nombre === seccionFiltrada.nombre)
                        ?.preguntas.find(p => p.idPregunta === preguntaUI.idPregunta)
                        const respuestaValidada = respuestasMap.get(preguntaUI.idPregunta)
                        const aplicaAValue = preguntaOriginal?.aplicaA ?? "todos"

                        return {
                            idPregunta: preguntaUI.idPregunta,
                            pregunta: preguntaUI.pregunta,
                            respuesta: respuestaValidada !== undefined ? respuestaValidada : getDefaultValueForType(preguntaUI.tipo, null),
                            tipo: preguntaUI.tipo,
                            aplicaA: aplicaAValue as ('todos' | 'tractocamion')
                        }
                    })
                }))
            }
        }
        console.log("Datos a enviar al backend (Filtrados):", JSON.stringify(finalBody, null, 2));
        const mutationArgs: PostChecklistArgs = { asignacionId: asignacionId!, body: finalBody };
        mutate(mutationArgs);
    }

    const handleValidationErrors = (errors: FieldErrors<ChecklistFormData>) => {
        console.error("Errores de Validación (desde handleSubmit):", errors);
        // Busca el primer error para mostrar un mensaje más útil
        const preguntasErrors = errors.respuestas?.preguntas;
        const firstErrorIndex = preguntasErrors ? Object.keys(preguntasErrors).find(index => preguntasErrors[parseInt(index)]) : undefined;
        const firstQuestionErrorObject = firstErrorIndex !== undefined && preguntasErrors ? preguntasErrors[parseInt(firstErrorIndex)] : null;
        const message =
        firstQuestionErrorObject?.respuesta?.message || // Error específico en la respuesta
        firstQuestionErrorObject?.message || // Error en el objeto de la pregunta misma (raro con discriminatedUnion)
        "Por favor, revisa los campos marcados."; // Fallback

        toast.warning(message, { autoClose: 4000 });
    };

    if (isLoadingAsignacion) return <p>Cargando datos de asignación...</p>;
    if (isErrorAsignacion) return <p>Error al cargar la asignación: {errorAsignacion instanceof Error ? errorAsignacion.message : 'Error desconocido'}</p>;
    if (!parsedPlantilla) return <p>Error al cargar la plantilla del checklist.</p>;
    if (!asignacionData) return <p>No se encontraron datos para la asignación.</p>;

    const tipoUnidadActual = asignacionData.unidad.tipo_unidad;

    return (
        <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Paso 2: Llenar Checklist ({tipoUnidadActual})</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">Complete todos los campos indicados</p>
                <form
                    className=" mt-10 bg-white shadow-lg p-10 rounded-lg"
                    onSubmit={handleSubmit(handleCreateChecklist, handleValidationErrors)}
                    noValidate
                >

                    <ChecklistForm
                        errors={errors}
                        seccionesParaRenderizar={seccionesFiltradas}
                        control={control}
                    />

                    <input
                        type="submit" 
                        value={'Enviar Checklist'}
                        className="w-full mt-8 p-3 text-white uppercase font-bold transition-colors bg-red-800 hover:bg-red-900 cursor-pointer "
                    />
                </form>
            </div>
        </>
    );
}
