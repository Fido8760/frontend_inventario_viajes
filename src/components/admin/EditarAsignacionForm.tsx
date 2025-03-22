import AsignacionForm from "./AsignacionForm";
import { Link, useNavigate } from "react-router-dom";
import { Asignacion, AsignacionFormData } from "../../types";
import { useForm } from "react-hook-form";
import { getCajas, getOperadores, getUnidades, updateAsignacion } from "../../api/AsignacionAPI";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type EditarAsignacionFormProps = {
  data: AsignacionFormData;
  asignacionId: Asignacion['id']
};

export default function EditarAsignacionForm({ data, asignacionId }: EditarAsignacionFormProps) {
    const navigate = useNavigate()

    const initialValues: AsignacionFormData = {
        unidadId: data.unidadId,
        cajaId: data.cajaId,
        operadorId: data.operadorId,
    };

    const queryClient = useQueryClient()

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

    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

    const { mutate } = useMutation({
        mutationFn: updateAsignacion,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['editarAsignacion', asignacionId] })
            toast.success(data)
            navigate('/')
        }
    })

  const handleForm = (formData: AsignacionFormData) => {
    const data = {
        formData,
        asignacionId
    }
    mutate(data)
  };

    return (
            <>
            <div className=" max-w-3xl mx-auto">
                <h1 className=" text-3xl font-black">Editar Asignación</h1>
                <p className=" text-xl font-light text-gray-500 mt-5">
                    Selecciona la Unidad, Remolque y el nombre del Operador
                </p>
                <nav className=" my-5">
                    <Link
                        className="  bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
                        to={"/"}
                    >
                        Volver
                    </Link>
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
                    />
                    <input
                        type="submit"
                        value={"Guardar Cambios"}
                        className=" bg-red-800 hover:bg-red-900 w-full p-3 text-white uppercase font-bold cursor-pointer transition-colors"
                    />
                </form>
            </div>
        </>
    );
}
