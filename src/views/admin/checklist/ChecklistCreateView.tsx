import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import ChecklistForm from '../../../components/admin/ChecklistForm';
import { PostChecklistArgs, postChecklist, BackendChecklistPayload } from '../../../api/ChecklistAPI';
import preguntasData from './preguntas.json';
import { PreguntasDataSchemaUI, PreguntasDataUI, checklistValidationSchema, ChecklistFormData, QuestionType } from '../../../types';

function getDefaultValueForType(tipo: QuestionType, initialValue: string | number | null | undefined): string | number | undefined | null {
    if (initialValue !== null && initialValue !== undefined) {
        if (tipo === 'numero') return typeof initialValue === 'number' ? initialValue : (initialValue === '' ? undefined : Number(initialValue))
        if (tipo === 'si_no' || tipo === 'opciones') return typeof initialValue === 'string' ? initialValue : ''
        return initialValue
    }
    switch (tipo) {
        case 'numero': return undefined
        case 'si_no': return ''
        case 'opciones': return ''
        case 'texto': return ''
        default: return null
    }
}

export default function ChecklistCreateView() {

    const navigate = useNavigate()
    const parsedDataUI: PreguntasDataUI  = PreguntasDataSchemaUI.parse(preguntasData)
    const params = useParams()
    const asignacionId = +params.asignacionId!

     // Inicializar formulario con el schema generado
     const { handleSubmit, formState: { errors, isDirty,isValid, isSubmitting }, control  } = useForm<ChecklistFormData>({
        resolver: zodResolver(checklistValidationSchema),
        defaultValues: {
            respuestas: {
                preguntas: parsedDataUI.preguntas.flatMap(seccion => seccion.items.map(preguntaUI => ({
                    idPregunta: preguntaUI.idPregunta,
                    tipo: preguntaUI.tipo,
                    respuesta: getDefaultValueForType(preguntaUI.tipo, preguntaUI.respuesta)
                }))) as ChecklistFormData['respuestas']['preguntas']
            }
        }
    })


    const { mutate } = useMutation({
        mutationFn: postChecklist,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if (data?.id) {
                toast.success(data.message)
                navigate(`/asignacion/${asignacionId}/createChecklist/${data.id}/uploadImages`);
           } else {
               // Manejar caso donde no viene ID? Navegar a otro sitio?
               console.warn("No se recibió ID después de guardar el checklist.");
               // navigate('/ruta/alternativa');
           }
        }
    })

    const handleCreateChecklist = (formData: ChecklistFormData) => {

        const respuestasMap = new Map<number, any>(); // Usamos 'any' temporalmente para la respuesta, Zod ya validó
        formData.respuestas.preguntas.forEach(preguntaValidada => {
            respuestasMap.set(preguntaValidada.idPregunta, preguntaValidada.respuesta);
        });

        const finalBody: BackendChecklistPayload = {
            checklist: {
                secciones: parsedDataUI.preguntas.map(seccionUI => ({
                    nombre: seccionUI.seccion,
                    preguntas: seccionUI.items.map(preguntaUI => {
                        const respuestaValidada = respuestasMap.get(preguntaUI.idPregunta)
                        const aplicaAValue = preguntaUI.aplicaA ?? "todos";
                        return{
                            idPregunta: preguntaUI.idPregunta,
                            pregunta: preguntaUI.pregunta,
                            respuesta: respuestaValidada !== undefined ? respuestaValidada : getDefaultValueForType(preguntaUI.tipo, null),
                            tipo: preguntaUI.tipo,
                            aplicaA: aplicaAValue
                        }
                    })
                }))
            }
        }
        const mutationArgs: PostChecklistArgs = {
            asignacionId,
            body: finalBody
        }
        mutate(mutationArgs)
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
                        errors={errors}
                        preguntasDataUI={parsedDataUI.preguntas}
                        control={control}
                    />
                    <input 
                        type="submit"
                        value={'Enviar Checklist'}
                        className={` w-full p-3 text-white uppercase font-bold transition-colors ${(!isDirty || !isValid || isSubmitting) ? "bg-gray-400 cursor-not-allowed" : "bg-red-800 hover:bg-red-900 cursor-pointer "}` }
                        disabled={!isDirty || !isValid || isSubmitting}
                    />
                </form>
                
            </div>
            
        </>
    )
}
