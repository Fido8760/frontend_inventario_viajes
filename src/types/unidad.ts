import { z } from 'zod';
import { marcaSchema } from './marca';

export const tipoUnidadSchema = z.enum([
    'TRACTOCAMION',
    'MUDANCERO',
    'CAMIONETA'
]);
export type TipoUnidad = z.infer<typeof tipoUnidadSchema>;

export const unidadSchema = z.object({
    id: z.number(),
    no_unidad: z.string(),
    u_placas: z.string(),
    tipo_unidad: tipoUnidadSchema,
    activo: z.boolean().optional(),
    marca: marcaSchema.nullable().optional()
});

export const unidadesListSchema = z.array(unidadSchema);

export type Unidad = z.infer<typeof unidadSchema>;
export type UnidadesList = z.infer<typeof unidadesListSchema>;