import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useShoppingList(isPurchased = false) {
  return useQuery({
    queryKey: ['shopping', isPurchased],
    queryFn: () => api.get(`/shopping/?is_purchased=${isPurchased}`).then(res => res.data)
  })
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/shopping/', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping'] })
    }
  })
}

export function useMarkPurchased() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => api.post(`/shopping/${itemId}/purchase`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping'] })
    }
  })
}