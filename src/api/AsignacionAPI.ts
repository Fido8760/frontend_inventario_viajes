import { isAxiosError } from "axios";
import api from "../lib/axios";
import { asignacionByIdApiResponseSchema, AsignacionCompleta, AsignacionFormData, asignacionPaginationApiSchema, cajasSchemaBase, operadoresSchemaBase, unidadesSchemaBase } from "../types";
import { ZodError } from "zod";

//Obtener todas la unidades
export async function getUnidades() {
    try {
        const { data } = await api('/assignments/unidades')
        const response = unidadesSchemaBase.parse(data)
        return response
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        } else if ( error instanceof ZodError) {
            console.error("Error Zod en getUnidades:", error.errors);
            throw new Error("Los datos de operadores recibidos no son válidos.");
        } else {
            console.error("Error desconocido en getUnidades:", error)
            throw new Error("Ocurrió un error inesperado al obtener las unidades.");
        }
    }
}

// Obtener todas las cajas
export async function getCajas() {
    try {
        const { data } = await api('/assignments/cajas');
        const response = cajasSchemaBase.parse(data);
        return response
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        } else if ( error instanceof ZodError) {
            console.error("Error Zod en getCajas:", error.errors);
            throw new Error("Los datos de operadores recibidos no son válidos.");
        } else {
            console.error("Error desconocido en getCajas:", error)
            throw new Error("Ocurrió un error inesperado al obtener las cajas.");
        }
    }
}


// Obtener todos los operadores
export async function getOperadores() {
    try {
        const { data } = await api('/assignments/operadores');
        const response = operadoresSchemaBase.parse(data);
        return response
        
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        } else if ( error instanceof ZodError) {
            console.error("Error Zod en getOperadores:", error.errors);
            throw new Error("Los datos de operadores recibidos no son válidos.");
        } else {
            console.error("Error desconocido en getOperadores:", error)
            throw new Error("Ocurrió un error inesperado al obtener operadores.");
        }
    }
}


export async function getAsignaciones(take: number, skip: number) {
    
    try {
        const url = `/assignments?take=${take}&skip=${skip}`
        const { data } = await api(url)
        const response = asignacionPaginationApiSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

type CrearAsignacionResponse = {
    message: string;
    id: number;
}
  
export async function crearAsignacion(formData: AsignacionFormData) {
    
    try {
        const { data } = await api.post<CrearAsignacionResponse>('/assignments', formData)

        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            const data = error.response.data
            if (data?.errors?.[0]?.msg) {
                throw new Error(data.errors[0].msg)
            }
            
            throw new Error(data?.error || "Error desconocido")
        }
    }
}

export async function getAsignacionById(id: AsignacionCompleta['id']) {
    
    try {
        const { data } = await api(`/assignments/${id}`)
        const result = asignacionByIdApiResponseSchema.safeParse(data)

        if(result.success) {
            return result.data
        } else {
            // ¡Fallo! Los datos no coinciden con el schema.
            console.error("Error de Validación Zod (safeParse):", result.error.errors); // Muestra los detalles del error
            // Lanzar un error para que React Query lo detecte
            throw new Error("Los datos recibidos de la API no tienen el formato esperado.");
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

type AsignacionAPIType = {
    formData: AsignacionFormData
    asignacionId: AsignacionCompleta['id']
}

export async function updateAsignacion({formData, asignacionId} : AsignacionAPIType) {
    
    try {
        const { data } = await api.put<string>(`/assignments/${asignacionId}`, formData)
        return data
    } catch (error) {
        let errorMessage 
        if(isAxiosError(error) && error.response) {
            const responseData = error.response.data 
            errorMessage = responseData.errors[0].msg;
        }
        throw new Error(errorMessage);
    }
}

export async function deleteAsignacion(id: AsignacionCompleta['id']) {
    
    try {
        const { data } = await api.delete<string>(`/assignments/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

