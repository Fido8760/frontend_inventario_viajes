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
export const usuarioSchema = z.object({
    name: z.string()
  })
  
  export const unidadSchema = z.object({
    id: z.number(),
    no_unidad: z.string(),
    u_placas: z.string(),
    tipo_unidad: z.string()
  })

  export const unidadesSchema = z.array(unidadSchema)
  
  export const cajaSchema = z.object({
    id: z.number(),
    c_placas: z.string(),
    c_marca: z.string()
  })

  export const cajasSchema = z.array(cajaSchema)
  
  export const operadorSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    apellido_p: z.string(),
    apellido_m: z.string()
  })

  export const operadoresSchema = z.array(operadorSchema)

export type Unidad = z.infer<typeof unidadSchema>;
export type Unidades = z.infer<typeof unidadesSchema>;

export type Caja = z.infer<typeof cajaSchema>;
export type Cajas = z.infer<typeof cajasSchema>

export type Operador = z.infer<typeof operadorSchema>;
export type Operadores = z.infer<typeof operadoresSchema>
  
  export const asignacionSchema = z.object({
    id: z.number(),
    unidadId: z.number(),
    cajaId: z.number(),
    operadorId: z.number(),
    userId: z.number(),
    createdAt: z.string().datetime(), 
    updatedAt: z.string().datetime(),
    usuario: usuarioSchema,
    unidad: unidadSchema,
    caja: cajaSchema,
    operador: operadorSchema
  })
  
  // Para el listado del dashboard (si necesitas menos campos)
  export const dashboardAsignacionSchema = z.array(
    asignacionSchema.pick({
      id: true,
      createdAt: true,
      unidad: true,
      caja: true,
      operador: true,
      usuario: true
    }).extend({
      unidad: unidadSchema.pick({ no_unidad: true, u_placas: true }),
      caja: cajaSchema.pick({ c_placas: true }),
      operador: operadorSchema.pick({ nombre: true, apellido_p: true,  apellido_m: true }),
      usuario: usuarioSchema.pick({ name: true })
    })
  )
  
  export type Asignacion = z.infer<typeof asignacionSchema>
  export type AsignacionFormData = Pick<Asignacion, 'cajaId' | 'operadorId' | 'unidadId'>

/** Formulario Checklist */

// 1. Definir los esquemas Zod
export const PreguntaSchema = z.object({
  idPregunta: z.number(),
  pregunta: z.string(),
  respuesta: z.union([z.string(), z.number(), z.null()]),
  tipo: z.enum(["numero", "si_no", "texto", "opciones"])
})

export const SeccionSchema = z.object({
  seccion: z.string(),
  items: z.array(PreguntaSchema)
})

export const PreguntasDataSchema = z.object({
  preguntas: z.array(SeccionSchema)
})

// 2. Crear los tipos inferidos
export type PreguntasData = z.infer<typeof PreguntasDataSchema>
export type Seccion = z.infer<typeof SeccionSchema>
export type Pregunta = z.infer<typeof PreguntaSchema>
export type QuestionType = Pregunta['tipo']

// 3. Schema para el formulario dinámico
export const generateFormSchema = (data: PreguntasData) => 
  z.object(
    data.preguntas.reduce((acc, seccion) => {
      seccion.items.forEach(pregunta => {
        acc[pregunta.idPregunta.toString()] = (() => {
          switch(pregunta.tipo) {

            case 'numero': 
              return z.number({
              required_error: "Coloque el km del odometro",
              invalid_type_error: "Debe ser un numero válido"
            }).min(0, "El valor debe ser mayor a Cero")

            case 'si_no':
              return z.enum(['si', 'no'], {
                required_error: "Seleccione una opción",
                invalid_type_error: "seleccione 'si' o 'no'"
            });
            case 'texto': return z.string()

            case 'opciones':
              return z.string({
                required_error: "Seleccione una opción",
                invalid_type_error: "Opción no válida"
              })
              .refine(value => value !== "", { message: "Este campo es requerido" }) // Evita valores vacíos
              .refine(value => ["bueno", "regular", "malo"].includes(value), { message: "⚠️ Opción no válida" }); // Valida opciones permitidas
              

            default: return z.never()
          }
        })()
      })
      return acc
    }, {} as Record<string, z.ZodTypeAny>)
  )

export type FormValues = z.infer<ReturnType<typeof generateFormSchema>>

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
