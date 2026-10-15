import { z } from 'zod';

export const operadorSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    apellido_p: z.string(),
    apellido_m: z.string().nullable().optional(),
    activo: z.boolean().optional(),
    vigencia_lic: z.string().optional(),
    vigencia_apto: z.string().optional(),
    curp: z.string().optional(),
    rfc: z.string().optional()
});

export const operadoresListSchema = z.array(operadorSchema);

export type Operador = z.infer<typeof operadorSchema>;
export type OperadoresList = z.infer<typeof operadoresListSchema>;