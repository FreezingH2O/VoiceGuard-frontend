import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from '@/hooks/useAuth'
import { LangProvider } from '@/i18n/LangProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  )
}

export default App
