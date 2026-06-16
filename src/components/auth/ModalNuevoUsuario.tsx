import { useForm } from "react-hook-form";
import { UserRegistrationForm } from "../../types";
import { Rol } from "../../types/roles";
import { useEffect } from "react";
import UserForm from "./UserForm";
import ErrorMessage from "../ui/ErrorMessage";

const ROLES: { value: Rol; label: string; desc: string }[] = [
    { value: Rol.CAPTURISTA, label: "Capturista", desc: "Checklists e inspecciones" },
    { value: Rol.VIGILANTE,  label: "Vigilante",  desc: "Entrada de unidades y fotos" },
    { value: Rol.ADMIN,      label: "Admin",       desc: "Visualización y reportes" },
    { value: Rol.SISTEMAS,   label: "Sistemas",    desc: "Acceso completo e imágenes" },
]

type ModalNuevoUsuarioProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserRegistrationForm) => void;
    isLoading: boolean;
}

export default function ModalNuevoUsuario({ isOpen, onClose, onSubmit, isLoading }: ModalNuevoUsuarioProps) {
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =useForm<UserRegistrationForm>({defaultValues: { rol: Rol.CAPTURISTA }});
    const password = watch("password");
    const rolActual = watch("rol");

    useEffect(() => {
        register("rol", { required: "Selecciona un rol" })
    }, [register]);

    useEffect(() => {
        if(!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isOpen]);

    function handleClose() {
        reset();
        onClose();
    }

    async function handleFormSubmit(data: UserRegistrationForm) {
        await onSubmit(data);
        reset()
    }

    if(!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => { if(e.target === e.currentTarget) handleClose() }}
        >
            <div className=" bg-white rounded-xl w-full max-w-md overflow-hidden border border-gray-100 shadow-lg">
                <div className="bg-[#0f1f3d] p-5 py-4 flex items-center justify-between">
                    <div>
                        <p className=" text-sm font-medium text-[#e8f0ff]">Nuevo Usuario</p>
                        <p className=" text-xs text-[#7da6d4] mt-0.5">Administración de usuarios y permisos</p>
                    </div>
                    <button
                        onClick={handleClose}
                        aria-label="Cerrar"
                        className="text-[#7da6d4] hover:text-[#e8f0ff] transition-colors text-lg leading-none"
                    >
                        X
                    </button>
                </div>
                <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                        <UserForm 
                            register={register}
                            errors={errors}
                            password={password}
                        />
                        <div>
                            <p className=" block text-sm font-medium text-gray-700 mb-1.5">
                                Rol del sistema
                            </p>
                            <div className=" grid grid-cols-2 gap-2">
                                {ROLES.map(({ value, label, desc }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setValue("rol", value, { shouldValidate: true })}
                                        className={`flex flex-col text-left px-3 py-2.5 rounded-lg border text-sm transition ${ rolActual === value 
                                            ? 'border-[#0f1f3d] border-[1.5px] bg-[#0f1f3d]/5'
                                            : 'border-gray-200 hover:border-[#0f1f3d]/40' 
                                        }`}
                                    >
                                        <span className={`font-medium ${rolActual === value ? "text-[#0f1f3d]" : "text-gray-700"}`}>
                                            {label}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-0.5">{desc}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.rol && <ErrorMessage>{errors.rol.message}</ErrorMessage>}
                        </div>
                    </div>
                    <div className="flex gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleClose}
                            className=" h-9 px-4 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className=" flex-1 h-9 text-sm font-medium text-white bg-[#0f1f3d] rounded-lg hover:bg-[#1a3a6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? "Guardando..." : "Guardar usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
