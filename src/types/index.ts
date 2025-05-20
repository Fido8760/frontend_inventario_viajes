import { z } from 'zod'

/** Usuario */
export const authSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    rol: z.number(),
    token: z.string()
})
export type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>
export type UserRegistrationForm = Pick<Auth,'name' | 'lastname' |'email' | 'password' | 'password_confirmation'>
export type ForgotPasswordForm = Pick<Auth, 'email'>
export type NewPasswordForm = Pick<Auth, 'password' | 'password_confirmation'>
export type ConfirmToken = Pick<Auth, 'token'>

export type UserEditForm = Pick<UserRegistrationForm, 'name' | 'lastname' | 'email'>
/** Users  */

export const userSchema = authSchema.pick({
  name: true,
  lastname: true,
  email: true,
  rol: true
}).extend({
  id: z.number()
})

export const usersSchema = z.array(userSchema)
export type User = z.infer<typeof userSchema>

export const adminUserEditFormSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    rol: z.number() // Ejemplo de validación
});
export type AdminUserEditFormData = z.infer<typeof adminUserEditFormSchema>;


/** Asignacion */
export const usuarioSchemaBase = z.object({
    id: z.number(), // <--- AÑADIR
    name: z.string(),
    lastname: z.string(),
    email: z.string(), // <--- AÑADIR
    rol: z.number()
});
  
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
  name: z.string(),
  lastname: z.string(),
  rol: z.number()
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

const apiChecklistInfoSchema = z.object({
  id: z.number(),
  
});

const apiPaginatedAsignacionItemSchema = z.object({
  id: z.number(),
  unidadId: z.number(),
  cajaId: z.number().nullable(),
  operadorId: z.number(),
  createdAt: z.string().datetime(), 
  updatedAt: z.string().datetime(), 
  userId: z.number(),
  usuario: apiPaginatedUsuarioSchema, 
  unidad: apiPaginatedUnidadSchema,  
  caja: apiPaginatedCajaSchema.nullable(), 
  operador: apiPaginatedOperadorSchema,  
  checklists: z.array(apiChecklistInfoSchema).optional()
})

export type ApiAsignacionItem = z.infer<typeof apiPaginatedAsignacionItemSchema>

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
  nombre: z.string(),
  preguntas: z.array(PreguntaSchemaUI)
});

export const PlantillaChecklistSchema = z.object({
  preguntas: z.array(SeccionSchemaUI)
})

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


/** Schemas de respuesta JSON para asignación con checklist para renderizado */


const usuarioEnAsignacionSchema = z.object({
  id: z.number(),
  name: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  rol: z.number() // <-- Incluye todos los campos de la respuesta
});

const unidadEnAsignacionSchema = z.object({
  id: z.number(),
  no_unidad: z.string(),
  tipo_unidad: z.enum(['TRACTOCAMION', 'MUDANCERO', 'CAMIONETA']), // Sé específico si puedes
  u_placas: z.string(),
});

const cajaEnAsignacionSchema = z.object({
  id: z.number(),
  numero_caja: z.string(), // <-- Incluye todos los campos de la respuesta
  c_placas: z.string(),
  c_marca: z.string(),
  c_anio: z.number(),
});

const operadorEnAsignacionSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  apellido_p: z.string(),
  apellido_m: z.string(),
  vigencia_lic: z.string(), // <-- Incluye todos los campos de la respuesta (o coerce.date)
  vigencia_apto: z.string() // <-- Incluye todos los campos de la respuesta (o coerce.date)
});

// --- Schemas para la ESTRUCTURA DEL CHECKLIST DENTRO de la respuesta de getAsignacionById ---

const imagenEnChecklistSchema = z.object({
  id: z.number(),
  urlImagen: z.string(), // Podría ser .url()
  checklistId: z.number(),
});

const preguntaRespuestaChecklistSchema = z.object({
  idPregunta: z.number(),
  pregunta: z.string(),
  respuesta: z.union([z.string(), z.number(), z.null()]), // Permite null si se limpió
  tipo: z.enum(['numero', 'si_no', 'opciones', 'texto']), // Usa los tipos de tu JSON
  aplicaA: z.enum(['todos', 'tractocamion']), // Usa los aplicaA de tu JSON
});

export type PreguntaRespuesta = z.infer<typeof preguntaRespuestaChecklistSchema>

export const seccionChecklistSchema = z.object({
  nombre: z.string(),
  preguntas: z.array(preguntaRespuestaChecklistSchema),
});

export const respuestaChecklistSchema = z.object({
  secciones: z.array(seccionChecklistSchema),
});

export const datosChecklistEnAsignacionSchema = z.object({
  id: z.number(),
  asignacionId: z.number(),
  respuestas: respuestaChecklistSchema,
  createdAt: z.string().datetime(), // Incluye timestamps del checklist
  updatedAt: z.string().datetime(), // Incluye timestamps del checklist
  imagenes: z.array(imagenEnChecklistSchema), // Usa el schema de imagen
});

// --- Schema PRINCIPAL para el objeto 'asignacion' devuelto por getAsignacionById ---
// Este SÍ debe incluir el campo 'checklists'
export const asignacionByIdApiResponseSchema = z.object({
  id: z.number(),
  unidadId: z.number(),
  cajaId: z.number().nullable(),
  operadorId: z.number(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Usa los schemas específicos definidos arriba que coinciden con la respuesta
  usuario: usuarioEnAsignacionSchema,
  unidad: unidadEnAsignacionSchema,
  caja: cajaEnAsignacionSchema.nullable(), // Objeto caja completo, o null
  operador: operadorEnAsignacionSchema,
  // Incluye el array de checklists usando el schema correcto
  checklists: z.array(datosChecklistEnAsignacionSchema),
});

// Tipo inferido para usar en el frontend
export type AsignacionByIdApiResponse = z.infer<typeof asignacionByIdApiResponseSchema>;

// --- Schema Opcional para TODA la respuesta (si incluye 'message') ---
export const fullApiAsignacionResponseSchema = z.object({
  message: z.string().optional(), // Hacer opcional por si GET no lo trae
  asignacion: asignacionByIdApiResponseSchema,
});
export type FullApiAsignacionResponse = z.infer<typeof fullApiAsignacionResponseSchema>;