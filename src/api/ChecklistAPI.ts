import { isAxiosError } from "axios";
import api from "../lib/axios";
import { QuestionType, UploadImageResponse, uploadImageResponseSchema } from "../types";

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
        console.log(error)
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

export type ChecklistImageAPI = {
    file: File;
    asignacionId: number
    checklistId: number
    fieldId: string
}

export async function uploadImage({file, asignacionId, checklistId}: ChecklistImageAPI) {
  let formData = new FormData()
  formData.append('file', file)
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