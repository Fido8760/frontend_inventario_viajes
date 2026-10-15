import { z } from 'zod';
import { Rol } from './roles';

export const usuarioResumenSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    lastname: z.string(),
    email: z.string().optional(),
    rol: z.nativeEnum(Rol)
});

export type UsuarioResumen = z.infer<typeof usuarioResumenSchema>;