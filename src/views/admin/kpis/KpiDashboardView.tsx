import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { ArrowPathIcon, CameraIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon, TruckIcon, } from "@heroicons/react/24/outline";
import MetricCard from "../../../components/dashboard/MetricCard";
import { useKpisResumen } from "../../../hooks/useDashboard";
import { formatDate } from "../../../utils/formatDate";
import type { ViajeAtascado } from "../../../types/dashboard";

const PAGE_SIZE = 10;
const COLORS = ["#0f1f3d", "#b91c1c", "#2563eb", "#f59e0b"];

export default function KpiDashboardView() {
    const { data: kpis, isLoading: loadingKpis, isError, refetch, isFetching } = useKpisResumen();
    const [atascadosPage, setAtascadosPage] = useState(1);
    const [rankingPage, setRankingPage] = useState(1);
    const [unidadesPage, setUnidadesPage] = useState(1);
    const [cajasPage, setCajasPage] = useState(1);

    const flota = kpis?.coberturaFlota;
    const puntosCiegos = kpis?.puntosCiegos;
    const atascados = kpis?.checklistsAtascados;
    const ranking = kpis?.rankingMenorAtencion ?? [];
    const unidadesSinChecklist = puntosCiegos?.unidadesSinChecklist ?? [];
    const cajasSinChecklist = puntosCiegos?.cajasSinChecklist ?? [];

    const flotaChartData = useMemo(() => ([
        { name: "Asignadas", value: flota?.asignadas ?? 0 },
        { name: "En patio", value: flota?.sinAsignar ?? 0 },
    ]), [flota]);

    const completitudData = useMemo(() => (
        (kpis?.completitudPorTipo ?? []).map(item => ({
            ...item,
            tipo: tipoLabel(item.tipo),
        }))
    ), [kpis]);

    const resumenRiesgo = useMemo(() => {
        const totalPuntosCiegos = (puntosCiegos?.totalUnidadesSinChecklist ?? 0) + (puntosCiegos?.totalCajasSinChecklist ?? 0);
        const totalAtascados = atascados?.total ?? 0;
        return totalPuntosCiegos + totalAtascados;
    }, [atascados, puntosCiegos]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">KPIs operativos</p>
                    <h1 className="text-2xl font-bold text-gray-900">Auditoría de flota y revisiones</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Una vista rápida para detectar pendientes, priorizar unidades y cerrar revisiones.</p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Actualizar
                </button>
            </div>

            {isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    No se pudieron cargar los KPIs. Intenta actualizar el tablero.
                </div>
            )}

            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard label="Flota total" value={flota?.totalUnidades} loading={loadingKpis} sub="Unidades activas" />
                <MetricCard label="Asignadas" value={flota?.asignadas} accent="ok" loading={loadingKpis} sub={`${flota?.porcentajeAsignadas ?? 0}% de la flota`} />
                <MetricCard label="En patio" value={flota?.sinAsignar} accent="warn" sub="Disponibles sin operador" loading={loadingKpis} />
                <MetricCard label="En carretera" value={flota?.enRuta} accent="info" sub="Viajes actualmente en ruta" loading={loadingKpis} />
                <MetricCard label="Alertas abiertas" value={resumenRiesgo} accent="danger" sub="Puntos ciegos + atascados" loading={loadingKpis} />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Cobertura de flota</h2>
                            <p className="text-xs text-gray-400">Asignadas contra unidades en patio</p>
                        </div>
                        <TruckIcon className="h-5 w-5 text-[#0f1f3d]" />
                    </div>
                    {loadingKpis ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={flotaChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                                        {flotaChartData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${Number(value ?? 0)} unidades`, "Total"]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <LegendDot color="#0f1f3d" label="Asignadas" value={flota?.asignadas ?? 0} />
                        <LegendDot color="#b91c1c" label="En patio" value={flota?.sinAsignar ?? 0} />
                    </div>
                </div>

                <div className="xl:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Cobertura de revisiones por tipo</h2>
                            <p className="text-xs text-gray-400">Porcentaje de unidades que ya tienen al menos una revisión registrada</p>
                        </div>
                        <ChartBarIcon className="h-5 w-5 text-[#0f1f3d]" />
                    </div>
                    {loadingKpis ? (
                        <ChartSkeleton />
                    ) : completitudData.length ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={completitudData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="tipo" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
                                    <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, "Cobertura"]} />
                                    <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]} fill="#0f1f3d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="Sin datos suficientes para graficar cobertura." />
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard label="Camiones jamás revisados" value={puntosCiegos?.totalUnidadesSinChecklist} accent="danger" sub="Unidades con 0 revisiones" loading={loadingKpis} />
                <MetricCard label="Remolques jamás revisados" value={puntosCiegos?.totalCajasSinChecklist} accent="danger" sub="Cajas sin revisión física registrada" loading={loadingKpis} />
                <MetricCard label="Checklists inconclusos" value={atascados?.total} accent="warn" sub="Viajes iniciados y pendientes de cierre" loading={loadingKpis} />
            </section>

            <KpiTable
                title="Inspecciones atascadas"
                subtitle="Viajes que necesitan continuar checklist o subir fotos"
                count={atascados?.total ?? 0}
                icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
                loading={loadingKpis}
                data={atascados?.viajes ?? []}
                page={atascadosPage}
                onPageChange={setAtascadosPage}
                emptyText="No hay checklists atascados. Todos los viajes en curso están al día."
                columns={["Unidad", "Operador", "Estado", "Capturista", "Inicio", "Acción"]}
                renderRow={(v) => (
                    <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-gray-900">Unidad {v.no_unidad}</td>
                        <td className="px-6 py-3.5 text-gray-700">{v.operador}</td>
                        <td className="px-6 py-3.5"><StatusPill status={v.status} /></td>
                        <td className="px-6 py-3.5 text-gray-500">{v.capturista}</td>
                        <td className="px-6 py-3.5 text-gray-400">{formatDate(v.createdAt)}</td>
                        <td className="px-6 py-3.5 text-right">
                            <Link to={resolverPath(v)} className="font-semibold text-[#0f1f3d] hover:underline">
                                Resolver
                            </Link>
                        </td>
                    </tr>
                )}
            />

            <KpiTable
                title="Prioridad preventiva"
                subtitle="Unidades con menor cantidad de revisiones acumuladas"
                count={ranking.length}
                icon={<ClipboardDocumentCheckIcon className="h-5 w-5 text-[#0f1f3d]" />}
                loading={loadingKpis}
                data={ranking}
                page={rankingPage}
                onPageChange={setRankingPage}
                emptyText="Sin datos de unidades."
                columns={["Unidad", "Tipo", "Placas", "Estado actual", "En viajes", "En patio", "Total"]}
                renderRow={(u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-gray-900">Unidad {u.no_unidad}</td>
                        <td className="px-6 py-3.5 text-gray-500">{tipoLabel(u.tipo_unidad)}</td>
                        <td className="px-6 py-3.5 text-gray-400 font-mono">{u.u_placas}</td>
                        <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${u.estaAsignada ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                {u.estaAsignada ? "Asignada" : "En patio"}
                            </span>
                        </td>
                        <td className="px-6 py-3.5 text-center text-gray-600 font-semibold">{u.revViajes}</td>
                        <td className="px-6 py-3.5 text-center text-gray-600 font-semibold">{u.revPatio}</td>
                        <td className="px-6 py-3.5 text-right font-bold"><RevisionBadge total={u.totalRevisiones} /></td>
                    </tr>
                )}
            />

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <KpiTable
                    title="Camiones punto ciego"
                    subtitle="Unidades activas sin revisiones registradas"
                    count={unidadesSinChecklist.length}
                    icon={<TruckIcon className="h-5 w-5 text-red-600" />}
                    loading={loadingKpis}
                    data={unidadesSinChecklist}
                    page={unidadesPage}
                    onPageChange={setUnidadesPage}
                    emptyText="No hay camiones sin revisión."
                    columns={["Unidad", "Tipo", "Placas", "Estado"]}
                    renderRow={(u) => (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-gray-900">Unidad {u.no_unidad}</td>
                            <td className="px-6 py-3.5 text-gray-500">{tipoLabel(u.tipo_unidad)}</td>
                            <td className="px-6 py-3.5 text-gray-400 font-mono">{u.u_placas}</td>
                            <td className="px-6 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${u.estaAsignada ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                    {u.estaAsignada ? "Asignada" : "En patio"}
                                </span>
                            </td>
                        </tr>
                    )}
                />

                <KpiTable
                    title="Remolques punto ciego"
                    subtitle="Cajas activas sin inspección física registrada"
                    count={cajasSinChecklist.length}
                    icon={<CameraIcon className="h-5 w-5 text-red-600" />}
                    loading={loadingKpis}
                    data={cajasSinChecklist}
                    page={cajasPage}
                    onPageChange={setCajasPage}
                    emptyText="No hay remolques sin revisión."
                    columns={["Caja", "Placas", "Marca"]}
                    renderRow={(c) => (
                        <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-gray-900">Caja {c.numero_caja}</td>
                            <td className="px-6 py-3.5 text-gray-400 font-mono">{c.c_placas}</td>
                            <td className="px-6 py-3.5 text-gray-500">{c.c_marca ?? "Sin marca"}</td>
                        </tr>
                    )}
                />
            </section>
        </div>
    );
}

function KpiTable<T>({
    title,
    subtitle,
    count,
    icon,
    loading,
    data,
    page,
    onPageChange,
    emptyText,
    columns,
    renderRow,
}: {
    title: string;
    subtitle: string;
    count: number;
    icon: ReactNode;
    loading: boolean;
    data: T[];
    page: number;
    onPageChange: (page: number) => void;
    emptyText: string;
    columns: string[];
    renderRow: (item: T) => ReactNode;
}) {
    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibleRows = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-gray-50 p-2">{icon}</div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                    </div>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {count} registros
                </span>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">Cargando datos...</div>
            ) : !data.length ? (
                <EmptyState text={emptyText} />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50/70 text-gray-400 uppercase font-semibold">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th key={column} className={`px-6 py-3 ${index === columns.length - 1 ? "text-right" : ""}`}>
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visibleRows.map(renderRow)}
                            </tbody>
                        </table>
                    </div>
                    {data.length > PAGE_SIZE && (
                        <LocalPagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} total={data.length} />
                    )}
                </>
            )}
        </div>
    );
}

function LocalPagination({ page, totalPages, total, onPageChange }: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}) {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
            <span>Mostrando {start}-{end} de {total}</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 disabled:opacity-40"
                    aria-label="Página anterior"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="font-medium text-gray-700">Página {page} de {totalPages}</span>
                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 disabled:opacity-40"
                    aria-label="Página siguiente"
                >
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        CREADA: { label: "Sin iniciar", cls: "bg-gray-100 text-gray-700" },
        CHECKLIST_PENDIENTE: { label: "En preguntas", cls: "bg-blue-50 text-blue-700" },
        FOTOS_PENDIENTES: { label: "Faltan fotos", cls: "bg-amber-50 text-amber-700" },
    };
    const item = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
    return <span className={`px-2 py-0.5 rounded-full font-medium ${item.cls}`}>{item.label}</span>;
}

function RevisionBadge({ total }: { total: number }) {
    const cls = total === 0
        ? "bg-red-100 text-red-700"
        : total <= 2
            ? "bg-amber-100 text-amber-800"
            : "bg-gray-100 text-gray-800";

    return (
        <span className={`px-2 py-0.5 rounded-md ${cls}`}>
            {total} {total === 1 ? "revisión" : "revisiones"}
        </span>
    );
}

function ChartSkeleton() {
    return <div className="h-64 animate-pulse rounded-lg bg-gray-100" />;
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="py-12 text-center text-xs text-gray-400">
            {text}
        </div>
    );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="flex items-center gap-2 text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
            </span>
            <span className="font-bold text-gray-800">{value}</span>
        </div>
    );
}

function resolverPath(viaje: ViajeAtascado) {
    if (viaje.status === "FOTOS_PENDIENTES" && viaje.checklistId) {
        return `/asignacion/${viaje.asignacionId}/recorridos/${viaje.id}/checklist/${viaje.checklistId}/uploadImages`;
    }

    if (viaje.checklistId) {
        return `/asignacion/${viaje.asignacionId}/recorridos/${viaje.id}/checklist/${viaje.checklistId}`;
    }

    return `/asignacion/${viaje.asignacionId}/recorridos/${viaje.id}`;
}

function tipoLabel(tipo: string) {
    const map: Record<string, string> = {
        TRACTOCAMION: "Tractocamión",
        MUDANCERO: "Mudancero",
        CAMIONETA: "Camioneta",
        tractocamion: "Tractocamión",
        mudancero: "Mudancero",
        camioneta: "Camioneta",
    };
    return map[tipo] ?? tipo;
}
