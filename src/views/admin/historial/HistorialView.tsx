import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClockIcon } from '@heroicons/react/24/outline'
import { getUnidades, getOperadores, } from '../../../api/AsignacionAPI'
import HistorialSelector from '../../../components/admin/historial/HistorialSelector'
import HistorialCard, { normalizarHistorialUnidad, normalizarHistorialOperador, HistorialItemNormalizado } from '../../../components/admin/historial/HistorialCard'
import { getHistorialOperador, getHistorialUnidad } from '../../../api/DashboardAPI'

type Modo = 'unidad' | 'operador'

export default function HistorialView() {
    const [modo, setModo] = useState<Modo>('unidad')
    const [unidadId, setUnidadId] = useState<number | null>(null)
    const [operadorId, setOperadorId] = useState<number | null>(null)

    const { data: unidades } = useQuery({ queryKey: ['unidades'], queryFn: getUnidades })
    const { data: operadores } = useQuery({ queryKey: ['operadores'], queryFn: getOperadores })

    const { data: historialUnidad, isLoading: cargandoUnidad } = useQuery({
        queryKey: ['historial-unidad', unidadId],
        queryFn: () => getHistorialUnidad(unidadId!),
        enabled: modo === 'unidad' && !!unidadId
    })

    const { data: historialOperador, isLoading: cargandoOperador } = useQuery({
        queryKey: ['historial-operador', operadorId],
        queryFn: () => getHistorialOperador(operadorId!),
        enabled: modo === 'operador' && !!operadorId
    })

    const cargando = modo === 'unidad' ? cargandoUnidad : cargandoOperador
    const seleccionActiva = modo === 'unidad' ? unidadId : operadorId

    const items: HistorialItemNormalizado[] = modo === 'unidad'
        ? (historialUnidad?.asignaciones ?? []).map(normalizarHistorialUnidad)
        : (historialOperador?.asignaciones ?? []).map(normalizarHistorialOperador)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="w-5 h-5 text-[#0f1f3d]" />
                <h1 className="text-2xl font-medium text-gray-900">Historial</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">Consulta todos los viajes de una unidad o de un operador</p>

            <HistorialSelector
                modo={modo}
                onModoChange={setModo}
                unidades={unidades ?? []}
                operadores={operadores ?? []}
                unidadId={unidadId}
                operadorId={operadorId}
                onUnidadChange={setUnidadId}
                onOperadorChange={setOperadorId}
            />

            {!seleccionActiva && (
                <p className="text-sm text-gray-400 text-center py-8">
                    Selecciona {modo === 'unidad' ? 'una unidad' : 'un operador'} para ver su historial.
                </p>
            )}

            {seleccionActiva && cargando && (
                <p className="text-sm text-gray-400 text-center py-8">Cargando historial...</p>
            )}

            {seleccionActiva && !cargando && items.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No hay viajes registrados todavía.</p>
            )}

            {seleccionActiva && !cargando && items.length > 0 && (
                <div className="space-y-3">
                    {items.map((item, i) => {
                        const anterior = items[i - 1]
                        const cambioDeRemolque = !!anterior && !!item.cajaId && anterior.cajaId !== item.cajaId
                        return (
                            <HistorialCard key={item.id} item={item} cambioDeRemolque={cambioDeRemolque} />
                        )
                    })}
                </div>
            )}
        </div>
    )
}