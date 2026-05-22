import { isAxiosError } from "axios";
import api from "../lib/axios";
import { ChecklistDetalle, checklistDetalleSchema } from "../types";

// ── Tipos del nuevo modelo ────────────────────────────────────────────────────

export type RespuestaItem = {
    preguntaId: number;
    valor: string;
};

export type GuardarRespuestasArgs = {
    asignacionId: number;
    checklistId: number;
    respuestas: RespuestaItem[];
};

export type PostChecklistArgs = {
    asignacionId: number;
};

type PostChecklistSuccessData = {
    message: string;
    id: number;
};

// ── Funciones API ─────────────────────────────────────────────────────────────

/** Crea el checklist vacío — no recibe body */
export async function postChecklist({ asignacionId }: PostChecklistArgs): Promise<PostChecklistSuccessData> {
    const url = `/assignments/${asignacionId}/checklist`;
    try {
        const { data } = await api.post<PostChecklistSuccessData>(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error desconocido al crear el checklist");
    }
}

/** Trae preguntas + respuestas ya guardadas del checklist */
export async function getChecklist(asignacionId: number, checklistId: number): Promise<ChecklistDetalle> {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}`;
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
            throw new Error(error.response.data.error);
        }
        throw new Error("Error al obtener el checklist");
    }
}

/** Guarda respuestas parciales (upsert) — se llama por sección */
export async function guardarRespuestas({ asignacionId, checklistId, respuestas }: GuardarRespuestasArgs) {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}`;
    try {
        const { data } = await api.put(url, { respuestas });
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error al guardar las respuestas");
    }
}

/** Finaliza el checklist — valida obligatorias */
export async function finalizarChecklist({ asignacionId, checklistId }: { asignacionId: number; checklistId: number }) {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}/finalizar`;
    try {
        const { data } = await api.post(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error al finalizar el checklist");
    }
}

/** Finaliza las fotos — valida fotos obligatorias y cierra asignación */
export async function finalizarFotos({ asignacionId, checklistId }: { asignacionId: number; checklistId: number }) {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}/finalizar-fotos`;
    try {
        const { data } = await api.post(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error al finalizar las fotos");
    }
}

// ── Imágenes (sin cambios) ────────────────────────────────────────────────────

export type ChecklistImageAPI = {
    file: File;
    asignacionId: number;
    checklistId: number;
    fieldId: string;
};

export async function uploadImage({ file, asignacionId, checklistId, fieldId }: ChecklistImageAPI) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldId', fieldId);
    const url = `/assignments/${asignacionId}/checklist/${checklistId}/image`;
    try {
        const { data } = await api.post(url, formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error desconocido al subir la imagen");
    }
}

// ── Eliminar (sin cambios) ────────────────────────────────────────────────────

export async function deleteChecklist({ asignacionId, checklistId }: { asignacionId: number; checklistId: number }) {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}`;
    try {
        const { data } = await api.delete(url);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Error al eliminar el checklist");
    }
}