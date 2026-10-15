import { AsignacionItem } from "../../../types/asignacion";


interface StatusBadgeProps {
    asignacion: AsignacionItem;
}

export default function StatusBadge({ asignacion }: StatusBadgeProps) {
    // Si no hay viaje abierto -> Está en patio libre
    if (!asignacion.recorridoActivo) {
        return (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                En patio
            </span>
        );
    }

    // Leemos directamente el status real del viaje activo:
    const status = asignacion.recorridoActivo.status;

    // 1. EN RUTA (Carretera)
    if (status === 'EN_RUTA') {
        return (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                En ruta
            </span>
        );
    }

    // 2. FOTOS PENDIENTES
    if (status === 'FOTOS_PENDIENTES') {
        return (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">
                Fotos pendientes
            </span>
        );
    }

    // 3. CHECKLIST EN CURSO (CREADA o CHECKLIST_PENDIENTE)
    if (status === 'CHECKLIST_PENDIENTE' || status === 'CREADA') {
        return (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 shrink-0">
                Checklist en curso
            </span>
        );
    }

    // Fallback por si acaso
    return (
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 shrink-0">
            {status}
        </span>
    );
}