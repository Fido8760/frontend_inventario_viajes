import { useQuery } from "@tanstack/react-query";
import { getEstadisticasChecklist } from "../../../api/AsignacionAPI";

type EstadisticasChecklistCardProps = {
    asignacionId: number;
}
export default function EstadisticasChecklistCard({ asignacionId }: EstadisticasChecklistCardProps) {

    const { data: stats, isLoading } = useQuery({
        queryKey: ['estadisticas', asignacionId],
        queryFn: () => getEstadisticasChecklist(asignacionId),
        enabled: !isNaN(asignacionId)
    });

     if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse text-xs text-gray-400">
                Calculando salud de la unidad...
            </div>
        );
    }

    if (!stats) return null;

    const badgeColor = stats.indiceSalud >= 90 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : stats.indiceSalud >= 75 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-red-50 text-red-700 border-red-200'
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Salud y Condición de la Unidad</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Consolidado de todas las respuestas de checklist en esta asignación</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${badgeColor}`}>
                    <span>Índice de Salud:</span>
                    <span className="text-base font-extrabold">{stats.indiceSalud}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                        <span>Condición Física (Opciones)</span>
                        <span className="text-gray-400 font-normal">{stats.opciones.total} evaluadas</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
                        <div style={{ width: `${stats.opciones.porcentajes.bueno}%` }} className="bg-emerald-500" title={`Bueno: ${stats.opciones.porcentajes.bueno}%`} />
                        <div style={{ width: `${stats.opciones.porcentajes.regular}%` }} className="bg-amber-400" title={`Regular: ${stats.opciones.porcentajes.regular}%`} />
                        <div style={{ width: `${stats.opciones.porcentajes.malo}%` }} className="bg-red-500" title={`Malo: ${stats.opciones.porcentajes.malo}%`} />
                    </div>
                    <div className="flex justify-between text-[11px] font-medium pt-1">
                        <span className="text-emerald-700">✓ Bueno: {stats.opciones.bueno} ({stats.opciones.porcentajes.bueno}%)</span>
                        <span className="text-amber-700">⚠ Regular: {stats.opciones.regular} ({stats.opciones.porcentajes.regular}%)</span>
                        <span className="text-red-700">✗ Malo: {stats.opciones.malo} ({stats.opciones.porcentajes.malo}%)</span>
                    </div>
                </div>

                <div className="space-y-2 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                        <span>Seguridad y Accesorios (Sí / No)</span>
                        <span className="text-gray-400 font-normal">{stats.cumplimientoSiNo.total} evaluados</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
                        <div style={{ width: `${stats.cumplimientoSiNo.porcentajeCumplimiento}%` }} className="bg-blue-600" />
                        <div style={{ width: `${ 100 - stats.cumplimientoSiNo.porcentajeCumplimiento}%` }} className="bg-red-400" />
                    </div>

                    <div className="flex justify-between text-[11px] font-medium pt-1">
                        <span className="text-blue-700">✓ Presentes / Operativos: {stats.cumplimientoSiNo.cumple} ({stats.cumplimientoSiNo.porcentajeCumplimiento}%)</span>
                        <span className="text-red-600">✗ Faltantes / Falla: {stats.cumplimientoSiNo.falla}</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Alertas e Incidencias Reportadas ({stats.focosRojos.length})
                </h4>
                {stats.focosRojos.length === 0 ? (
                     <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-center gap-2 font-medium">
                        <span>✓</span> Ninguna falla o condición en mal estado reportada en esta asignación.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stats.focosRojos.map(alerta => (
                            <div
                                key={alerta.preguntaId}
                                className="p-3 rounded-xl border border-red-100 bg-red-50/50 flex items-start justify-between gap-3 text-xs"
                            >
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-red-500 bg-red-100/60 px-1.5 py-0.5 rounded">
                                        {alerta.seccion}
                                    </span>
                                    <p className="font-semibold text-gray-800 mt-1">{alerta.pregunta}</p>
                                </div>
                                <span className="shrink-0 text-red-600 font-bold bg-white border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                                    {alerta.conteo} {alerta.conteo === 1 ? 'vez' : 'veces'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
