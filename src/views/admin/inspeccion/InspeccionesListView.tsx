import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getInspecciones } from "../../../api/InspeccionAPI";
import { Link } from "react-router-dom";
import InspeccionRow from "../../../components/admin/inspeccion/InspeccionRow";
import { useDebounce } from "../../../hooks/useDebounce";

const TAKE = 10;

export default function InspeccionesListView() {
    const [skip, setSkip] = useState(0);
    const [tipoFiltro, setTipoFiltro] = useState<'UNIDAD' | 'REMOLQUE' | ''>('');
    const [search, setSearch] = useState('');
    const searchDebounced = useDebounce(search, 400);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['Inspecciones', skip, tipoFiltro, searchDebounced],
        queryFn: () => getInspecciones(TAKE, skip, tipoFiltro || undefined, searchDebounced || undefined),
    });

    const totalPages = data ? Math.ceil(data.count / TAKE) : 0;
    const currentPage = skip / TAKE + 1;

    const handleSearch = (value: string) => {
        setSearch(value);
        setSkip(0);
    }

    return (
        <div className=" max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className=" text-2xl font-semibold text-gray-900">Inspecciones</h1>
                    <p className=" text-sm text-gray-500 mt-0.5">{data ? `${data.count} inspecciones registradas` : `Cargando...`}</p>
                </div>
                <Link
                    to={"/inspecciones/create"}
                    className=" flex items-center gap-1.5 text-sm text-white bg-[#0f1f3d] rounded-lg px-3 py-2 hover:bg-[#1a3a6b] transition-colors no-underline"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Inspección
                </Link>
            </div>

            <div className=" flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex gap-2">
                    {(['', 'UNIDAD', 'REMOLQUE'] as const).map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => { setTipoFiltro(tipo); setSkip(0); }}
                            className={` text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                                tipoFiltro === tipo ? ' bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {tipo === '' ? 'Todos' : tipo === 'UNIDAD' ? 'Unidades' : 'Remolques'}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder={tipoFiltro === 'REMOLQUE' ? 'No. caja o placas...' : 'No. económico, placas o tipo...'}
                        className=" w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-full outline-none focus:border-[#0f1f3d] transition-colors"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch('')}
                            className=" absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {isLoading && (
                    <div className=" flex items-center justify-center py-20">
                        <p className=" text-gray-400 text-sm">Cargando inspecciones...</p>
                    </div>
                )}

                {isError && (
                    <div className=" flex items-center justify-center py-20">
                        <p className=" text-red-500 text-sm">Error al cargar las inspecciones</p>
                    </div>
                )}

                {!isLoading && !isError && data?.rows.length === 0 && (
                    <div className=" flex flex-col items-center justify-center py-20">
                        <div className=" w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className=" text-sm font-medium text-gray-700">Sin inspecciones</p>
                        <p className=" text-xs text-gray-400 mt-1">No hay inspecciones registradas aún</p>
                    </div>
                )}

                {!isLoading && data && data.rows.length > 0 && (
                    <div className=" divide-y divide-gray-50">
                        {data.rows.map(inspeccion => (
                            <InspeccionRow key={inspeccion.id} inspeccion={inspeccion} />
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className=" flex items-center justify-between mt-4">
                    <p className=" text-xs text-gray-400">Página {currentPage} de {totalPages}</p>
                    <div className=" flex gap-2">
                        <button
                            onClick={() => setSkip(s => Math.max(0, s - TAKE))}
                            disabled={skip === 0}
                            className=" text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setSkip(s => s + TAKE)}
                            disabled={currentPage >= totalPages}
                            className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
