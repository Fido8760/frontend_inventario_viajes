import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { deleteUser } from "../../api/AuthAPI";
import { User } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
    data: User[]
    onEdit: (user: User) => void
}

export default function UsersTable({ data, onEdit }: Props) {
    const queryClient = useQueryClient()
    const { data: authUser } = useAuth()

    const { mutate } = useMutation({
        mutationFn: deleteUser,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })

    const handleDelete = async (userId: number) => {
        const result = await Swal.fire({
            title: "¿Eliminar Usuario?",
            text: "¡Esta acción eliminará al usuario y ya no tendrá acceso a la aplicación!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Sí, ¡eliminar!",
            cancelButtonText: "Cancelar",
        })

        if (result.isConfirmed) mutate(userId)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Usuarios Registrados</p>
                    <p className="text-xs text-gray-400 mt-0.5">{data.length} usuarios</p>
                </div>
            </div>

            <div className="overflow-x-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Usuario</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Correo</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Rol</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((user) => {
                            const roleStyles = {
                                SISTEMAS: "bg-blue-50 text-blue-700",
                                ADMIN: "bg-green-50 text-green-700",
                                VIGILANTE: "bg-amber-50 text-amber-700",
                            }

                            return (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name} {user.lastname}</p>
                                            <p className="text-xs text-gray-400">ID #{user.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleStyles[user.rol as keyof typeof roleStyles] ?? "bg-gray-100 text-gray-700"}`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {authUser?.email !== user.email && (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(user)}
                                                    className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                                                >
                                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="flex items-center gap-1 text-xs text-red-500 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 transition-colors"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}