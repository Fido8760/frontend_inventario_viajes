import { z } from 'zod'
import { Rol } from './roles'

/** Usuario */
export const authSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    rol: z.nativeEnum(Rol),
    token: z.string()
})
export type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>
export type UserRegistrationForm = Pick<Auth, 'name' | 'lastname' | 'email' | 'password' | 'password_confirmation'>
export type ForgotPasswordForm = Pick<Auth, 'email'>
export type NewPasswordForm = Pick<Auth, 'password' | 'password_confirmation'>
export type ConfirmToken = Pick<Auth, 'token'>
export type UserEditForm = Pick<UserRegistrationForm, 'name' | 'lastname' | 'email'>

/** Users */
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
    rol: z.nativeEnum(Rol)
})
export type AdminUserEditFormData = z.infer<typeof adminUserEditFormSchema>

/** Asignacion - Base schemas */
export const usuarioSchemaBase = z.object({
    id: z.number(),
    name: z.string(),
    lastname: z.string(),
    email: z.string(),
    rol: z.nativeEnum(Rol)
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

export const cajasSchemaBase = z.array(cajaSchemaBase)

export const operadorSchemaBase = z.object({
    id: z.number(),
    nombre: z.string(),
    apellido_p: z.string(),
    apellido_m: z.string()
})

export const operadoresSchemaBase = z.array(operadorSchemaBase)

export type UnidadBase    = z.infer<typeof unidadSchemaBase>
export type UnidadesBase  = z.infer<typeof unidadesSchemaBase>
export type CajaBase      = z.infer<typeof cajaSchemaBase>
export type CajasBase     = z.infer<typeof cajasSchemaBase>
export type OperadorBase  = z.infer<typeof operadorSchemaBase>
export type OperadoresBase = z.infer<typeof operadoresSchemaBase>

export const asignacionCompletaSchema = z.object({
    id: z.number(),
    unidadId: z.number(),
    cajaId: z.number().nullable(),
    operadorId: z.number().nullable(),
    userId: z.number().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    usuario: usuarioSchemaBase.nullable(),
    unidad: unidadSchemaBase,
    caja: cajaSchemaBase.nullable(),
    operador: operadorSchemaBase.nullable()
})
export type AsignacionCompleta = z.infer<typeof asignacionCompletaSchema>

// ── Status de asignación ──────────────────────────────────────────────────────
export const asignacionStatusSchema = z.enum([
    'CREADA',
    'CHECKLIST_PENDIENTE',  // ← agregado
    'FOTOS_PENDIENTES',
    'COMPLETA'
])
export type AsignacionStatus = z.infer<typeof asignacionStatusSchema>

// ── Schemas para la respuesta paginada (/assignments) ────────────────────────
const apiPaginatedUsuarioSchema = z.object({
    name: z.string(),
    lastname: z.string(),
    rol: z.nativeEnum(Rol)
})

const apiPaginatedUnidadSchema = z.object({
    no_unidad: z.string(),
    u_placas: z.string(),
    tipo_unidad: z.string()
})

const apiPaginatedCajaSchema = z.object({
    c_placas: z.string(),
    c_marca: z.string()
})

const apiPaginatedOperadorSchema = z.object({
    nombre: z.string(),
    apellido_p: z.string(),
    apellido_m: z.string()
})

const apiChecklistInfoSchema = z.object({
    id: z.number(),
    status: z.enum(['EN_PROGRESO', 'COMPLETO']).optional()
})

const apiPaginatedAsignacionItemSchema = z.object({
    id: z.number(),
    unidadId: z.number(),
    cajaId: z.number().nullable(),
    operadorId: z.number().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    userId: z.number(),
    usuario: apiPaginatedUsuarioSchema,
    unidad: apiPaginatedUnidadSchema,
    caja: apiPaginatedCajaSchema.nullable(),
    operador: apiPaginatedOperadorSchema.nullable(),
    checklist: apiChecklistInfoSchema.nullable().optional(),
    status: asignacionStatusSchema.optional(),  // ← usa el enum centralizado
})

export type ApiAsignacionItem = z.infer<typeof apiPaginatedAsignacionItemSchema>

export const asignacionPaginationApiSchema = z.object({
    count: z.number(),
    rows: z.array(apiPaginatedAsignacionItemSchema)
})
export type AsignacionPaginationApiType = z.infer<typeof asignacionPaginationApiSchema>

export const asignacionFormSchema = z.object({
    unidadId:   z.coerce.number().int().gt(0, "Seleccione unidad"),
    cajaId:     z.coerce.number().int().optional().nullable(),
    operadorId: z.coerce.number().int().gt(0, "Seleccione operador"),
})
export type AsignacionFormData = z.infer<typeof asignacionFormSchema>

// ── Formulario Checklist (UI) ─────────────────────────────────────────────────
export const PreguntaSchemaUI = z.object({
    idPregunta: z.number(),
    pregunta: z.string(),
    respuesta: z.union([z.string(), z.number()]).nullable().optional(),
    tipo: z.enum(["numero", "si_no", "texto", "opciones"]),
    aplicaA: z.string().optional()
})

export const SeccionSchemaUI = z.object({
    nombre: z.string(),
    preguntas: z.array(PreguntaSchemaUI)
})

export const PlantillaChecklistSchema = z.object({
    preguntas: z.array(SeccionSchemaUI)
})

export const PreguntasDataSchemaUI = z.object({
    preguntas: z.array(SeccionSchemaUI)
})

export type PreguntasDataUI = z.infer<typeof PreguntasDataSchemaUI>
export type SeccionUI       = z.infer<typeof SeccionSchemaUI>
export type PreguntaUI      = z.infer<typeof PreguntaSchemaUI>
export type QuestionType    = PreguntaUI['tipo']

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
        respuesta: z.string({ invalid_type_error: "Debe ser texto" })
    }),
    z.object({
        idPregunta: z.number(),
        tipo: z.literal("opciones"),
        respuesta: z.preprocess(
            (val) => (val === "" ? undefined : val),
            z.enum(["BUENO", "REGULAR", "MALO"], {
                required_error: "No se seleccionó una opción",
                invalid_type_error: "Selección inválida (debe ser bueno/regular/malo)."
            })
        )
    }),
])

