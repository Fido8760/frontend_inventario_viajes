import { isAxiosError } from 'axios'
import api from '../lib/axios' // ajusta el path a tu instancia de axios
import { kpisResumenSchema, unidadesCriticasSchema, sinFotografiasSchema, type KpisResumen, type UnidadCritica, type ChecklistSinFotos, } from '../types';

export async function getKpisResumen(): Promise<KpisResumen> {
    try {
        const { data } = await api.get('/dashboard/kpis')
        const result = kpisResumenSchema.safeParse(data)
        if (!result.success) {
            console.error('Zod error getKpisResumen:', result.error)
            throw new Error('Respuesta del servidor inválida')
        }
        return result.data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener los KPIs')
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