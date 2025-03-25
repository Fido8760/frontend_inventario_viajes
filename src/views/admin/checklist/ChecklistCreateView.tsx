import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import ChecklistForm from '../../../components/admin/ChecklistForm'
import { ChecklistAPI, postChecklist } from '../../../api/CheckelistAPI'
import preguntasData from './preguntas.json'
import { generateFormSchema, FormValues, PreguntasDataSchema } from '../../../types'

export default function ChecklistCreateView() {

    const navigate = useNavigate()
    const parsedData = PreguntasDataSchema.parse(preguntasData)
    const params = useParams()
    const asignacionId = +params.asignacionId!

     // Inicializar formulario con el schema generado
     const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(generateFormSchema(parsedData)),
        defaultValues: parsedData.preguntas.reduce((acc, seccion) => {
          seccion.items.forEach(pregunta => {
            acc[pregunta.idPregunta.toString()] = pregunta.respuesta
          })
          return acc
        }, {} as FormValues)
    })


    const { mutate } = useMutation({
        mutationFn: postChecklist,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data.message)
            navigate(`/asignacion/${asignacionId}/createChecklist/${data.id}`)
        }
    })

    const handleCreateChecklist = (formData: FormValues) => {
        const data: ChecklistAPI = {
            asignacionId,
            formData: {
                respuestas: {
                    preguntas: parsedData.preguntas.flatMap(seccion => 
                        seccion.items.map(pregunta => ({
                            idPregunta: pregunta.idPregunta,
                            tipo: pregunta.tipo,
                            respuesta: formData[pregunta.idPregunta]
                        }))
                    )
                }
            }
        }
        mutate(data)
    }

    return (
        <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Paso 2: Llenar el checklist</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">Complete todos los campos indicados</p>
                <nav className=" my-5">
                
                </nav>
                <form 
                    className=" mt-10 bg-white shadow-lg p-10 rounded-lg"
                    onSubmit={handleSubmit(handleCreateChecklist)}
                    noValidate
                >
                    <ChecklistForm 
                        register={register}
                        errors={errors}
                        preguntas={parsedData.preguntas}
                    />
                    <input 
                        type="submit"
                        value={'Enviar Checklist'}
                        className=" bg-red-800 hover:bg-red-900 w-full p-3 text-white uppercase font-bold cursor-pointer transition-colors"
                    />
                </form>
                
            </div>
            
        </>
    )
}
