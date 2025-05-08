// --- Importaciones (Incluir las necesarias para mutación) ---
import { useEffect, useMemo } from "react";
import { FieldErrors, useForm } from "react-hook-form"; // Asegúrate de importar FieldErrors
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useParams, Navigate, useNavigate } from "react-router-dom"; // Añadir useNavigate si quieres redirigir
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ChecklistForm from "../../../components/admin/ChecklistForm";
import { getChecklist, updateChecklist, UpdateChecklistArgs, BackendChecklistPayload } from "../../../api/ChecklistAPI";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import preguntasData from "./preguntas.json";
import { PreguntasDataSchemaUI, PreguntasDataUI, checklistValidationSchema, ChecklistFormData, QuestionType, SeccionUI, asignacionByIdApiResponseSchema, AsignacionByIdApiResponse } from "../../../types";

function getDefaultValueForType(
  tipo: QuestionType,
  initialValue: string | number | null | undefined
): string | number | undefined | null {
  if (initialValue !== null && initialValue !== undefined && initialValue !== "") {
    if (tipo === "numero")
      return typeof initialValue === "number"
        ? initialValue
        : initialValue === ""
          ? undefined
          : Number(initialValue);
    if (tipo === "si_no" || tipo === "opciones" || tipo === "texto")
      return String(initialValue);
  }
  switch (tipo) {
    case "numero": return undefined;
    case "si_no": return "";
    case "opciones": return "";
    case "texto": return "";
    default: return undefined;
  }
}

