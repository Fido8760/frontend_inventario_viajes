import { Link } from "react-router-dom";
import { ApiAsignacionItem } from "../../types";
import { formatDate } from "../../utils/formatDate";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react/jsx-runtime";
import { useAuth } from "../../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsignacion } from "../../api/AsignacionAPI";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function AsignacionesSummary({ asignacion, formattedDate }: { asignacion: ApiAsignacionItem, formattedDate: string }) {
    const { data: authenticatedUser } = useAuth();

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: ['asignacionesDate', formattedDate] });
        },
    })

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
        })
        if (result.isConfirmed) {
            mutate(asignacionIdToDelete);
        }
    }

    return (
        <>
            <li className="flex justify-between gap-x-6 px-5 py-10">
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
                            {asignacion.operador.apellido_p} {asignacion.operador.apellido_m}
                        </p>
                        <p className="text-sm text-gray-400">
                            Checklist Realizado por: {asignacion.usuario.name}{" "}
                            {asignacion.usuario.lastname}
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
                            <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
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
                                    type="button"
                                    className="block w-full text-left px-3 py-1 text-sm leading-6 text-red-500 hover:bg-gray-100"
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
        </>
    );
}
