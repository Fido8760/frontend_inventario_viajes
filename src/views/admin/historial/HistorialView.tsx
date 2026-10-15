import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClockIcon } from '@heroicons/react/24/outline';
import { getUnidades, getOperadores } from '../../../api/AsignacionAPI';
import HistorialSelector from '../../../components/admin/historial/HistorialSelector';
import HistorialCard, { normalizarHistorialUnidad, normalizarHistorialOperador, HistorialItemNormalizado } from '../../../components/admin/historial/HistorialCard';
import { getHistorialOperador, getHistorialUnidad } from '../../../api/DashboardAPI';

type Modo = 'unidad' | 'operador';

export default function HistorialView() {
    const [modo, setModo] = useState<Modo>('unidad');
    const [unidadId, setUnidadId] = useState<number | null>(null);
    const [operadorId, setOperadorId] = useState<number | null>(null);

    // 💡 Usamos arrow function () => getUnidades() y queryKey separada para traer toda la flota
    const { data: unidades } = useQuery({ 
        queryKey: ['unidades-todas'], 
        queryFn: () => getUnidades(false) 
    });
    const { data: operadores } = useQuery({ 
        queryKey: ['operadores-todos'], 
        queryFn: () => getOperadores(false) 
    });

    const { data: historialUnidad, isLoading: cargandoUnidad } = useQuery({
        queryKey: ['historial-unidad', unidadId],
        queryFn: () => getHistorialUnidad(unidadId!),
        enabled: modo === 'unidad' && !!unidadId
    });

    const { data: historialOperador, isLoading: cargandoOperador } = useQuery({
        queryKey: ['historial-operador', operadorId],
        queryFn: () => getHistorialOperador(operadorId!),
        enabled: modo === 'operador' && !!operadorId
    });

    const cargando = modo === 'unidad' ? cargandoUnidad : cargandoOperador;
    const seleccionActiva = modo === 'unidad' ? unidadId : operadorId;

    // Normalizamos usando las funciones que adaptamos en HistorialCard
    const items: HistorialItemNormalizado[] = modo === 'unidad'
        ? (historialUnidad?.asignaciones ?? []).map(normalizarHistorialUnidad)
        : (historialOperador?.asignaciones ?? []).map(normalizarHistorialOperador);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="w-6 h-6 text-[#0f1f3d]" />
                <h1 className="text-2xl font-bold text-gray-900">Historial de Operación</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
                Auditoría histórica de asignaciones y turnos por camión o por chofer
            </p>

            <HistorialSelector
                modo={modo}
                onModoChange={(nuevoModo) => {
                    setModo(nuevoModo);
                    setUnidadId(null);
                    setOperadorId(null);
                }}
                unidades={unidades ?? []}
                operadores={operadores ?? []}
                unidadId={unidadId}
                operadorId={operadorId}
                onUnidadChange={setUnidadId}
                onOperadorChange={setOperadorId}
            />

            {!seleccionActiva && (
                <div className="py-16 text-center text-gray-400">
                    <p className="text-sm font-medium text-gray-600">
                        Selecciona {modo === 'unidad' ? 'una unidad' : 'un operador'} para auditar su historial.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Podrás ver todos los turnos y viajes registrados en su trayectoria.</p>
                </div>
            )}

            {seleccionActiva && cargando && (
                <div className="py-16 text-center text-gray-400 text-sm">
                    Cargando historial de {modo === 'unidad' ? 'la unidad' : 'del operador'}...
                </div>
            )}

            {seleccionActiva && !cargando && items.length === 0 && (
                <div className="py-16 text-center text-gray-400 text-sm">
                    No se encontraron asignaciones ni viajes registrados para esta selección.
                </div>
            )}

            {seleccionActiva && !cargando && items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 px-1 mb-1">
                        <span>Resultados encontrados: {items.length} asignaciones</span>
                        <span>Orden: más recientes primero</span>
                    </div>

                    {items.map((item, i) => {
                        const anterior = items[i - 1];
                        const cambioDeRemolque = !!anterior && !!item.cajaId && anterior.cajaId !== item.cajaId;
                        return (
                            <HistorialCard 
                                key={item.id} 
                                item={item} 
                                cambioDeRemolque={cambioDeRemolque} 
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}