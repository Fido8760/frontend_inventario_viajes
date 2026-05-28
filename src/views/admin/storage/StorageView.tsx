// views/admin/storage/StorageView.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getChecklistsParaLimpiar, limpiarFotosChecklist } from '../../../api/StorageAPI'

export default function StorageView() {
    const queryClient = useQueryClient()
    const [antiguedad, setAntiguedad] = useState(1)
    const [seleccionados, setSeleccionados] = useState<number[]>([])

    const { data, isLoading } = useQuery({
        queryKey: ['storage', 'checklists', antiguedad],
        queryFn:  () => getChecklistsParaLimpiar(antiguedad),
    })

    const limpiarMutation = useMutation({
        mutationFn: limpiarFotosChecklist,
        onSuccess: (_, checklistId) => {
            toast.success(`Fotos del checklist #${checklistId} eliminadas`)
            setSeleccionados(prev => prev.filter(id => id !== checklistId))
            queryClient.invalidateQueries({ queryKey: ['storage'] })
        },
        onError: () => toast.error('Error al eliminar fotos')
    })

    const toggleSeleccion = (id: number) => {
        setSeleccionados(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleTodos = () => {
        const conFotos = data?.data.filter(c => c.tieneFotos).map(c => c.checklistId) ?? []
        setSeleccionados(prev => prev.length === conFotos.length ? [] : conFotos)
    }

    const limpiarSeleccionados = async () => {
        for (const id of seleccionados) {
            await limpiarMutation.mutateAsync(id)
        }
    }

    const checklists = data?.data ?? []
    const conFotos   = checklists.filter(c => c.tieneFotos)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-medium text-gray-900">Gestión de almacenamiento</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Elimina fotos antiguas de Cloudinary conservando el historial en BD
                </p>
            </div>

            {/* Filtro antigüedad */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                <p className="text-sm text-gray-700 font-medium">Mostrar checklists con más de</p>
                <select
                    value={antiguedad}
                    onChange={e => { setAntiguedad(+e.target.value); setSeleccionados([]) }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
                >
                    <option value={1}>1 año</option>
                    <option value={2}>2 años</option>
                    <option value={3}>3 años</option>
                </select>
                <p className="text-sm text-gray-400">
                    {checklists.length} checklists encontrados — {conFotos.length} con fotos
                </p>
            </div>

            {/* Acciones */}
            {conFotos.length > 0 && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={toggleTodos}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {seleccionados.length === conFotos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                    {seleccionados.length > 0 && (
                        <button
                            onClick={limpiarSeleccionados}
                            disabled={limpiarMutation.isPending}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {limpiarMutation.isPending
                                ? 'Eliminando...'
                                : `Eliminar fotos de ${seleccionados.length} checklist${seleccionados.length > 1 ? 's' : ''}`
                            }
                        </button>
                    )}
                </div>
            )}

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-gray-400">Cargando...</div>
                ) : !checklists.length ? (
                    <div className="p-8 text-center text-sm text-gray-400">
                        No hay checklists con más de {antiguedad} año{antiguedad > 1 ? 's' : ''}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.length === conFotos.length && conFotos.length > 0}
                                        onChange={toggleTodos}
                                    />
                                </th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Unidad</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Placas</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Fecha checklist</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Fotos</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</th>
                                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {checklists.map(c => (
                                <tr key={c.checklistId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <input
                                            type="checkbox"
                                            disabled={!c.tieneFotos}
                                            checked={seleccionados.includes(c.checklistId)}
                                            onChange={() => toggleSeleccion(c.checklistId)}
                                        />
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-gray-900">{c.unidad}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{c.placas}</td>
                                    <td className="px-5 py-3.5 text-gray-500">
                                        {new Date(c.fecha).toLocaleDateString('es-MX')}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">{c.totalFotos}</td>
                                    <td className="px-5 py-3.5">
                                        {c.tieneFotos ? (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                                Con fotos
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                                Ya limpio
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {c.tieneFotos && (
                                            <button
                                                onClick={() => limpiarMutation.mutate(c.checklistId)}
                                                disabled={limpiarMutation.isPending}
                                                className="text-xs text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                Limpiar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}