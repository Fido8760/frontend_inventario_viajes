import { z } from 'zod';
import { unidadSchema } from './unidad';
import { cajaSchema } from './caja';
import { operadorSchema } from './operador';
import { usuarioResumenSchema } from './usuario';

// ── Status del Recorrido ──────────────────────────────────────────────
export const recorridoStatusSchema = z.enum([
    'CREADA',
    'CHECKLIST_PENDIENTE',
    'FOTOS_PENDIENTES',
    'EN_RUTA',
    'COMPLETA'
]);
export type RecorridoStatus = z.infer<typeof recorridoStatusSchema>;

// ── Schemas de Checklist (Imágenes y Respuestas) ──────────────────────
export const imagenChecklistSchema = z.object({
    id: z.number(),
    urlImagen: z.string().url(),
    publicId: z.string().nullable().optional(),
    checklistId: z.number(),
    fieldId: z.string()
});
export type ImagenChecklist = z.infer<typeof imagenChecklistSchema>;

export const preguntaChecklistSchema = z.object({
    id: z.number(),
    seccion: z.string(),
    texto: z.string(),
    tipo: z.enum(['numero', 'si_no', 'opciones', 'texto']),
    aplica_a: z.enum(['todos', 'tractocamion']),
    obligatorio: z.boolean(),
    orden: z.number()
});
export type PreguntaChecklist = z.infer<typeof preguntaChecklistSchema>;

export const respuestaItemSchema = z.object({
    id: z.number(),
    checklistId: z.number(),
    preguntaId: z.number(),
    valor: z.string().nullable(),
    pregunta: preguntaChecklistSchema.optional()
});
export type RespuestaItem = z.infer<typeof respuestaItemSchema>;

export const checklistEnRecorridoSchema = z.object({
    id: z.number(),
    recorridoId: z.number(),
    status: z.enum(['EN_PROGRESO', 'COMPLETO']),
    checklistJson: z.any().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    imagenes: z.array(imagenChecklistSchema),
    respuestas: z.array(respuestaItemSchema)
});
export type ChecklistEnRecorrido = z.infer<typeof checklistEnRecorridoSchema>;

// ── Schema Base del Recorrido ─────────────────────────────────────────
export const recorridoBaseSchema = z.object({
    id: z.number(),
    asignacionId: z.number(),
    unidadId: z.number().nullable().optional(),
    cajaId: z.number().nullable().optional(),
    caja_externa: z.boolean().default(false),
    status: recorridoStatusSchema,
    observaciones_entrada: z.string().nullable().optional(),
    saleAViaje: z.boolean().default(true),
    operadorId: z.number().nullable().optional(),
    userId: z.number().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string()
});
export type RecorridoBase = z.infer<typeof recorridoBaseSchema>;

// ── Detalle Completo del Recorrido (GET /recorridos/:recorridoId) ─────
export const recorridoDetalleSchema = recorridoBaseSchema.extend({
    // Asignación padre embebida
    asignacion: z.object({
        id: z.number(),
        unidadId: z.number(),
        operadorId: z.number(),
        cajaId: z.number().nullable().optional(),
        fechaEntrega: z.string(),
        fechaDevolucion: z.string().nullable().optional(),
        usuario: usuarioResumenSchema.optional(),
        unidad: unidadSchema,
        caja: cajaSchema.nullable().optional(),
        operador: operadorSchema
    }),
    // Checklist con respuestas y fotos embebido
    checklist: checklistEnRecorridoSchema
});

export type RecorridoDetalle = z.infer<typeof recorridoDetalleSchema>;

export const recorridoEnAsignacionSchema = z.object({
    id: z.number(),
    asignacionId: z.number(),
    status: recorridoStatusSchema,
    saleAViaje: z.boolean(),
    entregaInicial: z.boolean().optional().default(false),
    cajaId: z.number().nullable().optional(),
    caja_externa: z.boolean().optional().default(false),
    createdAt: z.string(),
    checklist: z.object({
        id: z.number(),
        status: z.enum(['EN_PROGRESO', 'COMPLETO']).optional(),
        imagenes: z.array(imagenChecklistSchema).optional()
    }).nullable().optional()
});

export type RecorridoEnAsignacion = z.infer<typeof recorridoEnAsignacionSchema>;