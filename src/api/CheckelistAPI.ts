import { isAxiosError } from "axios";
import api from "../lib/axios";
import { QuestionType, UploadImageResponse, uploadImageResponseSchema } from "../types";

/** Checklist */

export type ChecklistAPI = {
    asignacionId: number;
    formData: {
      respuestas: {
        preguntas: Array<{
          idPregunta: number;
          tipo: QuestionType;
          respuesta: string | number | null;
        }>;
      };
    };
  };
export async function postChecklist({formData, asignacionId}: Pick<ChecklistAPI, 'asignacionId' | 'formData'>) {

    const url = `/assignments/${asignacionId}/checklist`
    try {
        const { data } = await api.post(url, formData);
        return data;
        
    } catch (error) {
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