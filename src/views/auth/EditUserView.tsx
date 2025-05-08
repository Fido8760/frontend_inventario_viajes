import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getUsersById } from "../../api/AuthAPI"
import EditUserForm from "../../components/auth/EditUserForm"

export default function EditUserView() {

    const param = useParams()
    const userId = +param.userId!

    const { data, isLoading, isError } = useQuery({
        queryKey: ['editUser', userId],
        queryFn: () => getUsersById(userId),
        retry: false
    })

    if(isLoading) return 'Cargando...'
    if(isError) return <Navigate to={'/404'} />
    if(data) return (
        <EditUserForm 
            data={data}
            userId={userId}
        />
    )
}
