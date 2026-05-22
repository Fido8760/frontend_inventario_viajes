import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"
import AsignacionForm from "../../../components/admin/AsignacionForm"
import { AsignacionFormData } from "../../../types"
import { crearAsignacion, getCajas, getOperadores, getUnidades } from "../../../api/AsignacionAPI"

export default function CrearAsignacion() {
    const navigate = useNavigate()

    const initialValues: AsignacionFormData = {
        unidadId: 0,
        cajaId: 0,
        operadorId: 0
    }

    const { data: unidades } = useQuery({ queryKey: ['unidades'],   queryFn: getUnidades })
    const { data: cajas }    = useQuery({ queryKey: ['cajas'],      queryFn: getCajas })
    const { data: operadores } = useQuery({ queryKey: ['operadores'], queryFn: getOperadores })

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: initialValues
    })

    const unidadIdSeleccionada = watch("unidadId")
    const [cajaDisabled, setCajaDisabled] = useState(false)

    useEffect(() => {
        const unidad = unidades?.find(u => u.id === +unidadIdSeleccionada)
        if (unidad?.tipo_unidad === "MUDANCERO" || unidad?.tipo_unidad === "CAMIONETA") {
            setCajaDisabled(true)
            setValue("cajaId", 0)
        } else {
            setCajaDisabled(false)
        }
    }, [unidadIdSeleccionada, unidades, setValue])

    const { mutate, isPending } = useMutation({
        mutationFn: crearAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            if (data) {
                toast.success(data.message)
                navigate(`/asignacion/${data.id}/createChecklist`, { replace: true })
            }
        }
    })

    const handleForm = (formData: AsignacionFormData) => mutate(formData)

    return (
        <div className="max-w-xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                        to="/?page=1"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#0f1f3d]">1</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Nueva asignación</h1>
                        <p className="text-sm text-gray-500">Selecciona la unidad, remolque y operador</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <form
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                    className="p-6"
                >
                    <AsignacionForm
                        register={register}
                        errors={errors}
                        unidades={unidades || []}
                        cajas={cajas || []}
                        operadores={operadores || []}
                        cajaDisabled={cajaDisabled}
                    />

                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full mt-6 py-2.5 px-4 text-sm font-medium text-white rounded-lg transition-colors ${
                            isPending
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#0f1f3d] hover:bg-[#1a3a6b]'
                        }`}
                    >
                        {isPending ? 'Creando...' : 'Crear asignación'}
                    </button>
                </form>
            </div>
        </div>
    )
}