import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAsignacion, getAsignaciones, getAsignacionesSearch } from "../../api/AsignacionAPI";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";
import { isValidPage } from "../../utils/valdateParams";
import Pagination from "../../components/ui/Pagination";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";

export default function DashboardView() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const { data: authenticatedUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    const page = +searchParams.get("page")!;
    const productsPerPage = 5;
    const skip = (page - 1) * productsPerPage;

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data, isLoading } = useQuery({
        queryKey: ["asignaciones", page, debouncedSearchTerm],
        queryFn: () => 
            debouncedSearchTerm 
                ? getAsignacionesSearch(debouncedSearchTerm) 
                : getAsignaciones(productsPerPage, skip),
    });

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
        },
    });

    useEffect(() => {
        if (!isValidPage(page)) {
            setShouldRedirect(true);
            return;
        }

        if (data && !debouncedSearchTerm) {
            const totalPages = Math.ceil(data.count / productsPerPage);
            if (page > totalPages) {
                setShouldRedirect(true);
            }
        }
    }, [page, data, debouncedSearchTerm]);

    useEffect(() => {
        if (shouldRedirect) {
            navigate("/?page=1");
            setShouldRedirect(false);
        }
    }, [shouldRedirect, navigate]);

    const handleDelete = async (asignacionIdToDelete: number) => {
        const result = await Swal.fire({
            title: "¿Eliminar Asignación?",
            text: "¡Esta acción eliminará la asignación y TODOS sus checklists asociados! No se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Sí, ¡eliminar!",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            mutate(asignacionIdToDelete);
        }
    };

    if (isLoading) return "Cargando...";
    if (!data) return null;

    const totalPages = debouncedSearchTerm ? 1 : Math.ceil(data.count / productsPerPage);

    return (
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="order-1 md:order-none">
                    <h1 className="text-2xl md:text-3xl font-bold">Inventario de Viajes</h1>
                    <p className="text-lg md:text-xl font-light text-gray-500 mt-1 md:mt-2">
                        Maneja y Administra los Checklist de las unidades
                    </p>
                </div>
                
                <div className="relative w-full md:w-1/3 order-3 md:order-none">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

                    </div>
                    <input
                        type="text"
                        className="block w-full p-2 md:p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar por unidad, placas, operador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <nav className="order-2 md:order-none my-2 md:my-0">
                    <Link
                        className="inline-block w-full md:w-auto text-center bg-blue-800 hover:bg-blue-900 rounded-md px-6 md:px-10 py-2 md:py-3 text-white text-lg md:text-xl font-bold cursor-pointer transition-colors"
                        to={"/asignacion/create"}
                    >
                        Crear Checklist
                    </Link>
                </nav>
            </div>

            {data.rows.length ? (
                <>
                    <ul
                        role="list"
                        className="divide-y divide-gray-100 border border-gray-100 mt-10 bg-white shadow-lg"
                    >
                        {data.rows.map((asignacion) => (
                            <li
                                key={asignacion.id}
                                className="flex justify-between gap-x-6 px-5 py-10"
                            >
                                <div className="flex min-w-0 gap-x-4">
                                    <div className="min-w-0 flex-auto space-y-2">
                                        <Link
                                            to={`/asignacion/${asignacion.id}`}
                                            className="text-gray-600 cursor-pointer hover:underline text-3xl font-bold"
                                        >
                                            Unidad: {asignacion.unidad.no_unidad}
                                        </Link>
                                        <p className="text-sm text-gray-400">
                                            Placas Unidad: {asignacion.unidad.u_placas}
                                        </p>
                                        {asignacion.caja?.c_placas && (
                                            <p className="text-sm text-gray-400">
                                                Placas Caja: {asignacion.caja?.c_placas}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-400">
                                            Operador: {asignacion.operador.nombre}{" "}
                                            {asignacion.operador.apellido_p}{" "}
                                            {asignacion.operador.apellido_m}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Checklist Realizado por: {asignacion.usuario.name} {asignacion.usuario.lastname}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Creado el {formatDate(asignacion.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-x-6">
                                    <Menu as="div" className="relative flex-none">
                                        <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                            <span className="sr-only">opciones</span>
                                            <EllipsisVerticalIcon
                                                className="h-9 w-9"
                                                aria-hidden="true"
                                            />
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                                <Menu.Item>
                                                    <Link
                                                        to={`/asignacion/${asignacion.id}`}
                                                        className="block px-3 py-1 text-sm leading-6 text-gray-900"
                                                    >
                                                        Ver Checklist
                                                    </Link>
                                                </Menu.Item>
                                                {authenticatedUser?.rol === 1 && (
                                                    <>
                                                        <Menu.Item>
                                                            <Link
                                                                to={`/asignacion/${asignacion.id}/edit`}
                                                                className="block px-3 py-1 text-sm leading-6 text-gray-900"
                                                            >
                                                                Editar Asignación
                                                            </Link>
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            <button
                                                                type='button'
                                                                className='block w-full text-left px-3 py-1 text-sm leading-6 text-red-500 hover:bg-gray-100'
                                                                onClick={() => handleDelete(asignacion.id)}
                                                            >
                                                                Eliminar Asignación
                                                            </button>
                                                        </Menu.Item>
                                                    </>
                                                )}
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Paginación solo visible cuando no hay búsqueda activa */}
                    {!debouncedSearchTerm && <Pagination page={page} totalPages={totalPages} />}
                </>
            ) : (
                <p className="text-center py-20">
                    {debouncedSearchTerm ? "No se encontraron resultados" : "No hay Asignaciones"}
                </p>
            )}
        </>
    );
}