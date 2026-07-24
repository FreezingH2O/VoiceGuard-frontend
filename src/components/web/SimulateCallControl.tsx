import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PhoneCall } from 'lucide-react'
import { api } from '@/services/api'
import { useToast } from '@/components/ToastProvider'
import { useLang } from '@/i18n/LangProvider'

/**
 * Starts a monitored call session for the preview zone.
 *
 * This deliberately lives on the dark web page *outside* the phone, not on a phone
 * screen. On a real device PaTuean checks calls in the background — there is nothing
 * for the user to activate — so a "check a call now" button inside the app would
 * misrepresent the product. Here it reads as what it is: a demo trigger the person
 * driving the preview presses to make a call happen.
 */
export function SimulateCallControl() {
  const { t } = useLang()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const startCall = useMutation({
    mutationFn: () => api.calls.start({ callerNumber: 'unknown', direction: 'inbound' }),
    onSuccess: (res) => {
      if (res.monitoring) {
        navigate(`/app-preview/call/${res.callId}`, { state: { wsUrl: res.wsUrl, wsToken: res.wsToken } })
      } else {
        showToast({
          message:
            res.reason === 'protection_disabled'
              ? t({ en: 'Turn protection on in the app to monitor a call.', th: 'เปิดการป้องกันในแอปเพื่อเฝ้าระวังสาย' })
              : t({ en: 'Call monitoring is not available right now.', th: 'ขณะนี้ยังไม่สามารถเฝ้าระวังสายได้' }),
          tone: 'error',
        })
      }
    },
    onError: () =>
      showToast({
        message: t({ en: "Couldn't start monitoring, try again.", th: 'เริ่มการเฝ้าระวังไม่สำเร็จ กรุณาลองอีกครั้ง' }),
        tone: 'error',
      }),
  })

  return (
    <div className="rounded-web-card border border-white/10 bg-white/[0.03] p-4">
      <p className="text-body-medium font-semibold text-white">
        {t({ en: 'Simulate an incoming call', th: 'จำลองสายเรียกเข้า' })}
      </p>
      <p className="mt-1 text-small text-mist-300">
        {t({
          en: 'A demo trigger — on a real phone this starts by itself whenever a call comes in.',
          th: 'ปุ่มสำหรับเดโม — บนมือถือจริงจะเริ่มเองทุกครั้งที่มีสายเข้า',
        })}
      </p>
      <button
        type="button"
        onClick={() => startCall.mutate()}
        disabled={startCall.isPending}
        className="mt-3 inline-flex items-center gap-2 rounded-button bg-coral-500 px-4 py-2.5 text-body-sm font-semibold text-white transition hover:bg-coral-400 disabled:opacity-60"
      >
        <PhoneCall className="h-4 w-4" aria-hidden="true" />
        {startCall.isPending ? t({ en: 'Starting…', th: 'กำลังเริ่ม…' }) : t({ en: 'Start a call', th: 'เริ่มสาย' })}
      </button>
    </div>
  )
}
