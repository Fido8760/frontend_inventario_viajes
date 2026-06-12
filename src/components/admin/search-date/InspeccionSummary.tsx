import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { InspeccionListItem } from '../../../types';

type Props = {
    inspeccion: InspeccionListItem;
};

const STATUS_CONFIG = {
    EN_PROGRESO:      { label: 'En progreso',       className: 'bg-amber-50 text-amber-700' },
    FOTOS_PENDIENTES: { label: 'Fotos pendientes',  className: 'bg-blue-50 text-blue-700'  },
    COMPLETA:         { label: 'Completa',           className: 'bg-gray-100 text-gray-600' },
} as const;

export default function InspeccionSummary({ inspeccion }: Props) {
    const statusCfg = STATUS_CONFIG[inspeccion.status];
    const hora      = format(new Date(inspeccion.createdAt), 'HH:mm', { locale: es });
    const nombre    = inspeccion.tipo === 'UNIDAD'
        ? `Unidad ${inspeccion.unidad?.no_unidad ?? '—'} · ${inspeccion.unidad?.u_placas ?? '—'}`
        : `Remolque ${inspeccion.caja?.numero_caja ?? '—'} · ${inspeccion.caja?.c_placas ?? '—'}`;
    const subtipo   = inspeccion.tipo === 'UNIDAD'
        ? inspeccion.unidad?.tipo_unidad
        : inspeccion.caja?.c_marca;

    return (
        <li className="rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 mb-1.5">
                        {inspeccion.tipo}
                    </span>
                    <Link
                        to={`/inspecciones/${inspeccion.id}`}
                        className="block text-sm font-medium text-[#0f1f3d] hover:text-blue-700 transition-colors"
                    >
                        {nombre}
                    </Link>
                    {subtipo && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtipo}</p>
                    )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusCfg.className}`}>
                    {statusCfg.label}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Registrado por</p>
                    <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {inspeccion.usuario?.name} {inspeccion.usuario?.lastname}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Hora</p>
                    <p className="text-xs font-medium text-gray-700 mt-0.5">{hora}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Fotos</p>
                    <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {inspeccion.imagenes.length} subidas
                    </p>
                </div>
            </div>
        </li>
    );
}