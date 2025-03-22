import { isAxiosError } from "axios";
import api from "../lib/axios";
import { QuestionType } from "../types";

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

    console.log(formData)
    const token = localStorage.getItem("AUTH_TOKEN");
    const url = `/assignments/${asignacionId}/checklist`
    try {
        const { data } = await api.post<string>(url, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}