import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom'
import { AdminUserEditFormData } from '../../types';
import EditForm from './EditForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../../api/AuthAPI';
import { toast } from 'react-toastify';

type EditUserFormProps = {
    data: AdminUserEditFormData
    userId: number
}

export default function EditUserForm({data, userId} : EditUserFormProps) {

    const initialValues: AdminUserEditFormData = {
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        rol: data.rol
    }
    
    const { register, handleSubmit, formState: { errors } } = useForm<AdminUserEditFormData>({ defaultValues: initialValues });

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { mutate } = useMutation({
        mutationFn: updateUser,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ["users"] }); 
            queryClient.invalidateQueries({ queryKey: ['editUser', userId] });
            navigate('/users')
        }
    })

    const handleForm = (formData: AdminUserEditFormData) => {
        const data = {
            formData,
            userId
        }

        mutate(data)
    }

    return (
        <>
            <h1 className=" text-3xl font-bold">Actualizar datos de Usuario</h1>
            <p className=" text-xl font-light text-gray-500 mt-5">
                Llena el formulario para la actualización de datos
            </p>
            <nav className=" my-5">
                <Link
                    className=" bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
                    to={"/users"}
                >
                Volver
                </Link>
            </nav>
            <form
                onSubmit={handleSubmit(handleForm)}
                className="space-y-8 p-10  bg-white mt-10"
                noValidate
            >
                <EditForm 
                    register={register}
                    errors={errors}
                />
            
                <input
                    type="submit"
                    value='Actualizar Datos'
                    className="bg-blue-900 hover:bg-blue-950 w-full p-3  text-white font-black  text-xl cursor-pointer"
                />
            </form>
        </>
    )
}
