import { isAxiosError } from "axios";
import api from "../lib/axios";
import { asignacionesEnRutaSchema } from "../types";

export async function getAsignacionesEnRuta() {
    try {
        const { data } = await api.get('/assignments/en-ruta');
        const result = asignacionesEnRutaSchema.safeParse(data);
        if (result.success) return result.data.asignaciones;
        console.error('Zod error en getAsignacionesEnRuta:', result.error.format())
        throw new Error('Error de validación en asignaciones en ruta')
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
}

type UploadEntradaImageParams = {
    file: File
    asignacionId: number
    checklistId: number
    fieldId: string
}
 
export async function uploadEntradaImage({ file, asignacionId, checklistId, fieldId }: UploadEntradaImageParams) {
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fieldId', fieldId)
 
        const { data } = await api.post(
            `/assignments/${asignacionId}/checklist/${checklistId}/image`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data as { message: string; imageUrl: string }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}
 
type RegistrarEntradaParams = {
    asignacionId: number
    checklistId: number
    observaciones?: string
}
 
export async function registrarEntrada({ asignacionId, checklistId, observaciones }: RegistrarEntradaParams) {
    try {
        const { data } = await api.post(
            `/assignments/${asignacionId}/checklist/${checklistId}/registrar-entrada`,
            { observaciones: observaciones || null }
        )
        return data as { message: string }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}