export const checklistValidationSchema = z.object({
    respuestas: z.object({
        preguntas: z.array(validatedQuestionSchema)
    })
})
export type ChecklistFormData = z.infer<typeof checklistValidationSchema>

// ── Nuevo modelo relacional — getById ─────────────────────────────────────────
export const preguntaConRespuestaSchema = z.object({
    preguntaId:  z.number(),
    texto:       z.string(),
    tipo:        z.enum(['si_no', 'opciones', 'numero', 'texto']),
    obligatorio: z.boolean(),
    aplica_a:    z.enum(['todos', 'tractocamion']),
    valor:       z.string().nullable(),
})

export const checklistDetalleSchema = z.object({
    id:        z.number(),
    status:    z.enum(['EN_PROGRESO', 'COMPLETO']),
    secciones: z.record(z.array(preguntaConRespuestaSchema)),
})

export type PreguntaConRespuesta = z.infer<typeof preguntaConRespuestaSchema>
export type ChecklistDetalle     = z.infer<typeof checklistDetalleSchema>

// ── Imagenes ──────────────────────────────────────────────────────────────────
export const checklistImageSchema = z.object({
    frontal: z.any().refine((file) => file instanceof File, { message: "La foto frontal es requerida" }),
})
export type ChecklistImageData = z.infer<typeof checklistImageSchema>

export const uploadImageResponseSchema = z.object({
    message:  z.string(),
    imageUrl: z.string().url(),
})
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>

// ── Schemas para asignación con checklist (getAsignacionById) ────────────────
const usuarioEnAsignacionSchema = z.object({
    id:       z.number(),
    name:     z.string(),
    lastname: z.string(),
    email:    z.string().email(),
    rol:      z.nativeEnum(Rol)
})

const unidadEnAsignacionSchema = z.object({
    id:         z.number(),
    no_unidad:  z.string(),
    tipo_unidad: z.enum(['TRACTOCAMION', 'MUDANCERO', 'CAMIONETA']),
    u_placas:   z.string(),
})

const cajaEnAsignacionSchema = z.object({
    id:          z.number(),
    numero_caja: z.string(),
    c_placas:    z.string(),
    c_marca:     z.string(),
    c_anio:      z.number(),
})

const operadorEnAsignacionSchema = z.object({
    id:            z.number(),
    nombre:        z.string(),
    apellido_p:    z.string(),
    apellido_m:    z.string(),
    vigencia_lic:  z.string(),
    vigencia_apto: z.string()
})

const imagenEnChecklistSchema = z.object({
    id:          z.number(),
    urlImagen:   z.string(),
    checklistId: z.number(),
    fieldId: z.string(),
})

const preguntaRespuestaChecklistSchema = z.object({
    idPregunta: z.number(),
    pregunta:   z.string(),
    respuesta:  z.union([z.string(), z.number(), z.null()]),
    tipo:       z.enum(['numero', 'si_no', 'opciones', 'texto']),
    aplicaA:    z.enum(['todos', 'tractocamion']),
})
export type PreguntaRespuesta = z.infer<typeof preguntaRespuestaChecklistSchema>

