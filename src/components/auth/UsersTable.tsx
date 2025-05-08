import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { deleteUser } from "../../api/AuthAPI";
import { User } from "../../types";

export default function UsersTable({ data }: { data: User[] }) {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: deleteUser,
        onError: (error) => {
        toast.error(error.message);
        },
        onSuccess: (data) => {
        toast.success(data);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const handleDelete = async (userId: number) => {
        const result = await Swal.fire({
        title: "¿Eliminar Usuario?",
        text: "¡Esta acción eliminará al usuario y ya no tendrá acceso a la aplicación!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626", // Rojo
        cancelButtonColor: "#6B7280", // Gris
        confirmButtonText: "Sí, ¡eliminar!",
        cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
        mutate(userId);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 mt-10 shadow-lg rounded-lg">
            <div className="mt-8 flow-root ">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className=" min-w-full py-2 align-middle sm:px-6 lg:px-8 bg-white p-5 hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-300 ">
                        <thead>
                            <tr>
                            <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                            >
                                Nombre
                            </th>

                            <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                            >
                                Email
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Rol
                            </th>

                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                <span className="">Acciones</span>
                            </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.map((user) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {user.name} {user.lastname}
                                </td>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                {user.email}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">
                                {user.rol === 2 ? "Usuario" : "Administrador"}
                                </td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 ">
                                <div className="flex gap-5 justify-end items-center">
                                    <Link
                                    className=" text-indigo-600 hover:text-indigo-800"
                                    to={`/users/${user.id}/edit`}
                                    >
                                    {" "}
                                    Editar <span className="sr-only">, {}</span>
                                    </Link>
                                    <button
                                    type="button"
                                    className=" text-red-600 hover:text-red-800 cursor-pointer"
                                    onClick={() => handleDelete(user.id)}
                                    >
                                    Eliminar
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="sm:hidden space-y-4">
                    {data.map((user) => (
                    <div key={user.id} className="bg-white shadow-md rounded-lg p-4">
                        <p className="text-lg font-semibold text-gray-800">
                        {user.name} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                        <span className="font-medium">Rol:</span>{" "}
                        {user.rol === 2 ? "Usuario" : "Administrador"}
                        </p>
                        <div className="mt-3 flex justify-end gap-4">
                        <Link
                            to={`/users/${user.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                            Editar
                        </Link>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                            Eliminar
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
}
