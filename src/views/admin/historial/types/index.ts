import { z } from "zod"
import { asignacionStatusSchema, cajaSchemaBase, operadorSchemaBase, unidadSchemaBase } from "../../../../types"

const historialImagenSchema = z.object({
    id: z.number(),
    fieldId: z.string(),
    urlImagen: z.string()
})

const historialChecklistSchema = z.object({
    id: z.number(),
    status: z.enum(['EN_PROGRESO', 'COMPLETO']),
    imagenes: z.array(historialImagenSchema).optional()
}).nullable()

export const historialUnidadItemSchema = z.object({
    id: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    status: asignacionStatusSchema,
    entregaInicial: z.boolean(),
    observaciones_entrada: z.string().nullable(),
    operador: operadorSchemaBase.nullable(),
    caja: cajaSchemaBase.nullable(),
    checklist: historialChecklistSchema
})
export type HistorialUnidadItem = z.infer<typeof historialUnidadItemSchema>

export const historialUnidadResponseSchema = z.object({
    total: z.number(),
    asignaciones: z.array(historialUnidadItemSchema)
})

export const historialOperadorItemSchema = z.object({
    id: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    status: asignacionStatusSchema,
    entregaInicial: z.boolean(),
    observaciones_entrada: z.string().nullable(),
    unidad: unidadSchemaBase,
    caja: cajaSchemaBase.nullable(),
    checklist: historialChecklistSchema
})
export type HistorialOperadorItem = z.infer<typeof historialOperadorItemSchema>

export const historialOperadorResponseSchema = z.object({
    total: z.number(),
    asignaciones: z.array(historialOperadorItemSchema)
})