import { useQuery } from "@tanstack/react-query"
import { getRecorridosEnRuta } from "../../../api/VigilanciaAPI"
import { MagnifyingGlassIcon, ShieldCheckIcon, TruckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import VigilanciaCard from "../../../components/admin/vigilancia/VigilanciaCard";
import { useMemo, useState } from "react";

export default function VigilanciaListView() {

    const [busqueda, setBusqueda] = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['recorridos-en-ruta'],
        queryFn: getRecorridosEnRuta
    });

    const recorridosFiltrados = useMemo(() => {
        const lista = data?.recorridos ?? [];
        if (!busqueda.trim()) return lista;

        const term = busqueda.toLowerCase().trim();

        return lista.filter(r => {
            const noUnidad = String(r.unidad?.no_unidad ?? '').toLowerCase();
            const placas = String(r.unidad?.u_placas ?? '').toLowerCase();
            const nombreOperador = `${r.operador?.nombre ?? ''} ${r.operador?.apellido_p ?? ''} ${r.operador?.apellido_m ?? ''}`.toLowerCase();
            const noCaja = String(r.caja?.numero_caja ?? '').toLowerCase();
            const placasCaja = String(r.caja?.c_placas ?? '').toLowerCase();

            return (
                noUnidad.includes(term) ||
                placas.includes(term) ||
                nombreOperador.includes(term) ||
                noCaja.includes(term) ||
                placasCaja.includes(term)
            );
        })
    }, [data?.recorridos, busqueda]);

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando unidades en ruta...</p>
        </div>
    )

    if (isError) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-sm text-red-500">No se pudieron cargar las unidades en ruta. Intenta de nuevo.</p>
        </div>
    )

    const totalUnidades = data?.total ?? 0;

    return (
        <div className="space-y-6">
            <div className=" flex items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <ShieldCheckIcon className="w-5 h-5 text-[#0f1f3d]" />
                        <h1 className=" text-2xl font-medium text-gray-900">Unidades en Ruta</h1>
                    </div>
                    <p className="text-sm text-gray-500">Registra la entrada de unidades al patio y cierra el viaje</p>
                </div>
                <div className=" flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className=" text-xs font-medium text-amber-700">
                        {totalUnidades} unidad{totalUnidades !== 1 ? 'es' : ''} en carretera
                    </span>
                </div>
            </div>

            {totalUnidades > 0 && (
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por no. unidad, operador, placas o remolque..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f1f3d] focus:outline-none focus:ring-1 focus:ring-[#0f1f3d] shadow-sm transition-all"
                    />
                    {busqueda && (
                        <button
                            type="button"
                            onClick={() => setBusqueda('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            title="Limpiar búsqueda"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )}
            {!totalUnidades ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <TruckIcon className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-sm">No hay unidades en ruta en este momento</p>
                </div>
            ) : recorridosFiltrados.length === 0 ? (
                <div className=" bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Sin coincidencias para "{busqueda}"</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Vrifica el numero de unidad, placas o nombre del operador</p>
                    <button
                        type="button"
                        onClick={() => setBusqueda('')}
                        className="text-xs font-semibold text-[#0f1f3d] hover:underline"
                    >
                        Ver todas las unidades en ruta
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {recorridosFiltrados.map(recorrido => (
                        <VigilanciaCard  key={recorrido.recorridoId} recorrido={recorrido} />
                    ))}
                </div>
            )}
        </div>
    )
}
