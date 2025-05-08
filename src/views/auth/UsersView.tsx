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
    if (isError) return <Navigate to={"/404"} />
    if (data) return (
        <>
           <h1 className=" text-3xl font-bold">Usuarios Registrados</h1>
            <p className=" text-xl font-light text-gray-500 mt-5">
                Gestiona los usuarios de la aplicación
            </p>
            <nav className=" my-5">
                <Link
                    className=" bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
                    to={"/users/register"}
                >
                    Agregar Usuario
                </Link>
            </nav>
            {data.length === 0 ? (
                <p>No hay usuarios registrados todavía</p>
            ) : (

                <UsersTable 
                    data={data}
                />
            )}
        </>
    )
}
