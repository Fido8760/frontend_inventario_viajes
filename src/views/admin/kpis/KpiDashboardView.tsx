import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDate } from '../../../utils/formatDate'
import { AsignacionEnRutaItem, ChecklistSinFotos, CompletitudPorTipo, InspeccionKpis, UnidadCritica } from '../../../types'
import {
    useAsignacionesEnRuta,
    useKpisInspecciones,
    useKpisResumen,
    useSinFotografias,
    useUnidadesCriticas
} from '../../../hooks/useDashboard'
import { useState } from 'react'


// ─── Helpers ─────────────────────────────────────────────────────────────────

function tipoLabel(tipo: string) {
    const map: Record<string, string> = {
        tractocamion: 'Tractocamión',
        mudancero:    'Mudancero',
        camioneta:    'Camioneta',
    }
    return map[tipo] ?? tipo
}

function motivoLabel(motivo: UnidadCritica['motivo']) {
    return motivo === 'sin_checklist' ? 'Sin revisión' : '+30 días'
}

function origenRevisionLabel(origen?: UnidadCritica['origenUltimaRevision']) {
    if (origen === 'asignacion') return 'Asignación'
    if (origen === 'inspeccion') return 'Inspección'
    return '-'
}

function diasDesde(fecha: string | Date): string {
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
    if (dias === 0 ) return 'Hoy'
    if(dias === 1) return 'Ayer'
    return `Hace ${dias} días`
}

function estadoRevisionBadge(estado: string | null | undefined) {
    if (!estado) return null
    const map: Record<string, { label: string; cls: string }> = {
        completa:   { label: 'Completa',   cls: 'bg-green-50 text-green-700' },
        sin_fotos:  { label: 'Sin fotos',  cls: 'bg-red-50 text-red-600' },
        en_progreso:{ label: 'En progreso',cls: 'bg-amber-50 text-amber-700' },
        pendiente:  { label: 'Pendiente',  cls: 'bg-gray-100 text-gray-600' },
    }
    const entry = map[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-500' }
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.cls}`}>
            {entry.label}
        </span>
    )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

function inspeccionTipoLabel(tipo: string) {
    const map: Record<string, string> = {
        UNIDAD:   'Unidad',
        REMOLQUE: 'Remolque',
    }
    return map[tipo] ?? tipo
}

function operadorNombre(operador: AsignacionEnRutaItem['operador']) {
    if (!operador) return 'Sin operador'
    return [operador.nombre, operador.apellido_p, operador.apellido_m].filter(Boolean).join(' ')
}

// ─── Metric card ─────────────────────────────────────────────────────────────

type MetricCardProps = {
    label:    string
    value:    number | undefined
    sub?:     string
    accent?:  'default' | 'danger' | 'warn' | 'ok' | 'info'
    loading?: boolean
}

const accentMap = {
    default: 'text-gray-900',
    danger:  'text-red-600',
    warn:    'text-amber-600',
    ok:      'text-green-700',
    info:    'text-blue-700',
}

function MetricCard({ label, value, sub, accent = 'default', loading }: MetricCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
            {loading
                ? <Skeleton className="h-8 w-16 mb-1" />
                : <p className={`text-3xl font-semibold ${accentMap[accent]}`}>{value ?? '—'}</p>
            }
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}

// ─── Bar chart card ───────────────────────────────────────────────────────────

const barColors: Record<string, string> = {
    tractocamion: '#0f1f3d',
    mudancero:    '#2563eb',
    camioneta:    '#93c5fd',
}

function CompletitudChart({ data, cajas, loading }: {
    data?:  CompletitudPorTipo[]
    cajas?: { total: number; conInspeccion: number; porcentaje: number }
    loading: boolean
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Cobertura de revisiones por tipo
            </p>
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.map((item) => (
                        <div key={item.tipo}>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-gray-700">{tipoLabel(item.tipo)}</span>
                                <span className="text-sm font-medium text-gray-900">{item.porcentaje}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width:      `${item.porcentaje}%`,
                                        background: barColors[item.tipo] ?? '#0f1f3d'
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {item.completos} de {item.total} unidades
                            </p>
                        </div>
                    ))}

                    {/* ── Cajas ── */}
                    {cajas && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-gray-700">Remolques</span>
                                <span className="text-sm font-medium text-gray-900">{cajas.porcentaje}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${cajas.porcentaje}%`, background: '#7c3aed' }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {cajas.conInspeccion} de {cajas.total} remolques con inspección
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Checklists bar chart ─────────────────────────────────────────────────────

