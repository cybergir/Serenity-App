import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useTodayPulse() {
  return useQuery({
    queryKey: ['daily-pulse', 'today'],
    queryFn: () => api.get('/daily-pulse/today').then(res => res.data)
  })
}

export function useAnswerPulse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pulseId, answer }) => api.post(`/daily-pulse/${pulseId}/answer`, { answer }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-pulse'] })
    }
  })
}

export function useSkipPulse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pulseId) => api.post(`/daily-pulse/${pulseId}/skip`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-pulse'] })
    }
  })
}