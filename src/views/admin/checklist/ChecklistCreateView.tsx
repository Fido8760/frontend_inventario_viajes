import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce'; 
import { useEffect, useMemo, useCallback } from 'react';
import ChecklistForm from '../../../components/admin/ChecklistForm';
import { PostChecklistArgs, postChecklist, BackendChecklistPayload } from '../../../api/ChecklistAPI';
import preguntasData from './preguntas.json';
import { PreguntasDataSchemaUI, PreguntasDataUI, checklistValidationSchema, ChecklistFormData, QuestionType } from '../../../types';
import { getAsignacionById } from '../../../api/AsignacionAPI';

const FORM_STORAGE_KEY_PREFIX = 'checklistForm_asignacion_';

const loadFormState = (storageKey: string): ChecklistFormData | undefined => {
  try {
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      return undefined;
    }
    const storedData = JSON.parse(serializedState);
    return storedData as ChecklistFormData
  } catch (error) {
    console.error("Error al cargar estado desde localStorage:", error);
    return undefined;
  }
};


const saveFormState = (storageKey: string, state: ChecklistFormData) => {
  try {
    if (state && state.respuestas && state.respuestas.preguntas && state.respuestas.preguntas.length > 0) {
        const allAnswersNotEmpty = state.respuestas.preguntas.some(p => 
            p.respuesta !== null && p.respuesta !== undefined && p.respuesta !== ''
        );
        if (!allAnswersNotEmpty && Object.keys(state).length === 1 && 'respuestas' in state && state.respuestas.preguntas.every(p => p.respuesta === getDefaultValueForType(p.tipo, undefined)) ) {

            return;
        }
        const serializedState = JSON.stringify(state);
        localStorage.setItem(storageKey, serializedState);
    }
  } catch (error) {
    console.error("Error al guardar estado en localStorage:", error);
  }
};


function getDefaultValueForType(tipo: QuestionType, initialValue: string | number | null | undefined): string | number | undefined | null {
    if (initialValue !== null && initialValue !== undefined) {
        if (tipo === 'numero') return typeof initialValue === 'number' ? initialValue : (initialValue === '' ? undefined : Number(initialValue));
        if (tipo === 'si_no' || tipo === 'opciones') return typeof initialValue === 'string' ? initialValue : '';
        return initialValue;
    }
    switch (tipo) {
        case 'numero': return undefined; 
        case 'si_no': return '';
        case 'opciones': return '';
        case 'texto': return '';
        default: return null;
    }
}

