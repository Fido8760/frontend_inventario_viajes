import { Fragment, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAsignacion, getAsignaciones } from "../../api/AsignacionAPI";
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-toastify';
import { isValidPage } from '../../utils/valdateParams';
import Pagination from '../../components/ui/Pagination';


export default function DashboardView() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const page = searchParams.get('page')!
    if(!isValidPage(+page)) navigate('/?page=1')
    
    const productsPerPage = 5
    const skip = (+page - 1) * productsPerPage

    const {data, isLoading} = useQuery({
      queryKey: ["asignaciones", page],
      queryFn: () => getAsignaciones(productsPerPage, skip)
    })

    const queryClient = useQueryClient()

    const { mutate } =  useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ["asignaciones", page]})
        }
    })

    useEffect(() => {
        if (!isValidPage(+page)) {
            navigate('/?page=1');
        }
    }, [page, navigate]);
      
      useEffect(() => {
        if (data) {
            const totalPages = Math.ceil(data.count / productsPerPage);
            if (+page > totalPages) {
                navigate('/?page=1');
            }
        }
    }, [data, page, navigate]);

    const totalPages = Math.ceil(data?.count! / productsPerPage)
    if(+page > totalPages) navigate('/?page=1')


    if(isLoading) return 'Cargando'
    if(data) return (
      <>
        <h1 className=" text-3xl font-bold">Inventario de Viajes</h1>
        <p className=" text-xl font-light text-gray-500 mt-5">Maneja y Administra los Checklist de las unidades</p>
        <nav className=" my-5">
          <Link
            className=" bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
            to={'/asignacion/create'}
          >Crear Checklist</Link>
        </nav>
        {data.rows.length ? (
            <>
                <ul role="list" className="divide-y divide-gray-100 border border-gray-100 mt-10 bg-white shadow-lg">
                {data.rows.map((asignacion) => (
                    <li key={asignacion.id} className="flex justify-between gap-x-6 px-5 py-10">
                        <div className="flex min-w-0 gap-x-4">
                            <div className="min-w-0 flex-auto space-y-2">
                                <Link to={`/asignacion/${asignacion.id}`}
                                    className="text-gray-600 cursor-pointer hover:underline text-3xl font-bold"
                                >Unidad: {asignacion.unidad.no_unidad}</Link>
                                <p className="text-sm text-gray-400">
                                    Placas Unidad: {asignacion.unidad.u_placas}
                                </p>
                                {(asignacion.caja?.c_placas ? (
                                    <p className="text-sm text-gray-400">
                                        Placas Caja: {asignacion.caja?.c_placas}
                                    </p>
                                ) : (
                                    <p></p>

                                ))}
                                <p className="text-sm text-gray-400">
                                    Operador: {asignacion.operador.nombre} {asignacion.operador.apellido_p} {asignacion.operador.apellido_m}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Checklist Realizado por: { asignacion.usuario.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Creado el { formatDate(asignacion.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-x-6">
                            <Menu as="div" className="relative flex-none">
                                <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                    <span className="sr-only">opciones</span>
                                    <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items
                                        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                                    >
                                            <Menu.Item>
                                                <Link to={`/asignacion/${asignacion.id}`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                Ver Checklist
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link to={`/asignacion/${asignacion.id}/edit`}
                                                    className='block px-3 py-1 text-sm leading-6 text-gray-900'>
                                                Editar Checklist
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <button 
                                                    type='button' 
                                                    className='block px-3 py-1 text-sm leading-6 text-red-500'
                                                    onClick={() => mutate(asignacion.id) }
                                                >
                                                    Eliminar Checklist
                                                </button>
                                            </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </li>
                ))}
            </ul>

            <Pagination 
                page={+page}
                totalPages={totalPages}
            />
        </>

        ) : (
          <p className=" text-center py-20">
            No hay Asignaciones
          </p>
        )}
      </>
    )
}
