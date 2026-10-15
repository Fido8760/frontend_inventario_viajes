import { z } from 'zod';
import { marcaSchema } from './marca';

// 👈 Agregar este enum:
export const MotivoCambioCajaEnum = z.enum([
    'FALLA_MECANICA',
    'FILTRACION',
    'TRASPASO_PATIO',
    'OTRO'
]);
export type MotivoCambioCaja = z.infer<typeof MotivoCambioCajaEnum>;

export const cajaSchema = z.object({
    id: z.number(),
    numero_caja: z.string(),
    c_placas: z.string(),
    c_marca: z.string().nullable().optional(),
    activo: z.boolean().optional(),
    marca: marcaSchema.nullable().optional()
});

export const cajasListSchema = z.array(cajaSchema);

export type Caja = z.infer<typeof cajaSchema>;
export type CajasList = z.infer<typeof cajasListSchema>;