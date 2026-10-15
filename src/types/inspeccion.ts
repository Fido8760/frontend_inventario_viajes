import { z } from 'zod';
import { Rol } from './roles';

export const inspeccionStatusSchema = z.enum([
    'EN_PROGRESO',
    'FOTOS_PENDIENTES',
    'COMPLETA'
]);
export type InspeccionStatus = z.infer<typeof inspeccionStatusSchema>;

export const tipoInspeccionSchema = z.enum(['UNIDAD', 'REMOLQUE']);
export type TipoInspeccion = z.infer<typeof tipoInspeccionSchema>;

const inspeccionListItemSchema = z.object({
    id: z.number(),
    tipo: tipoInspeccionSchema,
    status: inspeccionStatusSchema,
    userId: z.number(),
    unidadId: z.number().nullable(),
    cajaId: z.number().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    unidad: z.object({
        id: z.number(),
        no_unidad: z.string(),
        tipo_unidad: z.string(),
        u_placas: z.string(),
    }).nullable(),
    caja: z.object({
        id: z.number(),
        numero_caja: z.string(),
        c_placas: z.string(),
        c_marca: z.string(),
    }).nullable(),
    usuario: z.object({
        id: z.number(),
        name: z.string(),
        lastname: z.string(),
    }).nullable(),
    imagenes: z.array(z.object({
        id: z.number(),
        fieldId: z.string(),
    }))
});

export const inspeccionPaginationSchema = z.object({
    count: z.number(),
    rows: z.array(inspeccionListItemSchema)
});
export type InspeccionListItem = z.infer<typeof inspeccionListItemSchema>;
export type InspeccionPaginationType = z.infer<typeof inspeccionPaginationSchema>;

const imagenInspeccionSchema = z.object({
    id: z.number(),
    inspeccionId: z.number(),
    urlImagen: z.string().url(),
    publicId: z.string().nullable(),
    fieldId: z.string(),
});

const respuestaInspeccionSchema = z.object({
    id: z.number(),
    inspeccionId: z.number(),
    preguntaId: z.number(),
    valor: z.string().nullable(),
    pregunta: z.object({
        id: z.number(),
        seccion: z.string(),
        texto: z.string(),
        tipo: z.enum(['numero', 'si_no', 'opciones', 'texto']),
        aplica_a: z.enum(['todos', 'tractocamion']),
        obligatorio: z.boolean(),
        orden: z.number(),
    }).optional()
});

export const inspeccionByIdSchema = z.object({
    id: z.number(),
    tipo: tipoInspeccionSchema,
    status: inspeccionStatusSchema,
    userId: z.number(),
    unidadId: z.number().nullable(),
    cajaId: z.number().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    unidad: z.object({
        id: z.number(),
        no_unidad: z.string(),
        tipo_unidad: z.string(),
        u_placas: z.string(),
    }).nullable(),
    caja: z.object({
        id: z.number(),
        numero_caja: z.string(),
        c_placas: z.string(),
        c_marca: z.string(),
        c_anio: z.number(),
    }).nullable(),
    usuario: z.object({
        id: z.number(),
        name: z.string(),
        lastname: z.string(),
        rol: z.nativeEnum(Rol),
    }).nullable(),
    imagenes: z.array(imagenInspeccionSchema),
    respuestas: z.array(respuestaInspeccionSchema),
});
export type InspeccionById = z.infer<typeof inspeccionByIdSchema>;
export type ImagenInspeccion = z.infer<typeof imagenInspeccionSchema>;
export type RespuestaInspeccion = z.infer<typeof respuestaInspeccionSchema>;

const preguntaTemplateSchema = z.object({
    id: z.number(),
    seccion: z.string(),
    texto: z.string(),
    tipo: z.enum(['si_no', 'opciones', 'numero', 'texto']),
    obligatorio: z.boolean(),
    aplica_a: z.enum(['todos', 'tractocamion']),
    orden: z.number(),
});

export const templateInspeccionSchema = z.object({
    secciones: z.record(z.array(preguntaTemplateSchema))
});
export type TemplateInspeccion = z.infer<typeof templateInspeccionSchema>;
export type PreguntaTemplate = z.infer<typeof preguntaTemplateSchema>;

export const inspeccionFormSchema = z.object({
    tipo: tipoInspeccionSchema,
    unidadId: z.coerce.number().int().nullable().optional(),
    cajaId: z.coerce.number().int().nullable().optional(),
}).refine(data => {
    if (data.tipo === 'UNIDAD') return !!data.unidadId && data.unidadId > 0;
    if (data.tipo === 'REMOLQUE') return !!data.cajaId && data.cajaId > 0;
    return true;
}, {
    message: 'Debes seleccionar una unidad o caja según el tipo de inspección'
});
export type InspeccionFormData = z.infer<typeof inspeccionFormSchema>;

const cajasKpiSchema = z.object({
    total: z.number(),
    conInspeccion: z.number(),
    sinInspeccion: z.number(),
    porcentaje: z.number(),
});

const inspeccionPorTipoSchema = z.object({
    tipo: tipoInspeccionSchema,
    total: z.number(),
    completas: z.number(),
});

export const inspeccionKpisSchema = z.object({
    total: z.number(),
    enProgreso: z.number(),
    fotosPendientes: z.number(),
    completas: z.number(),
    porTipo: z.array(inspeccionPorTipoSchema),
    cajas: cajasKpiSchema.optional(),
});

export type CajasKpi = z.infer<typeof cajasKpiSchema>;
export type InspeccionKpis = z.infer<typeof inspeccionKpisSchema>;
export type InspeccionPorTipo = z.infer<typeof inspeccionPorTipoSchema>;
