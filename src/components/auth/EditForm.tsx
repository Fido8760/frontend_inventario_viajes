import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ui/ErrorMessage";
import { AdminUserEditFormData } from "../../types";

type EditFormProps = {
    register: UseFormRegister<AdminUserEditFormData>;
    errors: FieldErrors<AdminUserEditFormData>;
};

export default function EditForm({ register, errors }: EditFormProps) {
    return (
        <>
            <div className="flex flex-col gap-5">
                <label 
                    className="font-normal text-2xl" 
                    htmlFor="email"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email de Registro"
                    className="w-full p-3  border-gray-300 border"
                    {...register("email", {
                        required: "El Email de registro es obligatorio",
                        pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "E-mail no válido",
                        },
                    })}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </div>

            <div className="flex flex-col gap-5">
                <label 
                    className="font-normal text-2xl"
                    htmlFor="name"
                >
                    Nombre
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nombre de Registro"
                    className="w-full p-3  border-gray-300 border"
                    {...register("name", {
                        required: "El Nombre de usuario es obligatorio",
                    })}
                />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            <div className="flex flex-col gap-5">
                <label 
                    className="font-normal text-2xl"
                    htmlFor="lastname"
                >
                    Apellido
                </label>
                <input
                    type="text"
                    id="lastname"
                    placeholder="Nombre de Registro"
                    className="w-full p-3  border-gray-300 border"
                    {...register("lastname", {
                        required: "El apellido es obligatorio",
                    })}
                />
                {errors.lastname && (
                    <ErrorMessage>{errors.lastname.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label 
                    className="font-normal text-2xl"
                    htmlFor="rol"
                >
                    Rol
                </label>
                <select 
                    id="rol"
                    className="border p-2 w-full"
                    {...register("rol", {
                        required: "Seleccione un rol",
                        valueAsNumber: true
                    })}
                >
                    <option value="" disabled>--Sleccione--</option>
                    <option value="1">Administrador</option>
                    <option value="2">Usuario</option>

                </select>
                {errors.lastname && (
                    <ErrorMessage>{errors.lastname.message}</ErrorMessage>
                )}
            </div>
        </>
    )
}
