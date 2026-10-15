import { UnidadCritica } from "../types";
import { Operador } from "../types/operador";


export function tipoLabel(tipo: string) {
    const map: Record<string, string> = {
        tractocamion: 'Tractocamión',
        mudancero:    'Mudancero',
        camioneta:    'Camioneta',
    };
    return map[tipo] ?? tipo;
}

export function motivoLabel(motivo: UnidadCritica['motivo']) {
    return motivo === 'sin_checklist' ? 'Sin revisión' : '+30 días';
}

export function origenRevisionLabel(origen?: UnidadCritica['origenUltimaRevision']) {
    if (origen === 'asignacion') return 'Asignación';
    if (origen === 'inspeccion') return 'Inspección';
    return '-';
}

export function diasDesde(fecha: string | Date): string {
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `Hace ${dias} días`;
}

export function colorDiasEnRuta(dias: number) {
    if (dias >= 4) return 'bg-red-50 text-red-600';
    if (dias >= 2) return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-600';
}

export function inspeccionTipoLabel(tipo: string) {
    const map: Record<string, string> = {
        UNIDAD:   'Unidad',
        REMOLQUE: 'Remolque',
    };
    return map[tipo] ?? tipo;
}

export function operadorNombre(operador: Partial<Operador>) {
    if (!operador) return 'Sin operador';
    return [operador.nombre, operador.apellido_p, operador.apellido_m].filter(Boolean).join(' ');
}

export function estadoRevisionBadge(estado: string | null | undefined) {
    if (!estado) return null;
    const map: Record<string, { label: string; cls: string }> = {
        completa:    { label: 'Completa',    cls: 'bg-green-50 text-green-700' },
        sin_fotos:   { label: 'Sin fotos',   cls: 'bg-red-50 text-red-600' },
        en_progreso: { label: 'En progreso', cls: 'bg-amber-50 text-amber-700' },
        pendiente:   { label: 'Pendiente',   cls: 'bg-gray-100 text-gray-600' },
    };
    const entry = map[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-500' };
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.cls}`}>
            {entry.label}
        </span>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}