function EstadoChecklistChart({ data, loading }: {
    data?: { sinChecklist: number; revisionPendiente: number; enProgreso: number; completos: number; sinFotos: number }
    loading: boolean
}) {
    const chartData = [
        { name: 'Sin revisión',  value: data?.sinChecklist ?? 0, color: '#e5e7eb' },
        { name: 'Pendiente',     value: data?.revisionPendiente ?? 0, color: '#fb923c' },
        { name: 'Abierta',       value: data?.enProgreso   ?? 0, color: '#fbbf24' },
        { name: 'Al día',        value: data?.completos    ?? 0, color: '#15803d' },
        { name: 'Sin fotos',     value: data?.sinFotos     ?? 0, color: '#dc2626' },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Última revisión por unidad
            </p>
            {loading ? (
                <Skeleton className="h-40 w-full" />
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData} barSize={36}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{
                                    fontSize: 12,
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 4px rgba(0,0,0,.06)'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Leyenda */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                        {chartData.map((item) => (
                            <span key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: item.color }} />
                                {item.name}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// ─── Tabla unidades críticas ──────────────────────────────────────────────────

function EstadoInspeccionesChart({ data, loading }: { data?: InspeccionKpis; loading: boolean }) {
    const chartData = [
        { name: 'Abiertas',    value: data?.enProgreso ?? 0, color: '#fbbf24' },
        { name: 'Sin fotos',   value: data?.fotosPendientes ?? 0, color: '#dc2626' },
        { name: 'Completas',   value: data?.completas ?? 0, color: '#15803d' },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Estatus de inspecciones
            </p>
            {loading ? (
                <Skeleton className="h-40 w-full" />
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData} barSize={36}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{
                                    fontSize: 12,
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 4px rgba(0,0,0,.06)'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 mt-3">
                        {data?.porTipo.map((item) => (
                            <div key={item.tipo} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{inspeccionTipoLabel(item.tipo)}</span>
                                <span className="font-medium text-gray-900">{item.completas} de {item.total} completas</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function UnidadesCriticasTable() {
    const [page, setPage] = useState(1);
    const { data: response, isLoading} = useUnidadesCriticas(page);
    const criticas = response?.data;
    const meta = response?.meta;
    const totalPages = meta?.totalPages ?? 1;

    return (
        <div className=' bg-white rounded-xl border border-gray-100 overflow-hidden'>
            <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
                <div>
                    <p className=' text-sm font-medium text-gray-900'>Unidades Criticas</p>
                    <p className=' text-xs text-gray-400 mt-0.5'>Sin revisión o más de 30 días desde asignación o inspección</p>
                </div>
                {meta && (
                    <span className=' text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full'>
                        {meta.total} unidades
                    </span>
                )}
            </div>
            {isLoading ? (
                <div className=' p-5 space-y-3'>
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className='h-10 w-full' />)}
                </div>
            ) : !criticas?.length ? (
                <div className=' flex flex-col items-center justify-center py-12 text-gray-400'>
                    <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">Todas las unidades al día</p>
                </div>
            ) : (
                <div className=' overflow-x-auto'>
                    <table className=' w-full text-sm'>
                        <thead>
                            <tr className="text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Unidad</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Placas</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Motivo</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Origen</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Última revisión</th>
                            </tr>
                        </thead>
                        <tbody className=' divide-y divide-gray-50'>
                            {criticas.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{u.no_unidad}</td>
                                    <td className="px-5 py-3.5 text-gray-600 capitalize">{u.tipo_unidad.toLowerCase()}</td>
                                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{u.u_placas}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                            u.motivo === 'sin_checklist'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {motivoLabel(u.motivo)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                                        {origenRevisionLabel(u.origenUltimaRevision)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {estadoRevisionBadge(u.estadoUltimaRevision)}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                                        {u.ultimoChecklist
                                            ? <>
                                                <span className="text-gray-700 font-medium">{diasDesde(u.ultimoChecklist)}</span>
                                                <span className="block text-gray-400">{formatDate(u.ultimoChecklist)}</span>
                                            </>
                                            : <span className="text-red-500 font-medium">Nunca revisada</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className=' flex items-center justify-between px-5 py-3 border-t border-gray-100'>
                            <p className=' text-xs text-gray-400'>
                                Página {meta?.page} de {totalPages}
                            </p>
                            <div className='flex gap-1'>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className=' px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className=' px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Tabla sin fotografías ────────────────────────────────────────────────────

function SinFotografiasTable({ data, loading }: { data?: ChecklistSinFotos[]; loading: boolean }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Checklists sin fotografías</p>
                    <p className="text-xs text-gray-400 mt-0.5">Checklist completo pero fotos pendientes de subir</p>
                </div>
                {data && data.length > 0 && (
                    <span className="text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                        {data.length} pendientes
                    </span>
                )}
            </div>

            {loading ? (
                <div className="p-5 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : !data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Todos los checklists tienen fotografías</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Unidad</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Placas</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Fecha checklist</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((c) => (
                                <tr key={c.checklistId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{c.unidad.no_unidad ?? '—'}</td>
                                    <td className="px-5 py-3.5 text-gray-600 capitalize">{c.unidad.tipo_unidad?.toLowerCase() ?? '—'}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{c.unidad.u_placas ?? '—'}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{formatDate(c.fechaChecklist)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

function AsignacionesEnRutaTable({ data, loading }: { data?: AsignacionEnRutaItem[]; loading: boolean }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Asignaciones en ruta</p>
                    <p className="text-xs text-gray-400 mt-0.5">Unidades con estatus EN_RUTA</p>
                </div>
                {data && data.length > 0 && (
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        {data.length} en ruta
                    </span>
                )}
            </div>

            {loading ? (
                <div className="p-5 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : !data?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="text-sm">No hay asignaciones en ruta</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Unidad</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tipo</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Placas</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Operador</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Caja</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">En ruta desde</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((asignacion) => (
                                <tr key={asignacion.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{asignacion.unidad.no_unidad}</td>
                                    <td className="px-5 py-3.5 text-gray-600 capitalize">{asignacion.unidad.tipo_unidad.toLowerCase()}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{asignacion.unidad.u_placas}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{operadorNombre(asignacion.operador)}</td>
                                    <td className="px-5 py-3.5 text-xs">
                                        {asignacion.caja
                                            ? <>
                                                <span className="text-gray-700 font-medium">
                                                    {asignacion.caja.numero_caja ?? '—'}
                                                </span>
                                                <span className="block text-gray-400">{asignacion.caja.c_placas ?? ''}</span>
                                            </>
                                            : <span className="text-gray-300">—</span>
                                        }
                                    </td>
                                    <td className="px-5 py-3.5 text-xs">
                                        <span className="text-gray-700 font-medium">{diasDesde(asignacion.updatedAt)}</span>
                                        <span className="block text-gray-400">{formatDate(asignacion.updatedAt)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default function KpiDashboardView() {
    const { data: kpis,          isLoading: loadingKpis          } = useKpisResumen()
    const { data: inspecciones,  isLoading: loadingInspecciones  } = useKpisInspecciones()
    const { data: enRuta,        isLoading: loadingEnRuta        } = useAsignacionesEnRuta()
    const { data: sinFotos,      isLoading: loadingSinFotos      } = useSinFotografias()
    const unidadesConRevision = kpis ? kpis.totalUnidades - kpis.sinChecklist : undefined

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-medium text-gray-900">Dashboard de KPIs</h1>
                <p className="text-sm text-gray-500 mt-0.5">Estado general de revisiones, asignaciones e inspecciones</p>
            </div>

            {/* Cobertura de unidades */}
            <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Cobertura de unidades</p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <MetricCard
                        label="Total unidades"
                        value={kpis?.totalUnidades}
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Con revisión"
                        value={unidadesConRevision}
                        accent="info"
                        sub="Asignación o inspección"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Al día"
                        value={kpis?.completos}
                        accent="ok"
                        sub="Última revisión completa"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Sin revisión"
                        value={kpis?.sinChecklist}
                        accent="danger"
                        sub="Sin asignación ni inspección"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="En ruta"
                        value={kpis?.enRuta}
                        accent="info"
                        sub="Asignaciones activas"
                        loading={loadingKpis}
                    />
                </div>
            </div>

            {/* Cobertura de remolques ← nueva sección */}
            <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Cobertura de remolques</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard
                        label="Total remolques"
                        value={inspecciones?.cajas?.total}
                        loading={loadingInspecciones}
                    />
                    <MetricCard
                        label="Con inspección"
                        value={inspecciones?.cajas?.conInspeccion}
                        accent={
                            !inspecciones?.cajas ? 'default' :
                            inspecciones.cajas.porcentaje >= 80 ? 'ok' :
                            inspecciones.cajas.porcentaje >= 40 ? 'warn' : 'danger'
                        }
                        sub={`${inspecciones?.cajas?.porcentaje ?? 0}% del total`}
                        loading={loadingInspecciones}
                    />
                    <MetricCard
                        label="Sin inspección"
                        value={inspecciones?.cajas?.sinInspeccion}
                        accent={
                            !inspecciones?.cajas ? 'default' :
                            inspecciones.cajas.sinInspeccion === 0 ? 'ok' :
                            inspecciones.cajas.sinInspeccion <= 5 ? 'warn' : 'danger'
                        }
                        sub="Sin inspección de patio"
                        loading={loadingInspecciones}
                    />
                </div>
            </div>

            {/* Última revisión de unidades */}
            <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Última revisión de unidades</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        label="+30 días"
                        value={kpis?.mas30dias}
                        accent="warn"
                        sub="Sin revisión reciente"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Pendiente"
                        value={kpis?.revisionPendiente}
                        accent="warn"
                        sub="Asignación sin checklist"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Abierta"
                        value={kpis?.enProgreso}
                        accent="info"
                        sub="Checklist o inspección"
                        loading={loadingKpis}
                    />
                    <MetricCard
                        label="Fotos pendientes"
                        value={kpis?.sinFotos}
                        accent="danger"
                        sub="Última revisión"
                        loading={loadingKpis}
                    />
                </div>
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CompletitudChart
                    data={kpis?.completitudPorTipo}
                    cajas={inspecciones?.cajas}   // ← agregar
                    loading={loadingKpis || loadingInspecciones}
                />
                <EstadoChecklistChart
                    data={kpis}
                    loading={loadingKpis}
                />
            </div>

            <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Actividad de inspecciones</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4"> {/* cambiar md:grid-cols-4 → 5 */}
                    <MetricCard
                        label="Inspecciones"
                        value={inspecciones?.total}
                        loading={loadingInspecciones}
                    />
                    <MetricCard
                        label="Abiertas"
                        value={inspecciones?.enProgreso}
                        accent="info"
                        loading={loadingInspecciones}
                    />
                    <MetricCard
                        label="Fotos pendientes"
                        value={inspecciones?.fotosPendientes}
                        accent="danger"
                        loading={loadingInspecciones}
                    />
                    <MetricCard
                        label="Cerradas"
                        value={inspecciones?.completas}
                        accent="ok"
                        loading={loadingInspecciones}
                    />
                    {/* ← Nueva card */}
                    <MetricCard
                        label="Cajas con inspección"
                        value={inspecciones?.cajas?.conInspeccion}
                        sub={`de ${inspecciones?.cajas?.total ?? '—'} activas · ${inspecciones?.cajas?.porcentaje ?? 0}%`}
                        accent={
                            !inspecciones?.cajas ? 'default' :
                            inspecciones.cajas.porcentaje >= 80 ? 'ok' :
                            inspecciones.cajas.porcentaje >= 40 ? 'warn' : 'danger'
                        }
                        loading={loadingInspecciones}
                    />
                </div>
                <EstadoInspeccionesChart
                    data={inspecciones}
                    loading={loadingInspecciones}
                />
            </div>

            {/* Tablas */}
            <AsignacionesEnRutaTable data={enRuta?.asignaciones} loading={loadingEnRuta} />
            <UnidadesCriticasTable />
            <SinFotografiasTable   data={sinFotos}  loading={loadingSinFotos} />

        </div>
    )
}
