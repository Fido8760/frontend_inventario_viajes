import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAsignacion, getAsignaciones, getAsignacionesSearch } from "../../api/AsignacionAPI";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";
import { isValidPage } from "../../utils/valdateParams";
import Pagination from "../../components/ui/Pagination";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import Swal from "sweetalert2";
import { ApiAsignacionItem } from "../../types";
import { Rol } from "../../types/roles";

export default function DashboardView() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const { data: authenticatedUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    const productsPerPage = 9; // 👈 grid de 3 cols
    const pageParam = +searchParams.get("page")!;
    const page = Math.max(1, Number(pageParam) || 1);
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
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
        },
    });

    useEffect(() => {
        if (!isValidPage(page)) { setShouldRedirect(true); return; }
        if (data && !debouncedSearchTerm) {
            const totalPages = Math.ceil(data.count / productsPerPage);
            if (page > totalPages) setShouldRedirect(true);
        }
    }, [page, data, debouncedSearchTerm]);

    useEffect(() => {
        if (shouldRedirect) { navigate("/?page=1"); setShouldRedirect(false); }
    }, [shouldRedirect, navigate]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "¿Eliminar asignación?",
            text: "Esta acción eliminará la asignación y todos sus checklists. No se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (result.isConfirmed) mutate(id);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando asignaciones...</p>
        </div>
    );

    if (!data) return null;

    const totalPages = debouncedSearchTerm ? 1 : Math.ceil(data.count / productsPerPage);
    const canCreate = authenticatedUser?.rol === Rol.CAPTURISTA || authenticatedUser?.rol === Rol.SISTEMAS;
    const canDelete = authenticatedUser?.rol === Rol.SISTEMAS;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900">Inventario de viajes</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Checklist de unidades registrados</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[240px]">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar unidad, operador, placas..."
                            className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {canCreate && (
                        <Link
                            to="/asignacion/create"
                            className="flex items-center gap-2 bg-[#0f1f3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1a3a6b] transition-colors no-underline"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva asignación
                        </Link>
                    )}
                </div>
            </div>

            {/* Grid */}
            {data.rows.length ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {data.rows.map((asignacion) => (
                            <AsignacionCard
                                key={asignacion.id}
                                asignacion={asignacion}
                                canDelete={canDelete}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                    {!debouncedSearchTerm && <Pagination page={page} totalPages={totalPages} />}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">{debouncedSearchTerm ? "No se encontraron resultados" : "No hay asignaciones registradas"}</p>
                </div>
            )}
        </div>
    );
}

function UnitIcon({ tipo }: { tipo: string }) {
    if (tipo === 'TRACTOCAMION') return (
        <svg className="w-5 h-5 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5.5M13 16l2.5.5M13 16H9m4 0h2m2.5.5L21 15V9l-3-3h-2v10l.5.5" />
        </svg>
    );
    if (tipo === 'MUDANCERO') return (
        <svg className="w-5 h-5 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0-7v7m0 0H9m6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
    return (
        <svg className="w-5 h-5 text-[#0f1f3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        COMPLETA: { label: 'Completa', className: 'bg-green-100 text-green-800' },
        FOTOS_PENDIENTES: { label: 'Fotos pendientes', className: 'bg-yellow-100 text-yellow-800' },
        CREADA: { label: 'Sin checklist', className: 'bg-blue-100 text-blue-800' },
    }
    const { label, className } = config[status as keyof typeof config] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
    return (
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${className}`}>
            {label}
        </span>
    )
}

function AsignacionCard({ asignacion, canDelete, onDelete }: {
    asignacion: ApiAsignacionItem
    canDelete: boolean
    onDelete: (id: number) => void
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
            {/* Card header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <UnitIcon tipo={asignacion.unidad.tipo_unidad} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">Unidad {asignacion.unidad.no_unidad}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {asignacion.unidad.u_placas} · {asignacion.unidad.tipo_unidad}
                        </p>
                    </div>
                </div>
                <StatusBadge status={asignacion.status ?? 'CREADA'} />
            </div>

            {/* Card body */}
            <div className="px-4 py-3 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-400">Operador</p>
                        <p className="text-sm font-medium text-gray-800">
                            {asignacion.operador
                                ? `${asignacion.operador.nombre} ${asignacion.operador.apellido_p} ${asignacion.operador.apellido_m}`
                                : 'Sin asignar'}
                        </p>
                    </div>
                </div>

                {asignacion.caja && (
                    <div className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                        <div>
                            <p className="text-xs text-gray-400">Remolque</p>
                            <p className="text-sm font-medium text-gray-800">{asignacion.caja.c_placas}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-400">Registrado por</p>
                        <p className="text-sm font-medium text-gray-800">
                            {asignacion.usuario ? `${asignacion.usuario.name} ${asignacion.usuario.lastname}` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Card footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(asignacion.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                    <Link
                        to={`/asignacion/${asignacion.id}`}
                        className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors no-underline"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                    </Link>
                    <Link
                        to={`/asignacion/${asignacion.id}/edit`}
                        className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors no-underline"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </Link>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(asignacion.id)}
                            className="flex items-center gap-1 text-xs text-red-500 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}