import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { DashboardResponse, Settings } from '@/services/types'
import { queryKeys } from '@/services/queryKeys'

export function useProtectionToggle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => api.settings.patch({ protectionEnabled: enabled }),
    onMutate: async (enabled: boolean) => {
      await qc.cancelQueries({ queryKey: queryKeys.dashboard })
      await qc.cancelQueries({ queryKey: queryKeys.settings })
      const prevDashboard = qc.getQueryData<DashboardResponse>(queryKeys.dashboard)
      const prevSettings = qc.getQueryData<Settings>(queryKeys.settings)
      if (prevDashboard) {
        qc.setQueryData<DashboardResponse>(queryKeys.dashboard, { ...prevDashboard, protectionEnabled: enabled })
      }
      if (prevSettings) {
        qc.setQueryData<Settings>(queryKeys.settings, { ...prevSettings, protectionEnabled: enabled })
      }
      return { prevDashboard, prevSettings }
    },
    onError: (_err, _enabled, ctx) => {
      if (ctx?.prevDashboard) qc.setQueryData(queryKeys.dashboard, ctx.prevDashboard)
      if (ctx?.prevSettings) qc.setQueryData(queryKeys.settings, ctx.prevSettings)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}
