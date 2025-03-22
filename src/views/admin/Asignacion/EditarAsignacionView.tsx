import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getAsignacionById } from "../../../api/AsignacionAPI"
import EditarAsignacionForm from "../../../components/admin/EditarAsignacionForm"


export default function EditarAsignacionView() {

  const params = useParams()
  const asignacionId = +params.asignacionId!

  const { data, isLoading, isError} = useQuery({
    queryKey: ['editarAsignacion', asignacionId],
    queryFn: () => getAsignacionById(asignacionId),
    retry: false
  })

  if(isLoading) return 'Cargando...'
  if(isError) return <Navigate to={'/404'} />

  if(data) return (
    <EditarAsignacionForm 
      data={data}
      asignacionId={asignacionId}
    />
  )
}
