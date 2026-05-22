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

export default function AsignacionesSummary({asignacion, formattedDate }: { asignacion: ApiAsignacionItem, formattedDate: string }) {

    const { data: authenticatedUser } = useAuth();

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({
                queryKey: ['asignacionesDate', formattedDate]
            });
        },
    });

    const handleDelete = async ( asignacionIdToDelete: number ) => {

        const result = await Swal.fire({
            title: "¿Eliminar Asignación?",
            text: "Esta acción eliminará la asignación y sus checklists.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            mutate(asignacionIdToDelete);
        }
    };

    return (

        <li className="relative rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:bg-gray-50">
            <div className="flex items-start justify-between gap-5">
                {/* INFO */}
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Link
                                to={`/asignacion/${asignacion.id}`}
                                className="text-lg font-medium text-gray-900 hover:text-blue-700 transition-colors"
                            >
                                Unidad {asignacion.unidad.no_unidad}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">
                                {asignacion.unidad.u_placas}
                            </p>
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Completa
                        </span>
                    </div>

                    {/* GRID INFO */}
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Operador
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-700">
                                {asignacion.operador?.nombre}{" "}
                                {asignacion.operador?.apellido_p}{" "}
                                {asignacion.operador?.apellido_m}
                            </p>

                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Registrado por
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-700">
                                {asignacion.usuario.name}{" "}
                                {asignacion.usuario.lastname}
                            </p>
                        </div>

                        {asignacion.caja?.c_placas && (
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                    Remolque
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {asignacion.caja.c_placas}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Fecha
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-700">
                                {formatDate(asignacion.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* MENU */}
                <div>
                    <Menu
                        as="div"
                        className="relative"
                    >
                        <Menu.Button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                            <EllipsisVerticalIcon
                                className="h-5 w-5"
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
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                                <Menu.Item>
                                    <Link
                                        to={`/asignacion/${asignacion.id}`}
                                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                    >
                                        Ver Checklist
                                    </Link>
                                </Menu.Item>
                                {authenticatedUser?.rol === 'SISTEMAS' && (
                                    <>
                                        <Menu.Item>
                                            <Link
                                                to={`/asignacion/${asignacion.id}/edit`}
                                                className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                            >
                                                Editar Asignación
                                            </Link>
                                        </Menu.Item>

                                        <Menu.Item>
                                            <button
                                                type="button"
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                                onClick={() =>
                                                    handleDelete(asignacion.id)
                                                }
                                            >
                                                Eliminar
                                            </button>

                                        </Menu.Item>
                                    </>
                                )}
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </li>
    );
}