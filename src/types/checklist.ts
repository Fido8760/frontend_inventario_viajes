import { z } from 'zod';

export const preguntaSchemaUI = z.object({
    idPregunta: z.number(),
    pregunta: z.string(),
    respuesta: z.union([z.string(), z.number()]).nullable().optional(),
    tipo: z.enum(['numero', 'si_no', 'texto', 'opciones']),
    aplicaA: z.string().optional()
});

export const seccionSchemaUI = z.object({
    nombre: z.string(),
    preguntas: z.array(preguntaSchemaUI)
});

export const plantillaChecklistSchema = z.object({
    preguntas: z.array(seccionSchemaUI)
});

export const preguntasDataSchemaUI = z.object({
    preguntas: z.array(seccionSchemaUI)
});

export type PreguntasDataUI = z.infer<typeof preguntasDataSchemaUI>;
export type SeccionUI = z.infer<typeof seccionSchemaUI>;
export type PreguntaUI = z.infer<typeof preguntaSchemaUI>;
export type QuestionType = PreguntaUI['tipo'];

const validatedQuestionSchema = z.discriminatedUnion('tipo', [
    z.object({
        idPregunta: z.number(),
        tipo: z.literal('numero'),
        respuesta: z.coerce.number({
            required_error: 'El odómetro es requerido',
            invalid_type_error: 'Debe ser un número válido'
        }).min(0, 'El valor debe ser 0 o mayor')
    }),
    z.object({
        idPregunta: z.number(),
        tipo: z.literal('si_no'),
        respuesta: z.string({
            invalid_type_error: "El valor debe ser texto ('si' o 'no')"
        }).refine(value => value === 'si' || value === 'no', {
            message: "Selección inválida (debe ser 'si' o 'no')"
        })
    }),
    z.object({
        idPregunta: z.number(),
        tipo: z.literal('texto'),
        respuesta: z.string({ invalid_type_error: 'Debe ser texto' })
    }),
    z.object({
        idPregunta: z.number(),
        tipo: z.literal('opciones'),
        respuesta: z.preprocess(
            val => (val === '' ? undefined : val),
            z.enum(['BUENO', 'REGULAR', 'MALO'], {
                required_error: 'No se seleccionó una opción',
                invalid_type_error: 'Selección inválida (debe ser bueno/regular/malo).'
            })
        )
    })
]);

export const checklistValidationSchema = z.object({
    respuestas: z.object({
        preguntas: z.array(validatedQuestionSchema)
    })
});

export type ChecklistFormData = z.infer<typeof checklistValidationSchema>;

export const preguntaConRespuestaSchema = z.object({
    preguntaId: z.number(),
    texto: z.string(),
    tipo: z.enum(['si_no', 'opciones', 'numero', 'texto']),
    obligatorio: z.boolean(),
    aplica_a: z.enum(['todos', 'tractocamion']),
    valor: z.string().nullable(),
});

export const checklistDetalleSchema = z.object({
    id: z.number(),
    status: z.enum(['EN_PROGRESO', 'COMPLETO']),
    secciones: z.record(z.array(preguntaConRespuestaSchema)),
});

export type PreguntaConRespuesta = z.infer<typeof preguntaConRespuestaSchema>;
export type ChecklistDetalle = z.infer<typeof checklistDetalleSchema>;
