import { useQuery } from '@tanstack/react-query'
import { getKpisResumen, getSinFotografias, getUnidadesCriticas } from '../api/DashboardAPI'

 
export function useKpisResumen() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn:  getKpisResumen,
        staleTime: 1000 * 60 * 5, // 5 min — los KPIs no necesitan refetch constante
    })
}
 
export function useUnidadesCriticas(page: number, limit: number = 10) {
    return useQuery({
        queryKey: ['dashboard', 'criticas', page],
        queryFn:  () => getUnidadesCriticas({ page, limit }),
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    })
}
 
export function useSinFotografias() {
    return useQuery({
        queryKey: ['dashboard', 'sin-fotografias'],
        queryFn:  getSinFotografias,
        staleTime: 1000 * 60 * 5,
    })
}