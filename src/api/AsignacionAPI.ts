import { isAxiosError } from "axios";
import api from "../lib/axios";
import { Asignacion, AsignacionFormData, cajasSchema, dashboardAsignacionSchema, operadoresSchema, unidadesSchema } from "../types";

export async function getUnidades() {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        
        const { data } = await api('/assignments/unidades',{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const response = unidadesSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

// Obtener todas las cajas
export async function getCajas() {
    const token = localStorage.getItem('AUTH_TOKEN');
    try {
        const { data } = await api('/assignments/cajas', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const response = cajasSchema.safeParse(data);

        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}


// Obtener todos los operadores
export async function getOperadores() {
    const token = localStorage.getItem('AUTH_TOKEN');
    try {
        const { data } = await api('/assignments/operadores', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const response = operadoresSchema.safeParse(data);

        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}


export async function getAsignaciones() {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        const url = '/assignments'
        const { data } = await api(url,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const response = dashboardAsignacionSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function crearAsignacion(formData: AsignacionFormData) {
    const token = localStorage.getItem('AUTH_TOKEN')

    try {
        const { data } = await api.post('/assignments', formData,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getAsignacionById(id: Asignacion['id']) {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        const { data } = await api(`/assignments/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

type AsignacionAPIType = {
    formData: AsignacionFormData
    asignacionId: Asignacion['id']
}

export async function updateAsignacion({formData, asignacionId} : AsignacionAPIType) {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        const { data } = await api.put<string>(`/assignments/${asignacionId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteAsignacion(id: Asignacion['id']) {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        const { data } = await api.delete<string>(`/assignments/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