// --- Componente Principal ---
export default function ChecklistEditView() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const asignacionIdParam = params.asignacionId;
  const checklistIdParam = params.checklistId;
  const asignacionId = asignacionIdParam ? parseInt(asignacionIdParam, 10) : NaN;
  const checklistId = checklistIdParam ? parseInt(checklistIdParam, 10) : NaN;

  if (isNaN(asignacionId) || isNaN(checklistId)) {
    toast.error("Error: Faltan datos necesarios para cargar la página.");
    return <Navigate to="/?page=1" replace />;
  }

  const parsedPlantilla: PreguntasDataUI | null = useMemo(() => {
    try {
      return PreguntasDataSchemaUI.parse(preguntasData);
    } catch (error) {
      console.error("Error parseando plantilla JSON:", error);
      toast.error("Error interno: No se pudo cargar la plantilla del checklist.");
      return null;
    }
  }, []);

  const { data: asignacionData, isLoading: isLoadingAsignacion, isError: isErrorAsignacion } = useQuery({
    queryKey: ["Asignacion", asignacionId],
    queryFn: () => getAsignacionById(asignacionId),
    enabled: !isNaN(asignacionId) && !!parsedPlantilla,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    select: (data): AsignacionByIdApiResponse | undefined => {
        const parsed = asignacionByIdApiResponseSchema.safeParse(data);
        if (!parsed.success) {
            console.error("Zod Error (Asignacion):", parsed.error);
            throw new Error("Los datos de la asignación recibidos son inválidos.");
        }
        return parsed.data;
    },
  });

  const { data: checklistData, isLoading: isLoadingChecklist, isError: isErrorChecklist } = useQuery({
    queryKey: ["Checklist", asignacionId, checklistId],
    queryFn: () => getChecklist(asignacionId, checklistId),
    enabled: !isNaN(asignacionId) && !isNaN(checklistId) && !!parsedPlantilla,
    retry: false,
  });

  const seccionesFiltradas: SeccionUI[] = useMemo(() => {
    const tipoUnidadActual = asignacionData?.unidad?.tipo_unidad;
    if (!tipoUnidadActual || !parsedPlantilla?.preguntas) return [];
    const tipoActualLower = tipoUnidadActual.toLowerCase();

    return parsedPlantilla.preguntas
      .map((seccion) => {
        const preguntasFiltradas = seccion.preguntas.filter((p) => {
          const aplicaA = p.aplicaA?.toLowerCase() || "todos";
          return aplicaA === "todos" || aplicaA === tipoActualLower;
        });
        return { ...seccion, preguntas: preguntasFiltradas };
      })
      .filter((seccion) => seccion.preguntas.length > 0);
  }, [parsedPlantilla, asignacionData]);

  const { handleSubmit, formState: { errors }, control, reset } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistValidationSchema),
  });

  useEffect(() => {
    if (checklistData && seccionesFiltradas.length > 0 && !isLoadingChecklist && !isLoadingAsignacion) {
        const respuestasExistentesMap = new Map<number, any>();
        checklistData.respuestas?.secciones?.forEach((seccion) => {
            seccion.preguntas.forEach((pregunta) => {
                respuestasExistentesMap.set(pregunta.idPregunta, pregunta.respuesta);
            });
        });
        const calculatedDefaults: ChecklistFormData = {
            respuestas: {
                preguntas: seccionesFiltradas.flatMap(
                    (seccion) =>
                    seccion.preguntas.map((preguntaUI) => {
                        const respuestaGuardada = respuestasExistentesMap.get(preguntaUI.idPregunta);
                        return {
                            idPregunta: preguntaUI.idPregunta,
                            tipo: preguntaUI.tipo,
                            respuesta: getDefaultValueForType(preguntaUI.tipo, respuestaGuardada),
                        };
                    })
                ) as ChecklistFormData["respuestas"]["preguntas"]
            },
        };
        reset(calculatedDefaults);
    }
  }, [checklistData, seccionesFiltradas, isLoadingChecklist, isLoadingAsignacion, reset]);

  // --- Mutación para Actualizar ---
  const { mutate, isPending: isUpdating } = useMutation({ // Renombrado a isUpdating para claridad
    mutationFn: updateChecklist, // Usa la función de API correcta
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`); // Mensaje de error
    },
    onSuccess: (data) => { 
      queryClient.invalidateQueries({ queryKey: ['Checklist', asignacionId, checklistId] });
      queryClient.invalidateQueries({ queryKey: ['Asignacion', asignacionId] });
      toast.success(data.message || "Checklist guardado con éxito");
      navigate(`/asignacion/${asignacionId}`)
    }
  })

  const handleUpdateChecklist = (formData: ChecklistFormData) => {
    if (!parsedPlantilla?.preguntas) {
      toast.error("Error interno: Plantilla no cargada.");
      return;
    }
    if (isNaN(asignacionId) || isNaN(checklistId)) {
       toast.error("Error interno: IDs inválidos.");
       return;
    }

    const respuestasFormularioMap = new Map<number, any>();
    formData.respuestas.preguntas.forEach(p => respuestasFormularioMap.set(p.idPregunta, p.respuesta));

    const finalBody: BackendChecklistPayload = {
      checklist: {
        secciones: seccionesFiltradas.map(seccionFiltrada => ({
          nombre: seccionFiltrada.nombre,
          preguntas: seccionFiltrada.preguntas.map(preguntaUI => {
            const preguntaOriginal = parsedPlantilla.preguntas
              .flatMap(s => s.preguntas)
              .find(p => p.idPregunta === preguntaUI.idPregunta);
            const respuestaValidada = respuestasFormularioMap.get(preguntaUI.idPregunta);
            const aplicaAValue = preguntaOriginal?.aplicaA || "todos";

            return {
              idPregunta: preguntaUI.idPregunta,
              pregunta: preguntaUI.pregunta,
              respuesta: respuestaValidada !== undefined ? respuestaValidada : getDefaultValueForType(preguntaUI.tipo, undefined),
              tipo: preguntaUI.tipo,
              aplicaA: aplicaAValue as ('todos' | 'tractocamion')
            };
          })
        }))
      }
    };

    const mutationArgs: UpdateChecklistArgs = {
      asignacionId: asignacionId,
      checklistId: checklistId,
      body: finalBody
    };

    mutate(mutationArgs);
  };

  const handleValidationErrors = (errors: FieldErrors<ChecklistFormData>) => {
    const preguntasErrors = errors.respuestas?.preguntas;
    let firstErrorMessage = "Por favor, revisa los campos marcados.";
    if (preguntasErrors) {
      for (const key in preguntasErrors) {
        const errorObj = preguntasErrors[key];
        if (errorObj?.respuesta?.message) {
          firstErrorMessage = errorObj.respuesta.message;
          break;
        } else if (errorObj?.message) {
          firstErrorMessage = errorObj.message;
          break;
        }
      }
    }
    toast.warning(firstErrorMessage, { autoClose: 4000 });
  };

  if (isLoadingAsignacion || isLoadingChecklist) { return <p>Cargando...</p>}
  if (isErrorAsignacion) { return <p>Error Asignacion...</p>}
  if (isErrorChecklist) { return <p>Error Checklist...</p>}
  if (!parsedPlantilla) { return <p>Error Plantilla...</p>}
  if (!asignacionData) { return <p>No hay datos Asignacion...</p>}
  if (!checklistData) { return <p>No hay datos Checklist...</p>}

  const tipoUnidadActual = asignacionData.unidad?.tipo_unidad || "Desconocido";

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black">
          Editar Checklist ({tipoUnidadActual}) 
        </h1>
        <p className="text-xl font-light text-gray-500 mt-5">
          Modifique los datos y guarde los cambios.
        </p>

        <form
          className=" mt-10 bg-white shadow-lg p-10 rounded-lg"
          onSubmit={handleSubmit(handleUpdateChecklist, handleValidationErrors)}
          noValidate
        >
          {seccionesFiltradas.length > 0 ? (
            <ChecklistForm
              errors={errors}
              seccionesParaRenderizar={seccionesFiltradas}
              control={control}
            />
          ) : (
             <p className=' text-center text-gray-600'>No hay preguntas aplicables para este tipo de unidad ({tipoUnidadActual}).</p>
          )}

          {/* BOTÓN DE SUBMIT CON ESTADO DE CARGA */}
          {seccionesFiltradas.length > 0 && (
            <input
                type="submit"
                value={isUpdating ? 'Guardando Cambios...' : 'Guardar Cambios'}
                disabled={isUpdating}
                className={`w-full mt-8 p-3 text-white uppercase font-bold transition-colors ${
                    isUpdating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-800 hover:bg-red-900 cursor-pointer'
                }`}
            />
          )}
        </form>
      </div>
    </>
  );
}