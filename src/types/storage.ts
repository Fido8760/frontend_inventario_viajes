import { z } from 'zod';

export const checklistStorageSchema = z.object({
    checklistId: z.number(),
    fecha: z.string(),
    unidad: z.string(),
    placas: z.string(),
    tipo: z.string(),
    totalFotos: z.number(),
    tieneFotos: z.boolean()
});

export const checklistsStorageResponseSchema = z.object({
    data: z.array(checklistStorageSchema),
    total: z.number()
});

export type ChecklistStorage = z.infer<typeof checklistStorageSchema>;
export type ChecklistsStorageResponse = z.infer<typeof checklistsStorageResponseSchema>;
