import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ui/ErrorMessage";
import { UserRegistrationForm } from "../../types";

type UserFormProps = {
    register: UseFormRegister<UserRegistrationForm>;
    errors: FieldErrors<UserRegistrationForm>;
    password: string;
};

export default function UserForm({ register, errors, password, }: UserFormProps) {
    return (
        <div className="space-y-5">

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    Correo electrónico
                </label>

                <input
                    id="email"
                    type="email"
                    placeholder="correo@empresa.com"
                    className=" w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]"
                    {...register("email", {
                        required: "El Email de registro es obligatorio",
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

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    Nombre
                </label>

                <input
                    id="name"
                    type="text"
                    placeholder="Nombre"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]"
                    {...register("name", {
                        required: "El Nombre de usuario es obligatorio",
                    })}
                />

                {errors.name && (
                    <ErrorMessage>{errors.name.message}</ErrorMessage>
                )}
            </div>

            <div>
                <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    Apellidos
                </label>

                <input
                    id="lastname"
                    type="text"
                    placeholder="Apellidos"
                    className=" w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]"
                    {...register("lastname", {
                        required: "El apellido es obligatorio",
                    })}
                />

                {errors.lastname && (
                    <ErrorMessage>{errors.lastname.message}</ErrorMessage>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    Contraseña
                </label>

                <input
                    id="password"
                    type="password"
                    placeholder="********"
                    className=" w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]"
                    {...register("password", {
                        required: "El Password es obligatorio",
                        minLength: {
                            value: 8,
                            message: "El Password debe ser mínimo de 8 caracteres",
                        },
                    })}
                />

                {errors.password && (
                    <ErrorMessage>{errors.password.message}</ErrorMessage>
                )}
            </div>

            <div>
                <label
                    htmlFor="password_confirmation"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    Confirmar contraseña
                </label>

                <input
                    id="password_confirmation"
                    type="password"
                    placeholder="********"
                    className=" w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d]"
                    {...register("password_confirmation", {
                        required: "Repetir Password es obligatorio",
                        validate: value =>
                            value === password || "Los Passwords no son iguales",
                    })}
                />

                {errors.password_confirmation && (
                    <ErrorMessage>
                        {errors.password_confirmation.message}
                    </ErrorMessage>
                )}
            </div>

        </div>
    );
}