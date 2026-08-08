import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useBrainDumps(processed = false) {
  return useQuery({
    queryKey: ['brain-dumps', processed],
    queryFn: () => api.get(`/brain-dumps/?processed=${processed}`).then(res => res.data)
  })
}

export function useCreateBrainDump() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content) => api.post('/brain-dumps/', { content }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-dumps'] })
    }
  })
}