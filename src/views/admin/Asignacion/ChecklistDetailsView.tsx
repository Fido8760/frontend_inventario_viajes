
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAsignacionById } from '../../../api/AsignacionAPI'
import DetallesAsigancion from '../../../components/admin/DetallesAsigancion'

export default function ChecklistDetailsView() {
    const params = useParams()
    const asignacionId = +params.asignacionId!

    const { data, isLoading} = useQuery({
        queryKey: ['Asignacion', asignacionId],
        queryFn: () => getAsignacionById(asignacionId),
        retry: false
    })

    if(isLoading) return 'Cargando...'


    if(data) return (
        <>
            <div className=' flex flex-col'>

                <h1 className='text-3xl font-bold'> Checklist de la Unidad {data.unidad.no_unidad}</h1>
                <p className=' text-2xl font-light text-gray-500 mt-5'>Aquí esta el resultado del checklist realizado</p>

                <nav className="flex flex-col md:flex-row gap-4 mt-4"> 
                    <Link
                        to={'/'}
                        className="bg-blue-800 hover:bg-blue-900 px-10 py-3 rounded-md text-white text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center"
                    >
                    Volver
                    </Link>

                    <button
                        className="bg-red-800 hover:bg-red-900 px-10 py-3 rounded-md text-white text-sm uppercase font-bold cursor-pointer transition-colors w-full md:w-auto text-center"
                    >
                        Editar Checklist
                    </button>
                </nav>
                <DetallesAsigancion 
                    data={data}
                />




            </div>
        </>
    )
}
