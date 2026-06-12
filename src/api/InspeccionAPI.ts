import { isAxiosError } from "axios";
import api from "../lib/axios";
import {
    inspeccionPaginationSchema,
    inspeccionByIdSchema,
    templateInspeccionSchema,
    inspeccionKpisSchema,
    InspeccionFormData,
    InspeccionById,
} from "../types";

// ── GET /inspecciones ─────────────────────────────────────────────────────────
export async function getInspecciones(take: number, skip: number, tipo?: string, search?: string) {
    try {
        const params = new URLSearchParams({ take: String(take), skip: String(skip) })
        if (tipo) params.append('tipo', tipo)
        if (search) params.append('search', search)

        const { data } = await api(`/inspecciones?${params}`)
        const result = inspeccionPaginationSchema.safeParse(data)
        if (result.success) return result.data

        console.error('Zod error en getInspecciones:', result.error.format())
        throw new Error('Error de validación en inspecciones')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── GET /inspecciones/:id ─────────────────────────────────────────────────────
export async function getInspeccionById(id: number) {
    try {
        const { data } = await api(`/inspecciones/${id}`)
        const result = inspeccionByIdSchema.safeParse(data)
        if (result.success) return result.data

        console.error('Zod error en getInspeccionById:', result.error.format())
        throw new Error('Error de validación en inspección')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── GET /inspecciones/:id/template ────────────────────────────────────────────
export async function getTemplateInspeccion(id: number) {
    try {
        const { data } = await api(`/inspecciones/${id}/template`)
        const result = templateInspeccionSchema.safeParse(data)
        if (result.success) return result.data

        console.error('Zod error en getTemplateInspeccion:', result.error.format())
        throw new Error('Error de validación en template')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── GET /inspecciones/kpis ────────────────────────────────────────────────────
export async function getInspeccionesKpis() {
    try {
        const { data } = await api('/inspecciones/kpis')
        const result = inspeccionKpisSchema.safeParse(data)
        if (result.success) return result.data

        console.error('Zod error en getInspeccionesKpis:', result.error.format())
        throw new Error('Error de validación en KPIs')
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── POST /inspecciones ────────────────────────────────────────────────────────
export async function crearInspeccion(formData: InspeccionFormData) {
    try {
        const { data } = await api.post<{ message: string; id: number }>('/inspecciones', formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            const responseData = error.response.data
            if (responseData?.errors?.[0]?.msg) throw new Error(responseData.errors[0].msg)
            throw new Error(responseData?.error || 'Error desconocido')
        }
        throw error
    }
}

// ── PUT /inspecciones/:id/respuestas ──────────────────────────────────────────

// InspeccionAPI.ts
export async function guardarRespuestasInspeccion(
    id: number, 
    respuestas: { preguntaId: number; valor: string | null }[]
) {
    try {
        const payload = respuestas.map(r => ({
            preguntaId: r.preguntaId,
            valor: r.valor ?? ''
        }))
        const { data } = await api.put<{ message: string }>(`/inspecciones/${id}/respuestas`, { respuestas: payload })
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}
// ── POST /inspecciones/:id/finalizar ──────────────────────────────────────────
export async function finalizarChecklistInspeccion(id: number) {
    try {
        const { data } = await api.post<{ message: string }>(`/inspecciones/${id}/finalizar`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── POST /inspecciones/:id/image ──────────────────────────────────────────────
type UploadImageArgs = { id: number; fieldId: string; file: File }

export async function uploadImageInspeccion({ id, fieldId, file }: UploadImageArgs) {
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fieldId', fieldId)

        const { data } = await api.post<{ message: string; imageUrl: string }>(
            `/inspecciones/${id}/image`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── POST /inspecciones/:id/finalizar-fotos ────────────────────────────────────
export async function finalizarFotosInspeccion(id: number) {
    try {
        const { data } = await api.post<{ message: string }>(`/inspecciones/${id}/finalizar-fotos`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}

// ── DELETE /inspecciones/:id ──────────────────────────────────────────────────
export async function deleteInspeccion(id: InspeccionById['id']) {
    try {
        const { data } = await api.delete<{ message: string }>(`/inspecciones/${id}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw error
    }
}