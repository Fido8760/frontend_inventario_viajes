import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react/jsx-runtime';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ApiAsignacionItem } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { deleteAsignacion } from '../../../api/AsignacionAPI';

const STATUS_CONFIG = {
    CREADA:              { label: 'Creada',              className: 'bg-gray-100 text-gray-600'   },
    CHECKLIST_PENDIENTE: { label: 'Checklist pendiente', className: 'bg-amber-50 text-amber-700'  },
    FOTOS_PENDIENTES:    { label: 'Fotos pendientes',    className: 'bg-blue-50 text-blue-700'    },
    EN_RUTA:             { label: 'En ruta',             className: 'bg-green-50 text-green-700'  },
    COMPLETA:            { label: 'Completa',            className: 'bg-gray-100 text-gray-600'   },
} as const;

type Props = {
    asignacion: ApiAsignacionItem;
    formattedDate: string;
};

export default function AsignacionesSummary({ asignacion, formattedDate }: Props) {
    const { data: authenticatedUser } = useAuth();
    const queryClient = useQueryClient();

    const hora = format(new Date(asignacion.createdAt), 'HH:mm', { locale: es });
    const statusCfg = STATUS_CONFIG[asignacion.status ?? 'CREADA'];

    const { mutate } = useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: ['busqueda-fecha', formattedDate] });
        },
    });

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar asignación?',
            text: 'Esta acción eliminará la asignación y sus checklists.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (result.isConfirmed) mutate(id);
    };

    return (
        <li className="rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <Link
                                to={`/asignacion/${asignacion.id}`}
                                className="text-sm font-medium text-[#0f1f3d] hover:text-blue-700 transition-colors"
                            >
                                Unidad {asignacion.unidad.no_unidad} · {asignacion.unidad.u_placas}
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5">{asignacion.unidad.tipo_unidad}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusCfg.className}`}>
                            {statusCfg.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {asignacion.operador && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Operador</p>
                                <p className="text-xs font-medium text-gray-700 mt-0.5 truncate">
                                    {asignacion.operador.nombre} {asignacion.operador.apellido_p}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">Registrado por</p>
                            <p className="text-xs font-medium text-gray-700 mt-0.5">
                                {asignacion.usuario.name} {asignacion.usuario.lastname}
                            </p>
                        </div>
                        {asignacion.caja && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Remolque</p>
                                <p className="text-xs font-medium text-gray-700 mt-0.5">{asignacion.caja.c_placas}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">Hora</p>
                            <p className="text-xs font-medium text-gray-700 mt-0.5">{hora}</p>
                        </div>
                        {asignacion.checklist && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Checklist</p>
                                <p className="text-xs font-medium text-gray-700 mt-0.5">#{asignacion.checklist.id}</p>
                            </div>
                        )}
                    </div>
                </div>

                <Menu as="div" className="relative shrink-0">
                    <Menu.Button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <EllipsisVerticalIcon className="h-5 w-5" />
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                            <Menu.Item>
                                <Link
                                    to={`/asignacion/${asignacion.id}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    Ver checklist
                                </Link>
                            </Menu.Item>
                            {authenticatedUser?.rol === 'SISTEMAS' && (
                                <>
                                    <Menu.Item>
                                        <Link
                                            to={`/asignacion/${asignacion.id}/edit`}
                                            className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                        >
                                            Editar asignación
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <button
                                            type="button"
                                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                            onClick={() => handleDelete(asignacion.id)}
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
        </li>
    );
}