export default function ChecklistCreateView() {
    const navigate = useNavigate();
    const params = useParams();
    const asignacionId = params.asignacionId ? +params.asignacionId : undefined;
    const queryClient = useQueryClient()

    const dynamicFormStorageKey = useMemo(() => {
        return asignacionId ? `${FORM_STORAGE_KEY_PREFIX}${asignacionId}` : '';
    }, [asignacionId]);


    const parsedPlantilla: PreguntasDataUI | null = useMemo(() => {
        try {
            return PreguntasDataSchemaUI.parse(preguntasData);
        } catch (error) {
            console.error("Error parseando plantilla JSON:", error);
            toast.error("Error interno: No se pudo cargar la plantilla del checklist.");
            return null;
        }
    }, []);

    const { data: asignacionData, isLoading: isLoadingAsignacion, isError: isErrorAsignacion, error: errorAsignacion } = useQuery({
        queryKey: ['Asignacion', asignacionId],
        queryFn: () => {
            if (!asignacionId) return Promise.reject(new Error("ID de asignación inválido"));
            return getAsignacionById(asignacionId);
        },
        enabled: !!asignacionId && !!parsedPlantilla,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
    
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
                const preguntasConTipoCorrecto = preguntasFiltradas.map(pregunta => ({
                    ...pregunta,
                    aplicaA: pregunta.aplicaA as 'todos' | 'tractocamion' // Asumimos que el tipo es correcto después del filtro
                }));
                return { ...seccion, preguntas: preguntasConTipoCorrecto };
            })
            .filter((seccion) => seccion.preguntas.length > 0);
    }, [parsedPlantilla, asignacionData]);
    
    const { handleSubmit, formState: { errors, isDirty }, control, reset, watch } = useForm<ChecklistFormData>({
        resolver: zodResolver(checklistValidationSchema),
    })

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    useEffect(() => {
        if (!isLoadingAsignacion && asignacionId && dynamicFormStorageKey && seccionesFiltradas.length > 0) {
            const loadedState = loadFormState(dynamicFormStorageKey);
            
            if (loadedState && loadedState.respuestas && loadedState.respuestas.preguntas.length > 0) {
                reset(loadedState);
            } else {
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
                };
                //console.log("Inicializando con valores por defecto calculados:", calculatedDefaults);
                reset(calculatedDefaults);
            }
        } else if (!isLoadingAsignacion && asignacionId && seccionesFiltradas.length === 0 && asignacionData) {
            reset({ respuestas: { preguntas: [] } });
        }
    }, [seccionesFiltradas, isLoadingAsignacion, reset, dynamicFormStorageKey, asignacionId, asignacionData]);

    const watchedValues = watch();

    const debouncedSave = useCallback(
        debounce((data: ChecklistFormData) => {
            if (dynamicFormStorageKey) {
                saveFormState(dynamicFormStorageKey, data);
            }
        }, 1000),
        [dynamicFormStorageKey]
    );

    useEffect(() => {

        if (!isLoadingAsignacion && 
            dynamicFormStorageKey && 
            watchedValues && 
            watchedValues.respuestas && 
            watchedValues.respuestas.preguntas) {

            debouncedSave(watchedValues);
        }
    }, [watchedValues, debouncedSave, isLoadingAsignacion, dynamicFormStorageKey]);

    const { mutate } = useMutation({
    mutationFn: postChecklist,
    onError: (error) => {
        toast.error(error.message);
    },
    onSuccess: (data) => {
        if (data?.id) {
            toast.success(data.message);
            localStorage.removeItem(dynamicFormStorageKey);

            // 👇 Invalidar y refetchear los datos de asignación
            queryClient.invalidateQueries({
                queryKey: ['Asignacion', asignacionId]
            });

            navigate(`/asignacion/${asignacionId}/createChecklist/${data.id}/uploadImages`, { replace: true });
            } else {
                toast.error("Error al guardar el checklist: no se recibió ID.");
            }
        }
    });

    const handleCreateChecklist = (formData: ChecklistFormData) => {
        if (!asignacionId) {
            toast.error("ID de asignación no encontrado.");
            return;
        }

        if (asignacionData?.checklist?.id && !asignacionData.checklist.completado) {
            toast.info("Ya existe un checklist en proceso para esta asignación. Redirigiendo...");
            localStorage.removeItem(dynamicFormStorageKey);
            navigate(`/asignacion/${asignacionId}/createChecklist/${asignacionData.checklist.id}/uploadImages`, { replace: true });
            return;
        }

        if (asignacionData?.checklist?.completado) {
            toast.info("Este Checklist ya fue finalizado, no se puede crear otro");
            navigate("/asignaciones", { replace: true });
            return;
        }

        if(!parsedPlantilla?.preguntas) {
            toast.error("Error interno: Plantilla de checklist no disponible");
            return;
        }
        if (seccionesFiltradas.length === 0) {
            toast.error("No hay preguntas aplicables para este tipo de unidad.");
            return;
        }

        const respuestasMap = new Map<number, any>();
        formData.respuestas.preguntas.forEach(p => respuestasMap.set(p.idPregunta, p.respuesta));

        const finalBody: BackendChecklistPayload = {
            checklist: {
                secciones: seccionesFiltradas.map(seccionFiltrada => ({
                    nombre: seccionFiltrada.nombre,
                    preguntas: seccionFiltrada.preguntas.map( preguntaUI => {
                        const respuestaValidada = respuestasMap.get(preguntaUI.idPregunta);
                        return {
                            idPregunta: preguntaUI.idPregunta,
                            pregunta: preguntaUI.pregunta,
                            respuesta: respuestaValidada !== undefined ? respuestaValidada : getDefaultValueForType(preguntaUI.tipo, null),
                            tipo: preguntaUI.tipo,
                            aplicaA: preguntaUI.aplicaA
                        };
                    })
                }))
            }
        };

        const mutationArgs: PostChecklistArgs = { asignacionId, body: finalBody };
        mutate(mutationArgs);
    };

    const handleValidationErrors = (errors: FieldErrors<ChecklistFormData>) => {
        //console.error("Errores de Validación (desde handleSubmit):", errors);
        const preguntasErrors = errors.respuestas?.preguntas;
        let firstErrorMessage = "Por favor, revisa los campos marcados.";

        if (preguntasErrors && Array.isArray(preguntasErrors)) {
            for (const errorItem of preguntasErrors) {
                if (errorItem && errorItem.respuesta && errorItem.respuesta.message) {
                    firstErrorMessage = errorItem.respuesta.message;
                    break;
                }
            }
        } else if (preguntasErrors) { 
             const firstErrorIndex = Object.keys(preguntasErrors).find(index => (preguntasErrors as any)[index]);
             const firstQuestionErrorObject = firstErrorIndex !== undefined && preguntasErrors ? (preguntasErrors as any)[parseInt(firstErrorIndex)] : null;
             if (firstQuestionErrorObject?.respuesta?.message) {
                 firstErrorMessage = firstQuestionErrorObject.respuesta.message;
             } else if (firstQuestionErrorObject?.message) {
                 firstErrorMessage = firstQuestionErrorObject.message;
             }
        }
        toast.warning(firstErrorMessage, { autoClose: 4000 });
    };

    if (!asignacionId) return <p>ID de asignación no especificado en la URL.</p>;
    if (isLoadingAsignacion) return <p>Cargando datos de asignación...</p>;
    if (isErrorAsignacion) return <p>Error al cargar la asignación: {errorAsignacion instanceof Error ? errorAsignacion.message : 'Error desconocido'}</p>;
    if (!parsedPlantilla) return <p>Error al cargar la plantilla del checklist.</p>;
    if (!asignacionData) return <p>No se encontraron datos para la asignación. Verificando tipo de unidad...</p>;
    
    if (!isLoadingAsignacion && seccionesFiltradas.length === 0 && asignacionData) {
        return <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Checklist</h1>
            <p className="text-xl text-gray-600 mt-4">
                No hay preguntas de checklist aplicables para el tipo de unidad: {asignacionData.unidad.tipo_unidad}.
            </p>
            <button
                onClick={() => navigate(`/asignaciones`)}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Volver a Asignaciones
            </button>
        </div>;
    }


    const tipoUnidadActual = asignacionData.unidad.tipo_unidad;


    return (
        <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Paso 2: Llenar Checklist ({tipoUnidadActual})</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">Complete todos los campos indicados</p>
                <button 
                    type="button" 
                    onClick={() => {
                        if (dynamicFormStorageKey && confirm("¿Está seguro de que desea limpiar los datos guardados para este checklist?")) {
                            localStorage.removeItem(dynamicFormStorageKey);
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
                            };
                            reset(calculatedDefaults);
                            toast.info("Datos locales del formulario limpiados.");
                        }
                    }}
                    className="my-4 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                    Limpiar Borrador Guardado
                </button>
                <form
                    className=" mt-2 bg-white shadow-lg p-10 rounded-lg"
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