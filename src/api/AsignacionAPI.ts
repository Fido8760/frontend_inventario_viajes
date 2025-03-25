import { isAxiosError } from "axios";
import api from "../lib/axios";
import { Asignacion, AsignacionFormData, cajasSchema, dashboardAsignacionSchema, operadoresSchema, unidadesSchema } from "../types";

export async function getUnidades() {
    try {
        
        const { data } = await api('/assignments/unidades')
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
    try {
        const { data } = await api('/assignments/cajas');
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
    try {
        const { data } = await api('/assignments/operadores');
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
    
    try {
        const url = '/assignments'
        const { data } = await api(url)
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
    

    try {
        const { data } = await api.post('/assignments', formData)

        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getAsignacionById(id: Asignacion['id']) {
    
    try {
        const { data } = await api(`/assignments/${id}`)
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
    
    try {
        const { data } = await api.put<string>(`/assignments/${asignacionId}`, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteAsignacion(id: Asignacion['id']) {
    
    try {
        const { data } = await api.delete<string>(`/assignments/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

