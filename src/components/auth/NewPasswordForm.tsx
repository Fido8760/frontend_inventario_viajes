import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import ErrorMessage from "../ui/ErrorMessage"
import { updatePasswordWithToken } from "../../api/AuthAPI"
import type { ConfirmToken, NewPasswordForm as NPasswordForm } from "../../types"

export default function NewPasswordForm({ token }: { token: ConfirmToken['token'] }) {
    const navigate = useNavigate()
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<NPasswordForm>({
        defaultValues: { password: '', password_confirmation: '' }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updatePasswordWithToken,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => { toast.success(data); reset(); navigate('/auth/login') }
    })

    const password = watch('password')

    return (
        <form onSubmit={handleSubmit((formData) => mutate({ formData, token }))} noValidate className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">Nueva contraseña</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Elige una contraseña segura para tu cuenta.</p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Nueva contraseña</label>
                <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="text-sm px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-slate-800"
                    {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" }
                    })}
                />
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Repetir contraseña</label>
                <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    className="text-sm px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-slate-800"
                    {...register("password_confirmation", {
                        required: "Confirma tu contraseña",
                        validate: value => value === password || 'Las contraseñas no coinciden'
                    })}
                />
                {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-[#0f1f3d] hover:bg-[#1a3260] active:scale-[0.98] text-white rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-60 cursor-pointer mt-2"
            >
                {isPending ? 'Guardando...' : 'Establecer contraseña'}
            </button>
        </form>
    )
}