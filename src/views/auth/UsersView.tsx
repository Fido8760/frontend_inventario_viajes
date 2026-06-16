import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Navigate } from "react-router-dom"
import { createAccount, getUsers } from "../../api/AuthAPI"
import UsersTable from "../../components/auth/UsersTable"
import ModalNuevoUsuario from "../../components/auth/ModalNuevoUsuario"
import ModalEditarUsuario from "../../components/auth/ModalEditarUsuario"
import { useState } from "react"
import { toast } from "react-toastify"
import { AdminUserEditFormData, User } from "../../types"

export default function UsersView() {
    // --- Modal nuevo usuario ---
    const [createOpen, setCreateOpen] = useState(false)

    // --- Modal editar usuario ---
    const [editOpen, setEditOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<{ id: number; data: AdminUserEditFormData } | null>(null)

    const queryClient = useQueryClient()

    const { mutateAsync: mutateCreate, isPending: isCreating } = useMutation({
        mutationFn: createAccount,
        onError: (error) => toast.error(error.message),
        onSuccess: (msg) => {
            toast.success(msg)
            queryClient.invalidateQueries({ queryKey: ["users"] })
            setCreateOpen(false)
        },
    })

    const { data, isLoading, isError } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    })

    function handleEdit(user: User) {
        setSelectedUser({
            id: user.id,
            data: {
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                rol: user.rol,
            },
        })
        setEditOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <span className="text-xl text-gray-600 animate-pulse">Cargando usuarios...</span>
            </div>
        )
    }

    if (isError) return <Navigate to="/404" />
    if (!data) return null

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900">Usuarios</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Administración de usuarios y permisos</p>
                </div>

                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 bg-[#0f1f3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1a3a6b] transition-colors"
                >
                    Nuevo usuario
                </button>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center py-32 text-gray-400">
                    <p className="text-sm">No hay usuarios registrados</p>
                </div>
            ) : (
                <UsersTable data={data} onEdit={handleEdit} />
            )}

            <ModalNuevoUsuario
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={mutateCreate}
                isLoading={isCreating}
            />

            <ModalEditarUsuario
                isOpen={editOpen}
                onClose={() => { setEditOpen(false); setSelectedUser(null) }}
                userId={selectedUser?.id ?? null}
                data={selectedUser?.data ?? null}
            />
        </div>
    )
}