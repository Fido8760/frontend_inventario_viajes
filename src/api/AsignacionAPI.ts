import api from "../lib/axios";
import { asignacionByIdApiResponseSchema, AsignacionFormData, asignacionPaginationApiSchema, EstadisticasChecklistResponse, estadisticasChecklistResponseSchema } from "../types/asignacion";
import { unidadesListSchema } from "../types/unidad";     
import { cajasListSchema } from "../types/caja";           
import { operadoresListSchema } from "../types/operador";   
import { getErrorMessage } from "../utils/apiHerpers";

type DisponiblesOpts = { disponibles?: boolean; excluirAsignacion?: number };

function normalizarOpts(arg: boolean | DisponiblesOpts): DisponiblesOpts {
    return typeof arg === 'boolean' ? { disponibles: arg } : arg;
}

function buildParams({ disponibles, excluirAsignacion }: DisponiblesOpts) {
    return {
        ...(disponibles && { disponibles: true }),
        ...(disponibles && excluirAsignacion && { excluirAsignacion })
    };
}

export async function getUnidades(arg: boolean | DisponiblesOpts = false) {
    try {
        const { data } = await api('/assignments/unidades', {
            params: buildParams(normalizarOpts(arg))
        });
        const response = unidadesListSchema.safeParse(data);
        if (response.success) return response.data;
        console.error("Zod error en getUnidades:", response.error.format());
        throw new Error("Datos de unidades inválidos");
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudieron obtener unidades`));
    }
}

export async function getCajas(disponibles = false) {
    try {
        const url = disponibles ? '/assignments/cajas?disponibles=true' : '/assignments/cajas';
        const { data } = await api(url);
        const response = cajasListSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        console.error("Zod error en getCajas:", response.error.format());
        throw new Error("Datos de cajas inválidos");
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudieron obtener cajas`));
    }
}

export async function getOperadores(disponibles = false) {
    try {
        const url = disponibles ? '/assignments/operadores?disponibles=true' : '/assignments/operadores';
        const { data } = await api(url);
        const response = operadoresListSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        console.error("Zod error en getOperadores:", response.error.format());
        throw new Error("Datos de operadores inválidos");
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudieron obtener operadores`));
    }
}

export async function getAsignaciones() {
    try {
        const url = `/assignments`;
        const { data } = await api(url);
        const response = asignacionPaginationApiSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        console.error('Zod validation error en getAsignaciones:', JSON.stringify(response.error.format(), null, 2));
        throw new Error('Error de validación en asignaciones');
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudieron obtener asignaciones`));
    }
}

export async function getAsignacionesSearch(search: string) {
    try {
        const url = `/assignments?search=${encodeURIComponent(search)}`;
        const { data } = await api(url);
        const response = asignacionPaginationApiSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        throw new Error('Error de validación en búsqueda de asignaciones');
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudieron obtener asignaciones`));
    }
}

type CrearAsignacionResponse = {
    message: string;
    id: number;
};
  
export async function crearAsignacion(formData: AsignacionFormData) {
    try {
        const { data } = await api.post<CrearAsignacionResponse>('/assignments', formData);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudo crear la asignación`));
    }
}

export async function getAsignacionById(id: number | string) {
    try {
        const { data } = await api(`/assignments/${id}`);
        const result = asignacionByIdApiResponseSchema.safeParse(data);
        if (result.success) {
            return result.data;
        }

        console.error('Zod error en getAsignacionById:', JSON.stringify(result.error.format(), null, 2));
        throw new Error('Error de validación en asignaciones');
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudo obtener la asignación`));
    }
}

type AsignacionAPIType = {
    formData: AsignacionFormData;
    asignacionId: number;
};

export async function updateAsignacion({ formData, asignacionId }: AsignacionAPIType) {
    try {
        const { data } = await api.put<{message:string}>(`/assignments/${asignacionId}`, formData);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudo actualizar la asignación`));
    }
}

export async function deleteAsignacion(id: number) { 
    try {
        const { data } = await api.delete<string>(`/assignments/${id}`);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error, `No se pudo eliminar la asignación`));
    }
}

// ── Cambio de Remolque con soporte de traspaso ────────────────────────

export interface ActualizarCajaParams {
    asignacionId: number;
    cajaId: number;
    motivo?: string;
    observaciones?: string;
    confirmarTraspaso?: boolean;
}

export async function actualizarCaja({ asignacionId, ...body }: ActualizarCajaParams) {
    try {
        const { data } = await api.patch<{ message: string }>(
            `/assignments/${asignacionId}/caja`, 
            body
        );
        return data;
    } catch (error: any) {
        if (error.response?.data?.requiereConfirmacion) {
            return error.response.data;
        }
        throw new Error(getErrorMessage(error, "No se pudo actualizar el remolque"));
    }
}

// ── Devolver Asignación ───────────────────────────────────────────────

export interface DevolverParams {
    asignacionId: number;
    motivoDevolucion: string;
    observacionesDevolucion?: string;
}

export async function devolverAsignacion({ asignacionId, ...body }: DevolverParams) {
    try {
        const { data } = await api.post<{ message: string }>(
            `/assignments/${asignacionId}/devolver`, 
            body
        );
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "No se pudo devolver la asignación"));
    }
}

export async function getEstadisticasChecklist(asignacionId: number): Promise<EstadisticasChecklistResponse | null> {
    try {
        const { data } = await api.get(`/assignments/${asignacionId}/estadisticas-checklist`);
        
        if (data.totalRespuestas === 0) return null;

        const result = estadisticasChecklistResponseSchema.safeParse(data);
        if (!result.success) {
            console.error("Zod error en getEstadisticasChecklist:", result.error);
            throw new Error("Datos de estadísticas inválidos");
        }
        return result.data;
    } catch (error) {
         throw new Error(getErrorMessage(error, "No se pudo devolver la asignación"));;
    }
}