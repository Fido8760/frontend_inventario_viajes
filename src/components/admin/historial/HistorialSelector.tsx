import { OperadoresList } from "../../../types/operador"
import { UnidadesList } from "../../../types/unidad"


type Modo = 'unidad' | 'operador'

type HistorialSelectorProps = {
    modo: Modo
    onModoChange: (modo: Modo) => void
    unidades: UnidadesList
    operadores: OperadoresList
    unidadId: number | null
    operadorId: number | null
    onUnidadChange: (id: number | null) => void
    onOperadorChange: (id: number | null) => void
}

export default function HistorialSelector({ modo, onModoChange, unidades, operadores, unidadId, operadorId, onUnidadChange, onOperadorChange }: HistorialSelectorProps) {
    return (
        <>
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => onModoChange('unidad')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        modo === 'unidad' ? 'bg-[#0f1f3d] text-white' : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                    Por unidad
                </button>
                <button
                    onClick={() => onModoChange('operador')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        modo === 'operador' ? 'bg-[#0f1f3d] text-white' : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                    Por operador
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                {modo === 'unidad' ? (
                    <select 
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0f1g3d] bg-white"
                        value={unidadId ?? ''}
                        onChange={e => onUnidadChange(e.target.value ? +e.target.value : null)}
                    >
                        <option value="">-- Selecciona una unidad --</option>
                        {unidades.map(u => (
                            <option value={u.id} key={u.id}>{u.no_unidad} · {u.tipo_unidad} · {u.u_placas}</option>
                        ))}
                    </select>
                ) : (
                    <select 
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0f1g3d] bg-white"
                        value={operadorId ?? ''}
                        onChange={e => onOperadorChange(e.target.value ? +e.target.value : null)}
                    >
                        <option value="">-- Selecciona un operador --</option>
                        {operadores.map(o => (
                            <option key={o.id} value={o.id}>{o.apellido_p} {o.apellido_m} {o.nombre}</option>
                        ))}
                    </select>
                )}
            </div>
        </>
    )
}
