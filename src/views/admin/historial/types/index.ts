import { z } from "zod";
import { unidadSchema } from "../../../../types/unidad";
import { cajaSchema } from "../../../../types/caja";
import { operadorSchema } from "../../../../types/operador";

// ── Fotos del checklist ───────────────────────────────────────────────
const historialImagenSchema = z.object({
    id: z.number(),
    fieldId: z.string(),
    urlImagen: z.string()
});

// ── Checklist dentro de cada viaje ────────────────────────────────────
const historialChecklistSchema = z.object({
    id: z.number(),
    status: z.enum(['EN_PROGRESO', 'COMPLETO']).optional(),
    imagenes: z.array(historialImagenSchema).optional()
}).nullable().optional();

// ── Viajes (Recorridos) que se hicieron en esa asignación ─────────────
export const historialRecorridoSchema = z.object({
    id: z.number(),
    status: z.string(),
    saleAViaje: z.boolean().optional(),
    observaciones_entrada: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    checklist: historialChecklistSchema
});

// ── Asignación cuando buscas por UNIDAD ────────────────────────────────
export const historialUnidadItemSchema = z.object({
    id: z.number(),
    fechaEntrega: z.string().optional(),
    fechaDevolucion: z.string().nullable().optional(),
    motivoDevolucion: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    operador: operadorSchema.nullable().optional(),
    caja: cajaSchema.nullable().optional(),
    // 👈 Los viajes con sus checklists e imágenes
    recorridos: z.array(historialRecorridoSchema).optional().default([])
});
export type HistorialUnidadItem = z.infer<typeof historialUnidadItemSchema>;

export const historialUnidadResponseSchema = z.object({
    total: z.number(),
    asignaciones: z.array(historialUnidadItemSchema)
});
export type HistorialUnidadResponse = z.infer<typeof historialUnidadResponseSchema>;

// ── Asignación cuando buscas por OPERADOR ──────────────────────────────
export const historialOperadorItemSchema = z.object({
    id: z.number(),
    fechaEntrega: z.string().optional(),
    fechaDevolucion: z.string().nullable().optional(),
    motivoDevolucion: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    unidad: unidadSchema,
    caja: cajaSchema.nullable().optional(),
    // 👈 Los viajes con sus checklists e imágenes
    recorridos: z.array(historialRecorridoSchema).optional().default([])
});
export type HistorialOperadorItem = z.infer<typeof historialOperadorItemSchema>;

export const historialOperadorResponseSchema = z.object({
    total: z.number(),
    asignaciones: z.array(historialOperadorItemSchema)
});
export type HistorialOperadorResponse = z.infer<typeof historialOperadorResponseSchema>;