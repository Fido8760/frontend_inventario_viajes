import { useQuery } from "@tanstack/react-query"
import { getAsignacionesEnRuta } from "../../../api/VigilanciaAPI"
import { ShieldCheckIcon, TruckIcon } from "@heroicons/react/24/outline";
import VigilanciaCard from "../../../components/admin/vigilancia/VigilanciaCard";

export default function VigilanciaListView() {
    const { data: asignaciones, isLoading } = useQuery({
        queryKey: ['asignaciones-en-ruta'],
        queryFn: getAsignacionesEnRuta
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando unidades en ruta...</p>
        </div>
    )

    return (
        <div>
            <div className=" flex items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <ShieldCheckIcon className="w-5 h-5 text-[#0f1f3d]" />
                        <h1 className=" text-2xl font-medium text-gray-900">Unidades en Ruta</h1>
                    </div>
                    <p className=" text-sm text-gray-500">Registra la entrada de unidades al patio</p>
                </div>
                <div className=" flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className=" text-xs font-medium text-amber-700">
                        {asignaciones?.length ?? 0} unidad{asignaciones?.length !== 1 ? 'es': '' } en ruta
                    </span>
                </div>
            </div>
            {!asignaciones?.length ? (
                <div className=" flex flex-col items-center justify-center py-32 text-gray-400">
                    <TruckIcon className=" w-12 h-12 mb-3 text-gray-300" />
                    <p className=" text-sm">No hay unidades en ruta en este momento</p>
                </div>
            ) : (
                <div>
                    {asignaciones.map(asignacion => (
                        <VigilanciaCard key={asignacion.id} asignacion={asignacion} />
                    ))}
                </div>
            )}
        </div>
    )
}
