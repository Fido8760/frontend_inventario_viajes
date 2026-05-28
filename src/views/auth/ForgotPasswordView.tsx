import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordForm } from "../../types";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { forgotPassword } from "../../api/AuthAPI";
import { toast } from "react-toastify";

export default function ForgotPasswordView() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ForgotPasswordForm>({
        defaultValues: { email: "" }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: forgotPassword,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => { toast.success(data); reset() }
    })

    return (
        <form onSubmit={handleSubmit((data) => mutate(data))} noValidate className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
                <p className=" text-2xl sm:text-3xl font-bold text-slate-900">Reestablece tu contraseña</p>
                <p className=" text-slate-500 text-xs sm:text-sm mt-1.5">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className=" text-xs font-semibold text-gray-500">Correo electrónico</label>
                <input 
                    type="email" 
                    id="email"
                    placeholder="usuario@empresa.com"
                    className="text-sm px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-slate-800"
                    {...register("email", {
                        required: "El email es obligatorio",
                        pattern: { value: /\S+@\S+\.\S+/, message: "Email no válido" }
                    })}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="bg-[#0f1f3d] hover:bg-[#1a3260] active:scale-[0.98] text-white rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-60 cursor-pointer mt-2"
            >{isPending ? 'Enviando...' : 'Enviar Insrucciones'}</button>

            <Link to="/auth/login" className="text-xs text-blue-500 text-center hover:underline py-2">
                ¿Ya tienes una cuenta? Inicia sesión
            </Link>
        </form>
    )
}