import { z } from 'zod';
import { Rol } from './roles';

export const authSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    rol: z.nativeEnum(Rol),
    token: z.string()
});

export type Auth = z.infer<typeof authSchema>;
export type UserLoginForm = Pick<Auth, 'email' | 'password'>;
export type UserRegistrationForm = Pick<Auth, 'name' | 'lastname' | 'email' | 'password' | 'password_confirmation' | 'rol'>;
export type ForgotPasswordForm = Pick<Auth, 'email'>;
export type NewPasswordForm = Pick<Auth, 'password' | 'password_confirmation'>;
export type ConfirmToken = Pick<Auth, 'token'>;
export type UserEditForm = Pick<UserRegistrationForm, 'name' | 'lastname' | 'email'>;

export const userSchema = authSchema.pick({
    name: true,
    lastname: true,
    email: true,
    rol: true
}).extend({
    id: z.number()
});

export const usersSchema = z.array(userSchema);
export type User = z.infer<typeof userSchema>;

export const adminUserEditFormSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    rol: z.nativeEnum(Rol)
});

export type AdminUserEditFormData = z.infer<typeof adminUserEditFormSchema>;
