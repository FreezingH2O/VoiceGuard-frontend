import { TriangleAlert } from 'lucide-react'
import { useLang } from '@/i18n/LangProvider'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLang()
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <TriangleAlert className="h-10 w-10 text-warn-500" aria-hidden="true" />
      <p className="text-body-medium text-white">{message ?? t({ en: 'Something went wrong.', th: 'เกิดข้อผิดพลาดบางอย่าง' })}</p>
      <Button variant="outline-neutral" onClick={onRetry}>
        {t({ en: 'Try again', th: 'ลองอีกครั้ง' })}
      </Button>
    </div>
  )
}