export const seccionChecklistSchema = z.object({
    nombre:    z.string(),
    preguntas: z.array(preguntaRespuestaChecklistSchema),
})

export const respuestaChecklistSchema = z.object({
    secciones: z.array(seccionChecklistSchema),
})

// ← status agregado, respuestas nullable para compatibilidad durante migración

const respuestaItemSchema = z.object({
    id:          z.number(),
    checklistId: z.number(),
    preguntaId:  z.number(),
    valor:       z.string().nullable(),
    pregunta: z.object({
        id:          z.number(),
        seccion:     z.string(),
        texto:       z.string(),
        tipo:        z.enum(['numero', 'si_no', 'opciones', 'texto']),
        aplica_a:    z.enum(['todos', 'tractocamion']),
        obligatorio: z.boolean(),
        orden:       z.number(),
    }).optional()
});

export const datosChecklistEnAsignacionSchema = z.object({
    id:           z.number(),
    asignacionId: z.number(),
    status:       z.enum(['EN_PROGRESO', 'COMPLETO']),
    respuestas:   z.array(respuestaItemSchema),
    createdAt:    z.string().datetime(),
    updatedAt:    z.string().datetime(),
    imagenes:     z.array(imagenEnChecklistSchema),
});

export type RespuestaItem     = z.infer<typeof respuestaItemSchema>

export const asignacionByIdApiResponseSchema = z.object({
    id:         z.number(),
    unidadId:   z.number(),
    cajaId:     z.number().nullable(),
    operadorId: z.number().nullable(),
    userId:     z.number().nullable(),
    createdAt:  z.string(),
    updatedAt:  z.string(),
    status:     asignacionStatusSchema.optional(),  // ← usa el enum centralizado
    usuario:    usuarioEnAsignacionSchema.nullable(),
    unidad:     unidadEnAsignacionSchema,
    caja:       cajaEnAsignacionSchema.nullable(),
    operador:   operadorEnAsignacionSchema.nullable(),
    checklist:  datosChecklistEnAsignacionSchema.nullable(),
})
export type AsignacionByIdApiResponse = z.infer<typeof asignacionByIdApiResponseSchema>

export const fullApiAsignacionResponseSchema = z.object({
    message:    z.string().optional(),
    asignacion: asignacionByIdApiResponseSchema,
})
export type FullApiAsignacionResponse = z.infer<typeof fullApiAsignacionResponseSchema>

export type ChecklistDataType = z.infer<typeof datosChecklistEnAsignacionSchema>

/* ========= DSHABOARD KPIS ========= */


// ─── Completitud por tipo ─────────────────────────────────────────────────────
export const completitudPorTipoSchema = z.object({
    tipo:       z.enum(['tractocamion', 'mudancero', 'camioneta']),
    total:      z.number(),
    completos:  z.number(),
    porcentaje: z.number(),
})

// ─── /dashboard/kpis ─────────────────────────────────────────────────────────
export const kpisResumenSchema = z.object({
    totalUnidades:      z.number(),
    sinChecklist:       z.number(),
    mas30dias:          z.number(),
    enProgreso:         z.number(),
    completos:          z.number(),
    sinFotos:           z.number(),
    completitudPorTipo: z.array(completitudPorTipoSchema),
})

// ─── /dashboard/kpis/criticas ────────────────────────────────────────────────
export const unidadCriticaSchema = z.object({
    id:              z.number(),
    no_unidad:       z.string(),
    tipo_unidad:     z.string(),
    u_placas:        z.string(),
    motivo:          z.enum(['sin_checklist', 'mas_30_dias']),
    diasSinRevision: z.number().nullable(),
    ultimoChecklist: z.string().nullable(), 
})

export const unidadesCriticasSchema = z.object({
    data: z.array(unidadCriticaSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    })
})

// ─── /dashboard/kpis/sin-fotografias ─────────────────────────────────────────
export const checklistSinFotosSchema = z.object({
    checklistId:    z.number(),
    asignacionId:   z.number(),
    fechaChecklist: z.string(), // ISO date string
    unidad: z.object({
        no_unidad:   z.string().optional(),
        tipo_unidad: z.string().optional(),
        u_placas:    z.string().optional(),
    }),
})

export const sinFotografiasSchema = z.array(checklistSinFotosSchema)

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type CompletitudPorTipo  = z.infer<typeof completitudPorTipoSchema>
export type KpisResumen         = z.infer<typeof kpisResumenSchema>
export type UnidadCritica       = z.infer<typeof unidadCriticaSchema>
export type UnidadesCriticasResponse = z.infer<typeof unidadesCriticasSchema>
export type ChecklistSinFotos   = z.infer<typeof checklistSinFotosSchema>