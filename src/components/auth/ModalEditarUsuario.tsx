import { useForm } from "react-hook-form"
import { AdminUserEditFormData } from "../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { updateUser } from "../../api/AuthAPI"
import { toast } from "react-toastify"
import EditForm from "./EditForm"

type ModalEditarUsuarioProps = {
    isOpen: boolean
    onClose: () => void
    userId: number | null
    data: AdminUserEditFormData | null
}
 
export default function ModalEditarUsuario({ isOpen, onClose, userId, data }: ModalEditarUsuarioProps) {
    const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<AdminUserEditFormData>();
    const queryClient = useQueryClient();

    useEffect(() => {
        if(data) reset(data)
    }, [data, reset]);

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isOpen]);

     const { mutate, isPending } = useMutation({
        mutationFn: updateUser,
        onError: (error) => toast.error(error.message),
        onSuccess: (msg) => {
            toast.success(msg)
            queryClient.invalidateQueries({ queryKey: ["users"] })
            if (userId) queryClient.invalidateQueries({ queryKey: ["editUser", userId] })
            handleClose()
        },
    })
 
    function handleClose() {
        reset()
        onClose()
    }
 
    function handleFormSubmit(formData: AdminUserEditFormData) {
        if (!userId) return
        mutate({ formData, userId })
    }
 
    if (!isOpen) return null

    return (
        <div 
            onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden border border-gray-100 shadow-lg">
                <div className="bg-[#0f1f3d] px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className=" text-sm font-medium text-[#e8f0ff]">Editar Usario</p>
                        <p className=" text-sm text-[#7da6d4]">{data ? `${data.name} ${data.lastname}` : "Cargando..."}</p>
                    </div>
                     <button
                        onClick={handleClose}
                        className="text-[#7da6d4] hover:text-[#e8f0ff] transition-colors text-lg leading-none"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>
                  <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">
                        <EditForm
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            control={control}
                        />
                    </div>
 
                    {/* Footer */}
                    <div className="flex gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-9 px-4 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 h-9 text-sm font-medium text-white bg-[#0f1f3d] rounded-lg hover:bg-[#1a3a6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "Guardando..." : "Actualizar datos"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
