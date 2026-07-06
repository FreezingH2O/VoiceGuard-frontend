import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <TriangleAlert className="h-10 w-10 text-warn-500" aria-hidden="true" />
      <p className="text-body-medium text-white">{message}</p>
      <Button variant="outline-neutral" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
