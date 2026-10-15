import api from "../lib/axios";
import { isAxiosError } from "axios";
import { getErrorMessage } from "../utils/apiHerpers";
import { RecorridoDetalle, recorridoDetalleSchema } from "../types/recorrido";

export interface IniciarRecorridoParams {
    asignacionId: number;
    saleAViaje: boolean;
    caja_externa?: boolean;
    cajaId?: number | null;
}

export interface IniciarRecorridoResponse {
    message: string;
    recorridoId: number;
    checklistId: number;
    saleAViaje: boolean;
}

export async function iniciarRecorrido({ asignacionId, ...body }: IniciarRecorridoParams) {
    try {
        const { data } = await api.post<IniciarRecorridoResponse>(
            `/assignments/${asignacionId}/recorridos`,
            body
        );
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al iniciar el recorrido");
        }
        throw new Error(getErrorMessage(error, "No se pudo iniciar el recorrido"));
    }
}

export async function getRecorridoById(asignacionId: number, recorridoId: number): Promise<RecorridoDetalle> {
    try {
        const { data } = await api.get(`/assignments/${asignacionId}/recorridos/${recorridoId}`);
        const result = recorridoDetalleSchema.safeParse(data);
        if (!result.success) {
            console.error("Zod error en getRecorridoById:", JSON.stringify(result.error.format(), null, 2));
            throw new Error("Datos del recorrido inválidos");
        }
        return result.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Error al obtener el recorrido");
        }
        throw new Error("Error al obtener el recorrido");
    }
}

export async function deleteRecorrido({ asignacionId, recorridoId }: { asignacionId: number; recorridoId: number }) {
    try {
        const { data } = await api.delete<string>(`/assignments/${asignacionId}/recorridos/${recorridoId}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || 'Error al eliminar el recorrido');
        }
        throw new Error('Hubo un error en la petición');
    }
}