import { FieldErrors, UseFormRegister, UseFormSetValue, useWatch, Control } from "react-hook-form"
import ErrorMessage from "../ui/ErrorMessage"
import { AdminUserEditFormData } from "../../types"
import { Rol } from "../../types/roles"

const ROLES: { value: Rol; label: string; desc: string }[] = [
    { value: Rol.CAPTURISTA, label: "Capturista", desc: "Checklists e inspecciones" },
    { value: Rol.VIGILANTE,  label: "Vigilante",  desc: "Entrada de unidades y fotos" },
    { value: Rol.ADMIN,      label: "Admin",       desc: "Visualización y reportes" },
    { value: Rol.SISTEMAS,   label: "Sistemas",    desc: "Acceso completo e imágenes" },
]

type EditFormProps = {
    register: UseFormRegister<AdminUserEditFormData>
    errors: FieldErrors<AdminUserEditFormData>
    setValue: UseFormSetValue<AdminUserEditFormData>
    control: Control<AdminUserEditFormData>
}

export default function EditForm({ register, errors, setValue, control }: EditFormProps) {
    const rolActual = useWatch({ control, name: "rol" })

    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo electrónico
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="correo@empresa.com"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg text-gray-700 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]
                        ${errors.email ? "border-red-400" : "border-gray-200"}`}
                    {...register("email", {
                        required: "El email es obligatorio",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "E-mail no válido",
                        },
                    })}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nombre
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Pedro"
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg text-gray-700 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]
                            ${errors.name ? "border-red-400" : "border-gray-200"}`}
                        {...register("name", {
                            required: "El nombre es obligatorio",
                        })}
                    />
                    {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                </div>

                <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Apellido
                    </label>
                    <input
                        id="lastname"
                        type="text"
                        placeholder="Reyes"
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg text-gray-700 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]
                            ${errors.lastname ? "border-red-400" : "border-gray-200"}`}
                        {...register("lastname", {
                            required: "El apellido es obligatorio",
                        })}
                    />
                    {errors.lastname && <ErrorMessage>{errors.lastname.message}</ErrorMessage>}
                </div>
            </div>

            <div>
                <p className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rol del sistema
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(({ value, label, desc }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setValue("rol", value, { shouldValidate: true })}
                            className={`flex flex-col text-left px-3 py-2.5 rounded-lg border text-sm transition
                                ${rolActual === value
                                    ? "border-[#0f1f3d] border-[1.5px] bg-[#0f1f3d]/5"
                                    : "border-gray-200 hover:border-[#0f1f3d]/40"
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
    )
}