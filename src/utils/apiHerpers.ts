import { isAxiosError } from 'axios'
import { z, ZodTypeAny } from 'zod'

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado') {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data
    return data?.errors?.[0]?.msg ?? data?.error ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

export function parseOrThrow<T extends ZodTypeAny>(schema: T, data: unknown, contexto: string): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.error(`Zod error en ${contexto}:`, result.error.format())
    throw new Error('La respuesta del servidor no tiene el formato esperado')
  }
  return result.data
}