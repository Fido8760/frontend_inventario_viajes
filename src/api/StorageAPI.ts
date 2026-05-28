import { isAxiosError } from "axios";
import api from '../lib/axios'
import { checklistsStorageResponseSchema } from "../types";

export const getChecklistsParaLimpiar = async (antiguedad: number) => {
    try {
        const { data } = await api('/storage/checklists', { params: { antiguedad }});
        const result = checklistsStorageResponseSchema.safeParse(data);
        if(!result.success) {
            console.error('Zod error getChecklistsParaLimpiar:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }

        return result.data;
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }

        throw new Error('Error al obtener los checklists')
    }
}

export const limpiarFotosChecklist = async (checklistId: number) => {
    try {
        const { data } = await api.delete(`/storage/checklists/${checklistId}/fotos`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }

        throw new Error('Error al obtener los checklists')
    }
}