import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useMicroWins() {
  return useQuery({
    queryKey: ['micro-wins'],
    queryFn: () => api.get('/micro-wins/').then(res => res.data)
  })
}

export function useCreateMicroWin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content) => api.post('/micro-wins/', { content }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-wins'] })
    }
  })
}