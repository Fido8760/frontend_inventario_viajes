import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDate } from '../../../utils/formatDate'
import { ChecklistSinFotos, CompletitudPorTipo, UnidadCritica } from '../../../types'
import { useKpisResumen, useSinFotografias, useUnidadesCriticas } from '../../../hooks/useDashboard'
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
    return motivo === 'sin_checklist' ? 'Sin checklist' : '+30 días'
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
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

function CompletitudChart({ data, loading }: { data?: CompletitudPorTipo[]; loading: boolean }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Completitud por tipo de unidad
            </p>
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
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
                </div>
            )}
        </div>
    )
}

// ─── Checklists bar chart ─────────────────────────────────────────────────────

function EstadoChecklistChart({ data, loading }: {
    data?: { sinChecklist: number; enProgreso: number; completos: number; sinFotos: number }
    loading: boolean
}) {
    const chartData = [
        { name: 'Sin checklist', value: data?.sinChecklist ?? 0, color: '#e5e7eb' },
        { name: 'En progreso',   value: data?.enProgreso   ?? 0, color: '#fbbf24' },
        { name: 'Completos',     value: data?.completos    ?? 0, color: '#15803d' },
        { name: 'Sin fotos',     value: data?.sinFotos     ?? 0, color: '#dc2626' },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                Estado de checklists
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
                    <p className=' text-xs text-gray-400 mt-0.5'>Sin checklist o más de 30 días sin revisión</p>
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
                            <tr className=' text-left'>
                                <th className='px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide'>Unidad</th>
                                <th className='px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide'>Tipo</th>
                                <th className='px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide'>Placas</th>
                                <th className='px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide'>Motivo</th>
                                <th className='px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide'>Días sin revisión</th>
                            </tr>
                        </thead>
                        <tbody className=' divide-y divide-gray-50'>
                            {criticas.map((u) => (
                                <tr key={u.id} className=' hover:bg-gray-50 transition-colors'>
                                    <td className='px-5 py-3.5 font-medium text-gray-900'>{u.no_unidad}</td>
                                    <td className='px-5 py-3.5 text-gray-600 capitalize'>{u.tipo_unidad.toLowerCase()}</td>
                                    <td className=' px-5 py-3.5 text-gray-500'>{u.u_placas}</td>
                                    <td className=' px-5 py-3.5'>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                            u.motivo === 'sin_checklist'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {motivoLabel(u.motivo)}
                                        </span>
                                    </td>
                                    <td className=' px-5 py-3.5 text-gray-500'>
                                        {u.diasSinRevision !== null ? `${u.diasSinRevision}` : `-`}
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
                                    className=' px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
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

export default function KpiDashboardView() {
    const { data: kpis,     isLoading: loadingKpis     } = useKpisResumen()
    const { data: sinFotos, isLoading: loadingSinFotos } = useSinFotografias()

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-medium text-gray-900">Dashboard de KPIs</h1>
                <p className="text-sm text-gray-500 mt-0.5">Estado general del programa de checklist de unidades</p>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard
                    label="Total unidades"
                    value={kpis?.totalUnidades}
                    loading={loadingKpis}
                />
                <MetricCard
                    label="Sin checklist"
                    value={kpis?.sinChecklist}
                    accent="danger"
                    sub="Nunca revisadas"
                    loading={loadingKpis}
                />
                <MetricCard
                    label="+30 días"
                    value={kpis?.mas30dias}
                    accent="warn"
                    sub="Sin revisión reciente"
                    loading={loadingKpis}
                />
                <MetricCard
                    label="En progreso"
                    value={kpis?.enProgreso}
                    accent="info"
                    sub="Checklist abierto"
                    loading={loadingKpis}
                />
                <MetricCard
                    label="Completos"
                    value={kpis?.completos}
                    accent="ok"
                    sub="Con fotos subidas"
                    loading={loadingKpis}
                />
                <MetricCard
                    label="Sin fotos"
                    value={kpis?.sinFotos}
                    accent="danger"
                    sub="Fotos pendientes"
                    loading={loadingKpis}
                />
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CompletitudChart
                    data={kpis?.completitudPorTipo}
                    loading={loadingKpis}
                />
                <EstadoChecklistChart
                    data={kpis}
                    loading={loadingKpis}
                />
            </div>

            {/* Tablas */}
            <UnidadesCriticasTable />
            <SinFotografiasTable   data={sinFotos}  loading={loadingSinFotos} />

        </div>
    )
}