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
    const formattedDate = format(date?.toString()!, 'yyyy-MM-dd')

    const { data, isError, isLoading } = useQuery({
        queryKey: ['asignacionesDate', formattedDate],
        queryFn: () => getAsignacionesDate(formattedDate)
    })
    if(isLoading) return <p>Cargando...</p>
    if(isError) return <NotFound />


    if (data) return (
        <div className="mt-10 flex flex-col items-center gap-20 lg:flex-row lg:items-start lg:justify-center">
            <div>
            <Calendar 
                value={date}
                onChange={setDate}
            />
            </div>

            <div className="w-full max-w-2xl">
            {data.count > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                Total de asignaciones: <span className="font-semibold text-gray-800">{data.count}</span>
                </p>
            )}

            {data.rows.length ? (
                <ul
                role="list"
                className="divide-y divide-gray-100 border border-gray-100 bg-white shadow-lg"
                >
                {data.rows.map(asignacion => (
                    <AsignacionesSummary 
                    key={asignacion.id}
                    asignacion={asignacion}
                    formattedDate={formattedDate}
                    />
                ))}
                </ul>
            ) : (
                <p className="text-gray-500 italic">No hay checklist este día</p>
            )}
            </div>
        </div>
        )

}
