import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useOffDays() {
  return useQuery({
    queryKey: ['off-days'],
    queryFn: () => api.get('/off-days/').then(res => res.data)
  })
}

export function useUpcomingOffDays(days = 7) {
  return useQuery({
    queryKey: ['off-days', 'upcoming', days],
    queryFn: () => api.get(`/off-days/upcoming/soon?days=${days}`).then(res => res.data)
  })
}

export function useCreateOffDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/off-days/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['off-days'] })
    }
  })
}