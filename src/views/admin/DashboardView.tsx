import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteAsignacion, getAsignaciones, getAsignacionesSearch } from "../../api/AsignacionAPI";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import Swal from "sweetalert2";
import { Rol } from "../../types/roles";
import AsignacionCard from "../../components/admin/asignacion/AsignacionCard";

export default function DashboardView() {
    const { data: authenticatedUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data, isLoading } = useQuery({
        queryKey: ["asignaciones", debouncedSearchTerm],
        queryFn: () =>
            debouncedSearchTerm
                ? getAsignacionesSearch(debouncedSearchTerm)
                : getAsignaciones(),
    });

    const { mutate } =useMutation({
        mutationFn: deleteAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (res) => {
            toast.success(res || "Asignacion eliminada");

        }
    });

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "¿Eliminar asignación?",
            text: "Esta acción eliminará la asignación. Solo se permite si no tiene viajes registrados.",
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
            <p className="text-gray-400 text-sm">Cargando asignaciones activas...</p>
        </div>
    );

     if (!data) return null;

    const canCreate = authenticatedUser?.rol === Rol.CAPTURISTA || authenticatedUser?.rol === Rol.SISTEMAS;
    const canDelete = authenticatedUser?.rol === Rol.SISTEMAS;
    const canEdit   = authenticatedUser?.rol === Rol.SISTEMAS;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900">Asignaciones Activas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Control de unidades y viajes</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[360px]">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text"
                            placeholder="Buscar por operador, placas o no. unidad"
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
            {data.asignaciones.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.asignaciones.map(asignacion => (
                        <AsignacionCard
                            key={asignacion.id}
                            asignacion={asignacion}
                            canDelete={canDelete}
                            onDelete={handleDelete}
                            canEdit={canEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">
                        {debouncedSearchTerm ? "No se encontraron asignaciones coincidentes" : "No hay asignaciones activas en este momento"}
                    </p>
                </div>
            )}
        </div>
    );
}


