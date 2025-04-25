import { z } from 'zod'

/** Usuario */
export const authSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    password_confirmation: z.string()
})

export type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>

/** Users  */

export const userSchema = authSchema.pick({
  name: true,
  email: true
}).extend({
  id: z.number()
})

export type User = z.infer<typeof userSchema>

/** Asignacion */
export const usuarioSchemaBase = z.object({
  name: z.string()
})
  
export const unidadSchemaBase = z.object({
  id: z.number(),
  no_unidad: z.string(),
  u_placas: z.string(),
  tipo_unidad: z.string()
})

export const unidadesSchemaBase = z.array(unidadSchemaBase)
  
export const cajaSchemaBase = z.object({
  id: z.number(),
  c_placas: z.string(),
  c_marca: z.string()
})

export const cajasSchemaBase = z.array(cajaSchemaBase);
  
export const operadorSchemaBase = z.object({
  id: z.number(),
  nombre: z.string(),
  apellido_p: z.string(),
  apellido_m: z.string()
})

export const operadoresSchemaBase = z.array(operadorSchemaBase)

export type UnidadBase = z.infer<typeof unidadSchemaBase>;
export type UnidadesBase = z.infer<typeof unidadesSchemaBase>;
export type CajaBase = z.infer<typeof cajaSchemaBase>;
export type CajasBase = z.infer<typeof cajasSchemaBase>;
export type OperadorBase = z.infer<typeof operadorSchemaBase>;
export type OperadoresBase = z.infer<typeof operadoresSchemaBase>;

export const asignacionCompletaSchema = z.object({
  id: z.number(),
  unidadId: z.number(),
  cajaId: z.number().nullable(), // <-- Permite null
  operadorId: z.number(),
  userId: z.number(),
  createdAt: z.string().datetime(), // O z.coerce.date()
  updatedAt: z.string().datetime(), // O z.coerce.date()
  usuario: usuarioSchemaBase, // Asume que siempre existe usuario
  unidad: unidadSchemaBase,  // Asume que siempre existe unidad
  caja: cajaSchemaBase.nullable(), // <-- Permite null
  operador: operadorSchemaBase // Asume que siempre existe operador
});
export type AsignacionCompleta = z.infer<typeof asignacionCompletaSchema>;
  
  
// ========================================================================
// 2. SCHEMAS ESPECÍFICOS PARA LA RESPUESTA DE LA API PAGINADA (/assignments)
// ========================================================================

const apiPaginatedUsuarioSchema = z.object({
  name: z.string()
});

const apiPaginatedUnidadSchema = z.object({
  no_unidad: z.string(),
  u_placas: z.string(),
  tipo_unidad: z.string()
});

const apiPaginatedCajaSchema = z.object({
  c_placas: z.string(),
  c_marca: z.string()
});

const apiPaginatedOperadorSchema = z.object({
  nombre: z.string(),
  apellido_p: z.string(),
  apellido_m: z.string()
});

const apiPaginatedAsignacionItemSchema = z.object({
  id: z.number(),
  unidadId: z.number(),
  cajaId: z.number().nullable(), // <-- Coincide con API (null posible)
  operadorId: z.number(),
  createdAt: z.string().datetime(), // O z.coerce.date()
  updatedAt: z.string().datetime(), // O z.coerce.date()
  userId: z.number(),
  usuario: apiPaginatedUsuarioSchema,   // <-- Usa schema específico de API
  unidad: apiPaginatedUnidadSchema,    // <-- Usa schema específico de API
  caja: apiPaginatedCajaSchema.nullable(), // <-- Usa schema específico de API y permite null
  operador: apiPaginatedOperadorSchema  // <-- Usa schema específico de API
})

export const asignacionPaginationApiSchema = z.object({
  count: z.number(),
  rows: z.array(apiPaginatedAsignacionItemSchema) // <-- Usa el schema de item correcto
})

export type AsignacionPaginationApiType = z.infer<typeof asignacionPaginationApiSchema>;

export const asignacionFormSchema = z.object({
  unidadId: z.coerce.number().int().gt(0, "Seleccione unidad"), 
  cajaId: z.coerce.number().int().optional().nullable(), 
  operadorId: z.coerce.number().int().gt(0, "Seleccione operador"), 
})
export type AsignacionFormData = z.infer<typeof asignacionFormSchema>;


/** Formulario Checklist */

export const PreguntaSchemaUI = z.object({
  idPregunta: z.number(),
  pregunta: z.string(),
  respuesta: z.union([z.string(), z.number()]).nullable().optional(),
  tipo: z.enum(["numero", "si_no", "texto", "opciones"]),
  aplicaA: z.string().optional()
});

export const SeccionSchemaUI = z.object({
  seccion: z.string(),
  items: z.array(PreguntaSchemaUI)
});

export const PreguntasDataSchemaUI = z.object({
  preguntas: z.array(SeccionSchemaUI)
});

// Tipos inferidos para la definición de la UI
export type PreguntasDataUI = z.infer<typeof PreguntasDataSchemaUI>;
export type SeccionUI = z.infer<typeof SeccionSchemaUI>;
export type PreguntaUI = z.infer<typeof PreguntaSchemaUI>;
export type QuestionType = PreguntaUI['tipo'];


const validatedQuestionSchema = z.discriminatedUnion("tipo", [

    z.object({
        idPregunta: z.number(), 
        tipo: z.literal("numero"),
        respuesta: z.coerce.number({ 
            required_error: "El odómetro es requerido", 
            invalid_type_error: "Debe ser un número válido"
        }).min(0, "El valor debe ser 0 o mayor") 
    }),

    z.object({
        idPregunta: z.number(),
        tipo: z.literal("si_no"),
        respuesta: z.string({
          invalid_type_error: "El valor debe ser texto ('si' o 'no')"
        }).refine(value => value === 'si' || value === 'no', {
          message: "Selección inválida (debe ser 'si' o 'no')"
        })
    }),

    z.object({
        idPregunta: z.number(),
        tipo: z.literal("texto"),
        respuesta: z.string({
             invalid_type_error: "Debe ser texto"
        })
    }),
    z.object({
        idPregunta: z.number(),
        tipo: z.literal("opciones"),
        respuesta: z.preprocess(
          (val) => (val === "" ? undefined : val),
          z.enum(["BUENO", "REGULAR", "MALO"], {
            required_error: "No se seleccionó una opción", // Se activa para undefined (que era "")
            invalid_type_error: "Selección inválida (debe ser bueno/regular/malo)."
          })
        )

    }),

]);

export const checklistValidationSchema = z.object({
    respuestas: z.object({
        preguntas: z.array(validatedQuestionSchema)
    })

});

export type ChecklistFormData = z.infer<typeof checklistValidationSchema>;


/** Imagenes */

export const checklistImageSchema = z.object({
  frontal: z.any().refine((file) => file instanceof File, { message: "La foto frontal es requerida" }),
});

export type ChecklistImageData = z.infer<typeof checklistImageSchema>;

export const uploadImageResponseSchema = z.object({
  message: z.string(),
  imageUrl: z.string().url(),
});

export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;
