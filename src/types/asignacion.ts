import { z } from 'zod';
import { Rol } from './roles';
import { unidadSchema } from './unidad';
import { cajaSchema } from './caja';
import { operadorSchema } from './operador';
import { recorridoEnAsignacionSchema, recorridoStatusSchema } from './recorrido';

export const MotivoDevolucionEnum = z.enum([
    'RENUNCIA',
    'DESPIDO',
    'CAMBIO_UNIDAD',
    'OTRO'
]);
export type MotivoDevolucion = z.infer<typeof MotivoDevolucionEnum>;

export const usuarioResumenSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    rol: z.nativeEnum(Rol)
});

export const recorridoActivoResumenSchema = z.object({
    id: z.number(),
    status: recorridoStatusSchema,
    saleAViaje: z.boolean(),
    createdAt: z.string()
}).nullable().optional();

export const asignacionItemSchema = z.object({
    id: z.number(),
    unidadId: z.number(),
    operadorId: z.number(),
    cajaId: z.number().nullable(),
    fechaEntrega: z.string(),
    fechaDevolucion: z.string().nullable(),
    motivoDevolucion: MotivoDevolucionEnum.nullable().optional(),
    observacionesDevolucion: z.string().nullable().optional(),
    userId: z.number().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    usuario: usuarioResumenSchema.optional(),
    unidad: unidadSchema,
    caja: cajaSchema.nullable().optional(),
    operador: operadorSchema,
    recorridoActivo: recorridoActivoResumenSchema,
    enRuta: z.boolean().optional().default(false),
    alertaBaja: z.boolean().optional().default(false),
    detalleBajas: z.object({
        unidadInactiva: z.boolean(),
        operadorInactivo: z.boolean(),
        cajaInactiva: z.boolean()
    }).optional()
});

export type AsignacionItem = z.infer<typeof asignacionItemSchema>;

export const asignacionPaginationApiSchema = z.object({
    total: z.number(),
    asignaciones: z.array(asignacionItemSchema)
});
export type AsignacionPaginationApiType = z.infer<typeof asignacionPaginationApiSchema>;

export const kpisAsignacionSchema = z.object({
    totalRecorridos: z.number(),
    diasDesdeEntrega: z.number(),
    recorridoActualId: z.number().nullable()
});

export const itemHistorialCajaSchema = z.object({
    id: z.number(),
    asignacionId: z.number(),
    cajaAnteriorId: z.number().nullable().optional(),
    cajaNuevaId: z.number().nullable().optional(),
    motivo: z.string(),
    observaciones: z.string().nullable().optional(),
    createdAt: z.string(),
    cajaAnterior: z.object({
        id: z.number(),
        numero_caja: z.string(),
        c_placas: z.string()
    }).nullable().optional(),
    cajaNueva: z.object({
        id: z.number(),
        numero_caja: z.string(),
        c_placas: z.string()
    }).nullable().optional(),
    registradoPor: z.object({
        name: z.string(),
        lastname: z.string()
    }).nullable().optional()
});

export type ItemHistorialCaja = z.infer<typeof itemHistorialCajaSchema>;

export const asignacionByIdApiResponseSchema = z.object({
    asignacion: asignacionItemSchema,
    kpis: kpisAsignacionSchema,
    alertaBaja: z.boolean().optional(),
    detalleBajas: z.object({
        unidadInactiva: z.boolean(),
        operadorInactivo: z.boolean(),
        cajaInactiva: z.boolean()
    }).optional(),
    recorridos: z.array(recorridoEnAsignacionSchema),
    historialCajas: z.array(itemHistorialCajaSchema).optional().default([])
});
export type AsignacionByIdApiResponse = z.infer<typeof asignacionByIdApiResponseSchema>;

export const asignacionFormSchema = z.object({
    unidadId: z.coerce.number().int().gt(0, "Seleccione una unidad"),
    operadorId: z.coerce.number().int().gt(0, "Seleccione un operador"),
    cajaId: z.coerce.number().int().optional().nullable()
});
export type AsignacionFormData = z.infer<typeof asignacionFormSchema>;

export const devolverAsignacionSchema = z.object({
    motivoDevolucion: MotivoDevolucionEnum,
    observacionesDevolucion: z.string().optional()
});
export type DevolverAsignacionFormData = z.infer<typeof devolverAsignacionSchema>;

export const focoRojoSchema = z.object({
    preguntaId: z.number(),
    seccion: z.string(),
    pregunta: z.string(),
    conteo: z.number(),
    tipo: z.string()
});

export const seccionEstadisticaSchema = z.object({
    seccion: z.string(),
    bueno: z.number(),
    regular: z.number(),
    malo: z.number(),
    si: z.number(),
    no: z.number()
});

export const estadisticasChecklistResponseSchema = z.object({
    indiceSalud: z.number(),
    opciones: z.object({
        total: z.number(),
        bueno: z.number(),
        regular: z.number(),
        malo: z.number(),
        porcentajes: z.object({
            bueno: z.number(),
            regular: z.number(),
            malo: z.number()
        })
    }),
    cumplimientoSiNo: z.object({
        total: z.number(),
        cumple: z.number(),
        falla: z.number(),
        porcentajeCumplimiento: z.number()
    }),
    focosRojos: z.array(focoRojoSchema),
    desglosePorSeccion: z.array(seccionEstadisticaSchema)
});

export type EstadisticasChecklistResponse = z.infer<typeof estadisticasChecklistResponseSchema>;

