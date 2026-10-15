import { isAxiosError } from "axios";
import api from "../lib/axios";
import { ChecklistDetalle, checklistDetalleSchema } from "../types/checklist";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type RespuestaItem = {
    preguntaId: number;
    valor: string;
};

export type GuardarRespuestasArgs = {
    asignacionId: number;
    recorridoId: number;
    checklistId: number;
    respuestas: RespuestaItem[];
};

export type CheckpointArgs = {
    asignacionId: number;
    recorridoId: number;
    checklistId: number;
};

// ── Funciones API ─────────────────────────────────────────────────────────────

/** Trae preguntas + respuestas ya guardadas del checklist de este viaje */
export async function getChecklist(asignacionId: number, recorridoId: number, checklistId: number): Promise<ChecklistDetalle> {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}`;
    try {
        const { data } = await api.get(url);
        const result = checklistDetalleSchema.safeParse(data);
        if (!result.success) {
            console.error("Zod error getChecklist:", result.error);
            throw new Error("Respuesta del servidor inválida");
        }
        return result.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al obtener el checklist");
        }
        throw new Error("Error al obtener el checklist");
    }
}

/** Guarda respuestas parciales (upsert) — se llama por sección */
export async function guardarRespuestas({ asignacionId, recorridoId, checklistId, respuestas }: GuardarRespuestasArgs) {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}`;
    try {
        const { data } = await api.put(url, { respuestas });
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al guardar las respuestas");
        }
        throw new Error("Error al guardar las respuestas");
    }
}

/** Finaliza las preguntas del checklist — valida obligatorias y pasa a FOTOS_PENDIENTES */
export async function finalizarChecklist({ asignacionId, recorridoId, checklistId }: CheckpointArgs) {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}/finalizar`;
    try {
        const { data } = await api.post(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al finalizar el checklist");
        }
        throw new Error("Error al finalizar el checklist");
    }
}

/** Finaliza las fotos iniciales — valida fotos obligatorias y pasa a EN_RUTA (o COMPLETA si no salía a viaje) */
export async function finalizarFotos({ asignacionId, recorridoId, checklistId }: CheckpointArgs) {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}/finalizar-fotos`;
    try {
        const { data } = await api.post(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al finalizar las fotos");
        }
        throw new Error("Error al finalizar las fotos");
    }
}

export interface RegistrarEntradaArgs extends CheckpointArgs {
    observaciones?: string;
    cierreSinFotos?: boolean; 
    motivoOmision?: string;  
}

// 2. Actualizar la función registrarEntrada:
export async function registrarEntrada({ 
    asignacionId, 
    recorridoId, 
    checklistId, 
    ...body 
}: RegistrarEntradaArgs) {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}/registrar-entrada`;
    try {
        const { data } = await api.post(url, body);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al registrar la entrada");
        }
        throw new Error("Error al registrar la entrada de la unidad");
    }
}

// ── Imágenes ──────────────────────────────────────────────────────────────────

export type ChecklistImageAPI = {
    file: File;
    asignacionId: number;
    recorridoId: number;
    checklistId: number;
    fieldId: string;
};

export async function uploadImage({ file, asignacionId, recorridoId, checklistId, fieldId }: ChecklistImageAPI) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldId', fieldId);
    
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}/image`;
    try {
        const { data } = await api.post(url, formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al subir la imagen");
        }
        throw new Error("Error desconocido al subir la imagen");
    }
}

// ── Eliminar Checklist ────────────────────────────────────────────────────────

export async function deleteChecklist({ asignacionId, recorridoId, checklistId }: CheckpointArgs) {
    const url = `/assignments/${asignacionId}/recorridos/${recorridoId}/checklist/${checklistId}`;
    try {
        const { data } = await api.delete<{ message: string }>(url);
        return data.message;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al eliminar el checklist");
        }
        throw new Error("Error al eliminar el checklist");
    }
}
