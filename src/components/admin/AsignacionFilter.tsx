import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { useState } from "react"
import { format } from 'date-fns'
import { useQuery } from "@tanstack/react-query"
import { getAsignacionesDate } from "../../api/AsignacionAPI"
import NotFound from "../../views/404/NotFound"
import AsignacionesSummary from "./AsignacionesSummary"

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

export default function AsignacionFilter() {

    const [date, setDate] = useState<Value>(new Date())

    const formattedDate = format(
        date?.toString()!,
        'yyyy-MM-dd'
    )

    const { data, isError, isLoading } = useQuery({

        queryKey: ['asignacionesDate', formattedDate],

        queryFn: () =>
            getAsignacionesDate(formattedDate)
    })

    if (isLoading) {
        return (
            <p className="text-sm text-gray-400">
                Cargando asignaciones...
            </p>
        )
    }

    if (isError) return <NotFound />

    if (data) return (

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">

            {/* SIDEBAR */}
            <aside>

                <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5">

                    <div className="mb-5">

                        <h2 className="text-sm font-medium text-gray-900">
                            Calendario
                        </h2>

                        <p className="text-xs text-gray-400 mt-0.5">
                            Filtra asignaciones por fecha
                        </p>

                    </div>

                    <Calendar
                        value={date}
                        onChange={setDate}
                    />

                    <div className="mt-6 border-t border-gray-100 pt-5">

                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Total asignaciones
                        </p>

                        <p className="text-3xl font-semibold text-gray-900 mt-1">
                            {data.count}
                        </p>

                    </div>

                </div>

            </aside>

            {/* CONTENT */}
            <section>

                <div className="mb-5 flex items-center justify-between">

                    <div>

                        <h2 className="text-2xl font-medium text-gray-900">
                            {format(date?.toString()!, 'dd MMMM yyyy')}
                        </h2>

                        <p className="text-sm text-gray-500 mt-0.5">
                            Asignaciones registradas
                        </p>

                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {data.count} registros
                    </div>

                </div>

                {data.rows.length ? (

                    <ul className="space-y-4">

                        {data.rows.map(asignacion => (

                            <AsignacionesSummary
                                key={asignacion.id}
                                asignacion={asignacion}
                                formattedDate={formattedDate}
                            />
                        ))}

                    </ul>

                ) : (

                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">

                        <p className="text-sm text-gray-400">
                            No hay asignaciones este día
                        </p>

                    </div>
                )}

            </section>

        </div>
    )
}