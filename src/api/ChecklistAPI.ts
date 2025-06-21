import { isAxiosError } from "axios";
import api from "../lib/axios";
import { datosChecklistEnAsignacionSchema, QuestionType, UploadImageResponse, uploadImageResponseSchema } from "../types";

/** Checklist */

export type BackendChecklistPayload = {
  checklist: {
      secciones: Array<{
          nombre: string;
          preguntas: Array<{
              idPregunta: number;
              pregunta: string; 
              respuesta: string | number | null | undefined
              tipo: QuestionType; 
              aplicaA: string; 
          }>;
      }>;
  };
};

export type PostChecklistArgs = {
  asignacionId: number;
  body: BackendChecklistPayload; // La función recibe el cuerpo ya construido
};

type PostChecklistSuccessData = {
  message: string;
  id?: number;
};
  
export async function postChecklist({body , asignacionId}: PostChecklistArgs) {

    const url = `/assignments/${asignacionId}/checklist`
    try {
        const { data } = await api.post<PostChecklistSuccessData>(url, body );
        return data;
        
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

export async function getChecklist(asignacionId: number, checklistId: number) {
  try {
    const url = `/assignments/${asignacionId}/checklist/${checklistId}`
    const { data } =  await api(url) 
    const response = datosChecklistEnAsignacionSchema.safeParse(data)
    if(response.success) {
      return response.data
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export type UpdateChecklistArgs = {
  asignacionId: number;
  checklistId: number;
  body: BackendChecklistPayload;
};

type UpdateChecklistSuccessData = {
  message: string
}

export async function updateChecklist({asignacionId, checklistId, body}: UpdateChecklistArgs): Promise<UpdateChecklistSuccessData> {
  const url = `/assignments/${asignacionId}/checklist/${checklistId}`
  try {
    const { data } =  await api.put<UpdateChecklistSuccessData>(url, body) 
    return data
  } catch (error) {
    console.error("API: Error al actualizar checklist:", error);

    if (isAxiosError(error) && error.response) {
        const backendError = error.response.data?.error
                             || error.response.data?.message
                             || `Error ${error.response.status}: ${error.response.statusText}`;
        throw new Error(backendError);
    }
    else if (error instanceof Error) {
         throw new Error(`Error inesperado: ${error.message}`);
    }
    else {
         throw new Error("Ocurrió un error desconocido al actualizar el checklist.");
    }
  }
}

export type DeleteChecklistArgs = {
  asignacionId: number;
  checklistId: number;
};

type DeleteChecklistSuccessData = {
  message: string;
};

// Función para eliminar un checklist
export async function deleteChecklist({ asignacionId, checklistId }: DeleteChecklistArgs): Promise<DeleteChecklistSuccessData> { 
  const url = `/assignments/${asignacionId}/checklist/${checklistId}`;
  console.log(`API: Ejecutando DELETE en ${url}`);

  try {

      const { data } = await api.delete<DeleteChecklistSuccessData>(url);

      if (!data || typeof data.message !== 'string') {
           console.warn("Respuesta de eliminación de checklist inesperada:", data);
           throw new Error("Respuesta inválida del servidor tras eliminar.");
      }
      console.log("API: Checklist eliminado con éxito. Respuesta:", data);
      return data;

  } catch (error) {
      console.error("API: Error al eliminar checklist:", error);
      if (isAxiosError(error) && error.response) {
          const backendError = error.response.data?.error
                               || error.response.data?.message
                               || `Error ${error.response.status}: ${error.response.statusText}`;
          throw new Error(backendError);
      } else if (error instanceof Error) {
           throw new Error(`Error inesperado: ${error.message}`);
      } else {
           throw new Error("Ocurrió un error desconocido al eliminar el checklist.");
      }
  }
}



export type ChecklistImageAPI = {
    file: File;
    asignacionId: number
    checklistId: number
    fieldId: string
}

export async function uploadImage({file, asignacionId, checklistId, fieldId}: ChecklistImageAPI) {
  let formData = new FormData()
  formData.append('file', file)
  formData.append('fieldId', fieldId)
  const url = `/assignments/${asignacionId}/checklist/${checklistId}/image`;

  try {
    const { data } = await api.post<UploadImageResponse>(url, formData)
    const result = uploadImageResponseSchema.parse(data)
    return result
    
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Error desconocido al subir la imagen");
  }
}