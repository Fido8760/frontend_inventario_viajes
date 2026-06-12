import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { getUsers } from "../../api/AuthAPI";
import UsersTable from "../../components/auth/UsersTable";

export default function UsersView() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers
    })

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <span className="text-xl text-gray-600 animate-pulse">Cargando usuarios...</span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-32">
                <p className=" text-gray-400 text-sm">Cargando usuarios...</p>
            </div>
        );
    }

    if(isError) return <Navigate to={"/404"} />

    if(!data) return null;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className=" text-2xl font-medium text-gray-900">Usuarios</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Administración de usuarios y permisos</p>
                </div>

                <Link 
                    to={"/users/register"}
                    className="flex items-center gap-2 bg-[#0f1f3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1a3a6b] transition-colors no-underline"
                >
                    Nuevo usuario
                </Link>
            </div>

            {data.length === 0 ? (
                <div className=" flex flex-col items-center py-32 text-gray-400">
                    <p className=" text-sm">No hay usuarios registrados</p>
                </div>
            ) : (
                <UsersTable data={data} />
            )}
        </div>
    )
}
