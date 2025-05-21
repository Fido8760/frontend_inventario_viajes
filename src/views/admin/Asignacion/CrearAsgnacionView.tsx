import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import AsignacionForm from "../../../components/admin/AsignacionForm"
import { AsignacionFormData } from "../../../types"
import { crearAsignacion, getCajas, getOperadores, getUnidades } from "../../../api/AsignacionAPI"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { useEffect, useState } from "react"



export default function CrearAsgnacion() {

    const navigate = useNavigate()
    const initialValues : AsignacionFormData = {
        unidadId: 0,
        cajaId: 0,
        operadorId: 0
    }

    const { data: unidades } = useQuery({
        queryKey: ['unidades'],
        queryFn: getUnidades
    })

    const { data: cajas } = useQuery({
        queryKey: ['cajas'],
        queryFn: getCajas
    })

    const { data: operadores } = useQuery({
        queryKey: ['operadores'],
        queryFn: getOperadores
    })

    const {register , handleSubmit, formState: {errors}, watch, setValue} = useForm({defaultValues: initialValues})

    const unidadIdSeleccionada = watch("unidadId")
    const [cajaDisabled, setCajaDisabled] = useState(false)
    
    useEffect(() => {
        const unidad = unidades?.find(unidad => unidad.id === +unidadIdSeleccionada)
        if(unidad?.tipo_unidad === "MUDANCERO" || unidad?.tipo_unidad === "CAMIONETA") {
            setCajaDisabled(true)
            setValue("cajaId", 0)
        } else {
            setCajaDisabled(false)
        }
    },[unidadIdSeleccionada, unidades, setValue])

    const {mutate} = useMutation({
        mutationFn: crearAsignacion,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if(data) {
                toast.success(data.message)
                navigate(`/asignacion/${data.id}/createChecklist`, { replace: true })
            }
        }
    })

    const handleForm = (formData: AsignacionFormData) => mutate(formData)
    return (
        <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Paso 1: Crear Asignación</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">Selecciona la Unidad, Remolque y el nombre del Operador</p>
                <nav className=" my-5">
                <Link
                    className="  bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
                    to={'/?page=1'}
                >Volver</Link>
                </nav>
                <form 
                    className=" mt-10 bg-white shadow-lg p-10 rounded-lg"
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                >
                    <AsignacionForm
                        register={register}
                        errors={errors}
                        unidades={unidades || []}
                        cajas={cajas || []}
                        operadores={operadores || []}
                        cajaDisabled={cajaDisabled}
                    />
                    <input 
                        type="submit"
                        value={'Crear Asignación'}
                        className=" bg-red-800 hover:bg-red-900 w-full p-3 text-white uppercase font-bold cursor-pointer transition-colors"
                    />
                </form>
                
            </div>
            
        </>
    )
}
