import { isAxiosError } from "axios";
import api from "../lib/axios";
import { AdminUserEditFormData, UserLoginForm, UserRegistrationForm, userSchema, usersSchema } from "../types";

export async function createAccount (formData: UserRegistrationForm) {
    const url = '/auth/create-account'
    try {
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function authenticateUser(formData: UserLoginForm) {
    try {
        const url = '/auth/login'
        const { data } = await api.post<string>(url, formData)
        localStorage.setItem('AUTH_TOKEN', data)
        return data
 
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getUser() {
    try {
        const { data } = await api('/auth/user')
        const response = userSchema.parse(data)
        return response
        
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getUsers() {
    const url = '/auth/users'

    try {
        const { data } = await api.get(url)
        const response = usersSchema.safeParse(data)
        
        if(response.success) {
            return response.data
        } else {
            // Lanza un error con el mensaje de Zod si los datos no son válidos
            console.error('Zod validation error:', response.error)
            throw new Error('Respuesta del servidor inválida.')
          }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getUsersById(userId: number) {
    const url = `/auth/users/${userId}`

    try {
        const { data } = await api.get(url)
        const response = userSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

type UserAPIType = {
    formData: AdminUserEditFormData
    userId: number
}
export async function updateUser({formData, userId} : UserAPIType) {
    const url = `/auth/users/${userId}`

    console.log(formData)
    try {
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteUser(userId: number) {
    const url = `/auth/users/${userId}`

    try {
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}