import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordForm } from "../../types";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { forgotPassword } from "../../api/AuthAPI";
import { toast } from "react-toastify";

export default function ForgotPasswordView() {
    const initialValues: ForgotPasswordForm = {
        email: "",
    };
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues })

    const {mutate } = useMutation({
        mutationFn: forgotPassword,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            reset()
        }
    })

    const handleForgotPassword = (formData: ForgotPasswordForm) => mutate(formData);

    return (
        <>
            <h1 className=" text-3xl font-bold">Reestablecer Password</h1>
            <p className=" text-xl font-light text-gray-500 mt-5">
                ¿Olvidaste tu password? Ingresa tu cuenta de correo electornico y te enviaremos un enlace para reestablecer tu password
            </p>
            <form
                onSubmit={handleSubmit(handleForgotPassword)}
                className="bg-white px-5 py-20 rounded-lg space-y-10 mt-10 shadow-md"
                noValidate
            >
                <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="email" className="text-2xl text-slate-500">
                    E-mail
                </label>
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
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </div>

                <input
                    type="submit"
                    value="Enviar Instrucciones"
                    className="bg-cyan-400 hover:bg-cyan-500 p-3 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
                />
            </form>

            <nav className="mt-10 flex flex-col space-y-4">
                <Link to="/auth/login" className="text-center text-lg block">
                    ¿Ya tienes cuenta? Iniciar Sesión
                </Link>
            </nav>
        </>
    );
}
