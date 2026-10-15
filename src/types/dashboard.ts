import { z } from 'zod';
import { cajaSchema } from './caja';
import { operadorSchema } from './operador';
import { recorridoStatusSchema } from './recorrido';
import { unidadSchema } from './unidad';

// ── 1. Cobertura de Flota ─────────────────────────────────────────────
export const coberturaFlotaSchema = z.object({
    totalUnidades: z.number(),
    asignadas: z.number(),
    sinAsignar: z.number(),
    enRuta: z.number(),
    porcentajeAsignadas: z.number()
});
export type CoberturaFlota = z.infer<typeof coberturaFlotaSchema>;

// ── 2. Puntos Ciegos (Jamás revisados) ────────────────────────────────
export const unidadPuntoCiegoSchema = z.object({
    id: z.number(),
    no_unidad: z.string(),
    tipo_unidad: z.string(),
    u_placas: z.string(),
    totalRevisiones: z.number(),
    estaAsignada: z.boolean()
});
export type UnidadPuntoCiego = z.infer<typeof unidadPuntoCiegoSchema>;

export const cajaPuntoCiegoSchema = z.object({
    id: z.number(),
    numero_caja: z.string(),
    c_placas: z.string(),
    c_marca: z.string().nullable().optional()
});
export type CajaPuntoCiego = z.infer<typeof cajaPuntoCiegoSchema>;

export const puntosCiegosSchema = z.object({
    totalUnidadesSinChecklist: z.number(),
    unidadesSinChecklist: z.array(unidadPuntoCiegoSchema),
    totalCajasSinChecklist: z.number(),
    cajasSinChecklist: z.array(cajaPuntoCiegoSchema)
});
export type PuntosCiegos = z.infer<typeof puntosCiegosSchema>;

// ── 3. Checklists Atascados / Inconclusos ─────────────────────────────
export const viajeAtascadoSchema = z.object({
    id: z.number(),
    asignacionId: z.number(),
    checklistId: z.number().nullable(),
    status: z.string(),
    createdAt: z.string(),
    no_unidad: z.string(),
    operador: z.string(),
    capturista: z.string()
});
export type ViajeAtascado = z.infer<typeof viajeAtascadoSchema>;

export const checklistsAtascadosSchema = z.object({
    total: z.number(),
    viajes: z.array(viajeAtascadoSchema)
});
export type ChecklistsAtascados = z.infer<typeof checklistsAtascadosSchema>;

// ── 4. Ranking de Menor Atención ─────────────────────────────────────
export const rankingMenorAtencionItemSchema = z.object({
    id: z.number(),
    no_unidad: z.string(),
    tipo_unidad: z.string(),
    u_placas: z.string(),
    totalRevisiones: z.number(),
    revViajes: z.number(),
    revPatio: z.number(),
    estaAsignada: z.boolean()
});
export type RankingMenorAtencionItem = z.infer<typeof rankingMenorAtencionItemSchema>;

export const completitudItemSchema = z.object({
    tipo: z.string(),
    total: z.number(),
    completos: z.number(),
    porcentaje: z.number()
});
export type CompletitudPorTipo = z.infer<typeof completitudItemSchema>;

// ── Schema Completo de la Respuesta de /dashboard/kpis ────────────────
export const kpisAuditoriaSchema = z.object({
    coberturaFlota: coberturaFlotaSchema,
    puntosCiegos: puntosCiegosSchema,
    checklistsAtascados: checklistsAtascadosSchema,
    rankingMenorAtencion: z.array(rankingMenorAtencionItemSchema),
    completitudPorTipo: z.array(completitudItemSchema).optional().default([])
});
export type KpisAuditoria = z.infer<typeof kpisAuditoriaSchema>;

export const unidadCriticaSchema = z.object({
    id: z.number(),
    no_unidad: z.string(),
    tipo_unidad: z.string(),
    u_placas: z.string(),
    motivo: z.enum(['sin_checklist', 'mas_30_dias']),
    diasSinRevision: z.number().nullable(),
    ultimoChecklist: z.string().nullable(),
    origenUltimaRevision: z.enum(['asignacion', 'inspeccion']).nullable().optional(),
    estadoUltimaRevision: z.string().nullable().optional(),
});

export const unidadesCriticasSchema = z.object({
    data: z.array(unidadCriticaSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    })
});

export type UnidadCritica = z.infer<typeof unidadCriticaSchema>;
export type UnidadesCriticasResponse = z.infer<typeof unidadesCriticasSchema>;

export const checklistSinFotosSchema = z.object({
    checklistId: z.number(),
    recorridoId: z.number().optional(),
    asignacionId: z.number().optional(),
    fechaChecklist: z.string(),
    unidad: z.object({
        no_unidad: z.string().optional(),
        tipo_unidad: z.string().optional(),
        u_placas: z.string().optional(),
    }),
});

export const sinFotografiasSchema = z.array(checklistSinFotosSchema);
export type ChecklistSinFotos = z.infer<typeof checklistSinFotosSchema>;

export const recorridoEnRutaItemSchema = z.object({
    recorridoId: z.number(),
    asignacionId: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    diasEnRuta: z.number(),
    status: recorridoStatusSchema,
    unidad: unidadSchema,
    operador: operadorSchema.nullable(),
    caja: cajaSchema.nullable().optional(),
    checklist: z.object({
        id: z.number(),
        status: z.enum(['EN_PROGRESO', 'COMPLETO']),
        imagenes: z.array(z.object({
            id: z.number(),
            urlImagen: z.string().url(),
            publicId: z.string().nullable().optional(),
            checklistId: z.number(),
            fieldId: z.string()
        }))
    }).nullable().optional()
});

export const recorridosEnRutaSchema = z.object({
    total: z.number(),
    recorridos: z.array(recorridoEnRutaItemSchema)
});

export type RecorridoEnRutaItem = z.infer<typeof recorridoEnRutaItemSchema>;
export type RecorridosEnRuta = z.infer<typeof recorridosEnRutaSchema>;


