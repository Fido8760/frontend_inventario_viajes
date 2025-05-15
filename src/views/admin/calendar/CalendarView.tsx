import AsignacionFilter from "../../../components/admin/AsignacionFilter";

export default function CalendarView() {
    

    return (
        <>
            <h1 className="text-3xl font-bold">Asignaciones</h1>
            <p className="text-xl font-light text-gray-500 mt-5">En esta sección podras ver las asignaciones, utiliza el calendario para filtrarlas</p>

            <AsignacionFilter />
        
        </>
    )
}
