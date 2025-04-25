import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query'
import ErrorMessage from "../../components/ui/ErrorMessage";
import { UserLoginForm } from "../../types";
import { authenticateUser } from "../../api/AuthAPI";
import { toast } from "react-toastify";

export default function LoginView() {
    const navigate = useNavigate()
    const initialValues : UserLoginForm = {
        email: '',
        password: ''
    }
    const { register, handleSubmit, formState: {errors}} = useForm({defaultValues: initialValues})

    const { mutate } = useMutation({
        mutationFn: authenticateUser,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            navigate('/?page=1')
        }
    })

    const handleLogin = (formData : UserLoginForm) => mutate(formData)
    return (
        <>
            <h1 className=" text-4xl font-bold">Iniciar Sesión</h1>

            <form 
                onSubmit={handleSubmit(handleLogin)}
                className="bg-white px-5 py-20 rounded-lg space-y-10 mt-10 shadow-md"
                noValidate
            >
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="email" className="text-2xl text-slate-500">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Email de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("email", {
                            required: "El Email es obligatorio",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "E-mail no válido",
                            },
                        })}
                    />
                    {errors.email && (
                        <ErrorMessage>{errors.email.message}</ErrorMessage>
                    )}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password" className="text-2xl text-slate-500">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("password", {
                            required: "El Password es obligatorio",
                        })}
                    />
                    {errors.password && (
                        <ErrorMessage>{errors.password.message}</ErrorMessage>
                    )}
                </div>

                <input
                    type="submit"
                    className="bg-cyan-400 p-3 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
                    value='Iniciar Sesión'
                />
            </form>

            <nav className=" mt-10">
                <Link 
                    className=" text-center text-lg block"
                    to={'/auth/forgot-password'}
                >
                    ¿Olvidaste tu password? Recupéralo aquí
                </Link>
            </nav>
        
        </>
    )
}
