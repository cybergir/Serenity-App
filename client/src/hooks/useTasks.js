import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'


export function useTasks(destination = 'active', category = '', search='') {
  return useQuery({
    queryKey: ['tasks', destination, category, search],
    queryFn: async () => {
      if (destination === 'active') {
        try { await api.post('/tasks/check-past-due') } catch (e) {}
      }
      let url = `/tasks/?destination=${destination}`
      if (category) url += `&category=${category}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res = await api.get(url)
      return res.data
    },
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useLimboCount() {
  return useQuery({
    queryKey: ['tasks', 'limbo-count'],
    queryFn: async () => {
      // Auto-check past-due before counting limbo
      try {
        await api.post('/tasks/check-past-due')
      } catch (e) {
        // Silent
      }
      const res = await api.get('/tasks/limbo/count')
      return res.data
    },
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useRoutineCount() {
  return useQuery({
    queryKey: ['tasks', 'routine-count'],
    queryFn: () => api.get('/tasks/routine/count').then(res => res.data),
    refetchOnWindowFocus: true,
  })
}

export function useRoutineList() {
  return useQuery({
    queryKey: ['tasks', 'routine-list'],
    queryFn: () => api.get('/tasks/routine/list').then(res => res.data),
    refetchOnWindowFocus: true,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskData) => api.post('/tasks/', taskData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, updates }) => api.patch(`/tasks/${taskId}`, updates).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId) => api.post(`/tasks/${taskId}/complete`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useResolveFromLimbo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, resolution }) => api.post(`/tasks/${taskId}/resolve`, resolution).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}