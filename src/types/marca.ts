import { z } from 'zod';

export const marcaSchema = z.object({
    id: z.number(),
    nombre: z.string()
});

export type Marca = z.infer<typeof marcaSchema>;