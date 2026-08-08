import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function usePulseHistory(limit = 30) {
  return useQuery({
    queryKey: ['daily-pulse', 'history', limit],
    queryFn: () => api.get(`/daily-pulse/history?limit=${limit}`).then(res => res.data)
  })
}

export function useTotalWins() {
  return useQuery({
    queryKey: ['micro-wins', 'total'],
    queryFn: () => api.get('/micro-wins/count/total').then(res => res.data)
  })
}