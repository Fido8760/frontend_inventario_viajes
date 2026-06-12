import AsignacionFilter from "../../../components/admin/search-date/AsignacionFilter";

export default function CalendarView() {
    

    return (
        <div className=" space-y-6">
             <div className=" mb-10">
                <h1 className="text-2xl font-medium text-gray-900">Calendario de asignaciones</h1>
                <p className="text-sm text-gray-500 mt-0.5">Selecciona una asignación en alguna fecha en el calendario</p>
             </div>
             <AsignacionFilter />
        </div>
    )
}
