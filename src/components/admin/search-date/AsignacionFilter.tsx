import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import AsignacionesSummary from './AsignacionesSummary';
import InspeccionSummary from './InspeccionSummary';
import { getResultadosPorFecha } from '../../../api/AsignacionAPI';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function AsignacionFilter() {
    const [date, setDate]         = useState<Value>(new Date());
    const [calOpen, setCalOpen]   = useState(true);

    const formattedDate = format(date?.toString()!, 'yyyy-MM-dd');
    const displayDate   = format(date?.toString()!, "d 'de' MMMM, yyyy", { locale: es });

    const { data, isLoading } = useQuery({
        queryKey: ['busqueda-fecha', formattedDate],
        queryFn:  () => getResultadosPorFecha(formattedDate),
    });

    const totalAsignaciones = data?.asignaciones.count ?? 0;
    const totalInspecciones = data?.inspecciones.count ?? 0;
    const totalRegistros    = totalAsignaciones + totalInspecciones;

    const handleDateChange = (value: Value) => {
        setDate(value);
        setCalOpen(false);   // colapsa al seleccionar en mobile
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">

            {/* ── SIDEBAR ── */}
            <aside className="xl:sticky xl:top-24 flex flex-col gap-3">

                {/* Calendario card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Toggle header — visible solo en mobile */}
                    <button
                        type="button"
                        onClick={() => setCalOpen(o => !o)}
                        className="xl:hidden w-full px-5 py-4 flex items-center justify-between text-left"
                        aria-expanded={calOpen}
                    >
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Fecha seleccionada</p>
                            <p className="text-sm font-medium text-gray-900">{displayDate}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {totalAsignaciones} asignación{totalAsignaciones !== 1 ? 'es' : ''} · {totalInspecciones} inspección{totalInspecciones !== 1 ? 'es' : ''}
                            </p>
                        </div>
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-transform duration-200 ${calOpen ? 'rotate-180' : ''}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>

                    {/* Divider mobile */}
                    {calOpen && <div className="xl:hidden h-px bg-gray-100" />}

                    {/* Cuerpo del calendario */}
                    <div className={`${calOpen ? 'block' : 'hidden'} xl:block px-5 py-5`}>

                        {/* Título desktop */}
                        <div className="hidden xl:block mb-4">
                            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Fecha seleccionada</p>
                            <p className="text-sm font-medium text-gray-900">{displayDate}</p>
                        </div>

                        <Calendar
                            value={date}
                            onChange={handleDateChange}
                            locale="es-MX"
                        />

                        <div className="flex gap-4 mt-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                                Con registros
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0f1f3d] inline-block" />
                                Seleccionado
                            </span>
                        </div>
                    </div>

                    {/* Stats compactos mobile cuando está colapsado */}
                    {!calOpen && (
                        <div className="xl:hidden grid grid-cols-2 gap-3 px-5 pb-4 pt-2">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xl font-medium text-gray-900">{totalAsignaciones}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 align-middle" />
                                    Asignaciones
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xl font-medium text-gray-900">{totalInspecciones}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 mr-1 align-middle" />
                                    Inspecciones
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resumen del día — desktop */}
                <div className="hidden xl:block bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">Resumen del día</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-2xl font-medium text-gray-900">{totalAsignaciones}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 align-middle" />
                                Asignaciones
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-2xl font-medium text-gray-900">{totalInspecciones}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 mr-1 align-middle" />
                                Inspecciones
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── CONTENT ── */}
            <section>
                <div className="mb-5">
                    <h2 className="text-lg font-medium text-gray-900">{displayDate}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{totalRegistros} registro{totalRegistros !== 1 ? 's' : ''} en total</p>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ── Asignaciones ── */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Asignaciones
                                </p>
                                <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                    {totalAsignaciones}
                                </span>
                            </div>

                            {data?.asignaciones.rows.length ? (
                                <ul className="space-y-3">
                                    {data.asignaciones.rows.map(a => (
                                        <AsignacionesSummary
                                            key={a.id}
                                            asignacion={a}
                                            formattedDate={formattedDate}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                                    <p className="text-sm text-gray-400">Sin asignaciones este día</p>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 mb-6" />

                        {/* ── Inspecciones ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Inspecciones de patio
                                </p>
                                <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                    {totalInspecciones}
                                </span>
                            </div>

                            {data?.inspecciones.rows.length ? (
                                <ul className="space-y-3">
                                    {data.inspecciones.rows.map(i => (
                                        <InspeccionSummary
                                            key={i.id}
                                            inspeccion={i}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                                    <p className="text-sm text-gray-400">Sin inspecciones este día</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}