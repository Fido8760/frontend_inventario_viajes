import { TruckIcon } from "@heroicons/react/24/outline";
import { RecorridoEnRutaItem } from "../../../types"
import { formatDate } from "../../../utils/formatDate";
import { Link } from "react-router-dom";

type VigilanciaCardProps = {
    recorrido: RecorridoEnRutaItem
}

function colorDiasEnRuta(dias: number) {
    if (dias >= 4) return 'bg-red-100 text-red-700'
    if (dias >= 2) return 'bg-amber-100 text-amber-800'
    return 'bg-gray-100 text-gray-600'
}

export default function VigilanciaCard({ recorrido }: VigilanciaCardProps) {
    const fotosEntrada = ['entrada_frontal', 'entrada_trasera', 'entrada_izquierdo', 'entrada_derecho'];
    const imagenesSubidas = recorrido.checklist?.imagenes?.map(i => i.fieldId) ?? [];
    const fotosFaltantes = fotosEntrada.filter(f => !imagenesSubidas.includes(f));
    const todasLasFotos = fotosFaltantes.length === 0;

    return (
        <div className=" bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0">
                        <TruckIcon className=" w-5 h-5 text-[#0f1f3d]" />
                    </div>
                    <div>
                        <p className=" font-medium text-gray-900 text-sm">Unidad {recorrido.unidad.no_unidad}</p>
                        <p className=" text-xs text-gray-400 mt-0.5">{recorrido.unidad.tipo_unidad}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    {todasLasFotos ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                            Listo para cerrar
                        </span>
                    ) : (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            {fotosFaltantes.length} foto{fotosFaltantes.length !== 1 ? 's' : ''} pendiente{fotosFaltantes.length !== 1 ? 's' : ''}
                        </span>
                    )}
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${colorDiasEnRuta(recorrido.diasEnRuta)}`}>
                        {recorrido.diasEnRuta === 0 ? 'Hoy' : `${recorrido.diasEnRuta} día${recorrido.diasEnRuta !== 1 ? 's' : ''} en ruta`}
                    </span>
                </div>
            </div>

            <div className=" px-4 py-3 flex flex-col gap-2">
                {recorrido.operador && (
                    <div className=" flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                            <p className=" text-xs text-gray-400">Operador</p>
                            <p className=" text-sm font-medium text-gray-800">{recorrido.operador.nombre} {recorrido.operador.apellido_p} {recorrido.operador.apellido_m}</p>
                        </div>
                    </div>
                )}

                <div className=" mt-1">
                    <p className=" text-xs text-gray-400 mb-1.5">Fotos de entrada</p>
                    <div className=" flex gap-1.5">
                        {fotosEntrada.map( f => (
                            <div 
                                key={f}
                                title={f.replace('entrada_', '').replace('_', ' ')}
                                className={` flex-1 h-1.5 rounded-full ${imagenesSubidas.includes(f) ? 'bg-green-400' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    <p className=" text-[10px] text-gray-400 mt-1">
                        {fotosEntrada.length - fotosFaltantes.length}/{fotosEntrada.length} fotos subidas
                    </p>
                </div>
            </div>

            <div className=" px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(recorrido.createdAt)}
                </span>
                <Link
                    to={`/vigilancia/${recorrido.asignacionId}/recorridos/${recorrido.recorridoId}/cierre-viaje`}
                    className=" flex items-center gap-1 text-xs text-white bg-[#0f1f3d] border border-[#0f1f3d] rounded-md px-3 py-1.5 hover:bg-[#1a3a6b] transition-colors no-underline"
                >
                    Cerrar viaje
                </Link>
            </div>
        </div>
    )
}