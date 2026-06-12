import { useQuery } from '@tanstack/react-query'
import { getAsignacionesEnRuta, getKpisInspecciones, getKpisResumen, getSinFotografias, getUnidadesCriticas } from '../api/DashboardAPI'

export function useKpisResumen() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn:  getKpisResumen,
    })
}

export function useUnidadesCriticas(page: number, limit: number = 10) {
    return useQuery({
        queryKey: ['dashboard', 'criticas', page],
        queryFn:  () => getUnidadesCriticas({ page, limit }),
        refetchOnWindowFocus: true
    })
}
 
export function useSinFotografias() {
    return useQuery({
        queryKey: ['dashboard', 'sin-fotografias'],
        queryFn:  getSinFotografias,
        refetchOnWindowFocus: true,
    })
}

export function useKpisInspecciones() {
    return useQuery({
        queryKey: ['dashboard', 'kpis', 'inspecciones'],
        queryFn:  getKpisInspecciones,
        refetchOnWindowFocus: true,
    })
}

export function useAsignacionesEnRuta() {
    return useQuery({
        queryKey: ['dashboard', 'asignaciones', 'en-ruta'],
        queryFn:  getAsignacionesEnRuta,
        refetchOnWindowFocus: true,
    })
}
