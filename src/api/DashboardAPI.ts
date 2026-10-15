import { isAxiosError } from 'axios';
import api from '../lib/axios';
import { RecorridosEnRuta, recorridosEnRutaSchema, sinFotografiasSchema, unidadesCriticasSchema, type ChecklistSinFotos } from '../types/dashboard';
import { historialOperadorResponseSchema, historialUnidadResponseSchema } from '../views/admin/historial/types';
import { KpisAuditoria, kpisAuditoriaSchema } from '../types/dashboard';
import { inspeccionKpisSchema, type InspeccionKpis } from '../types/inspeccion';

export async function getKpisResumen(): Promise<KpisAuditoria> {
    try {
        const { data } = await api.get('/dashboard/kpis');
        const result = kpisAuditoriaSchema.safeParse(data);
        if (!result.success) {
            console.error('Zod error getKpisResumen:', JSON.stringify(result.error.format(), null, 2));
            throw new Error('Respuesta del servidor inválida');
        }
        return result.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Error al obtener los KPIs');
    }
}

export const getUnidadesCriticas = async ({ page = 1, limit = 10 } = {}) => {
    try {
        const { data } = await api.get('/dashboard/kpis/criticas', {
            params: { page, limit }
        })
        const result = unidadesCriticasSchema.safeParse(data);
        if (!result.success) {
            console.error('Zod error getUnidadesCriticas:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }
        return result.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener unidades críticas')
    }
}

export async function getSinFotografias(): Promise<ChecklistSinFotos[]> {
    try {
        const { data } = await api.get('/dashboard/kpis/sin-fotografias')
        const result = sinFotografiasSchema.safeParse(data)
        if (!result.success) {
            console.error('Zod error getSinFotografias:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }
        return result.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener checklists sin fotografías')
    }
}

export async function getKpisInspecciones(): Promise<InspeccionKpis> {
    try {
        const { data } = await api.get('/dashboard/kpis/inspecciones')
        const result = inspeccionKpisSchema.safeParse(data)
        if (!result.success) {
            console.error('Zod error getKpisInspecciones:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }
        return result.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener KPIs de inspecciones')
    }
}

export async function getAsignacionesEnRuta(): Promise<RecorridosEnRuta> {
    try {
        const { data } = await api.get('/dashboard/kpis/en-ruta')
        const result = recorridosEnRutaSchema.safeParse(data)
        if (!result.success) {
            console.error('Zod error getAsignacionesEnRuta:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }
        return result.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener asignaciones en ruta')
    }
}

/** Historial unidades y operadores */

export async function getHistorialUnidad(unidadId: number) {
    try {
        const { data } = await api.get(`/dashboard/unidades/${unidadId}/historial`)
        const result = historialUnidadResponseSchema.safeParse(data)
        if (result.success) return result.data
        console.error('Zod error en getHistorialUnidad:', result.error.format())
        throw new Error('Error de validación en historial de unidad')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

export async function getHistorialOperador(operadorId: number) {
    try {
        const { data } = await api.get(`/dashboard/operadores/${operadorId}/historial`)
        const result = historialOperadorResponseSchema.safeParse(data)
        if (result.success) return result.data
        console.error('Zod error en getHistorialOperador:', result.error.format())
        throw new Error('Error de validación en historial de operador')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}
