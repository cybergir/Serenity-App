import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useVaultItems(itemType = '') {
  return useQuery({
    queryKey: ['vault', itemType],
    queryFn: () => {
      const url = itemType ? `/vault/?item_type=${itemType}` : '/vault/'
      return api.get(url).then(res => res.data)
    }
  })
}

export function useCreateVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/vault/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] })
    }
  })
}

export function useDeleteVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => api.delete(`/vault/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] })
    }
  })
}