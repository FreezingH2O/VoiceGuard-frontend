import { Shield, X, Phone } from 'lucide-react'
import { Banner } from '@/components/Pill'
import { Button } from '@/components/Button'
import { getScenarioCallerName } from '@/services/mock/scenarios.data'
import { ScenarioIcon } from '@/lib/scenarioIcons'
import { useLang } from '@/i18n/LangProvider'

export function DemoIncomingCallScreen({
  scenarioId,
  onDecline,
  onAccept,
}: {
  scenarioId: string
  onDecline: () => void
  onAccept: () => void
}) {
  const { t } = useLang()
  const caller = getScenarioCallerName(scenarioId)

  return (
    <div className="flex flex-1 flex-col bg-night text-fg">
      <Banner tone="demo">
        {t({ en: 'PREVIEW · simulated call showing the in-call experience', th: 'ตัวอย่าง · สายจำลองเพื่อแสดงประสบการณ์ระหว่างสาย' })}
      </Banner>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center sm:max-w-lg md:max-w-xl">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60 ring-2 ring-white/10">
          <ScenarioIcon slug={caller.icon} className="h-10 w-10 text-white" />
        </span>
        <div>
          <p className="text-h1-mobile font-bold">{caller.name}</p>
          <p className="mt-1 text-body text-mid">{t({ en: 'Unknown number', th: 'เบอร์ที่ไม่รู้จัก' })}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold-400/40 bg-gold-400/15 px-3 py-1.5 text-body-sm font-semibold text-accent">
          <Shield className="h-4 w-4" aria-hidden="true" /> {t({ en: 'PaTuean is monitoring', th: 'ป้าเตือน กำลังเฝ้าระวัง' })}
        </span>
      </div>

      <div className="flex justify-center border-t border-hairline/10 bg-panel py-8">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-16 sm:max-w-lg md:max-w-xl">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="danger"
              aria-label={t({ en: 'Decline', th: 'ปฏิเสธสาย' })}
              className="!h-16 !w-16 !rounded-full !p-0"
              onClick={onDecline}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
            <span className="text-caption text-mid">{t({ en: 'Decline', th: 'ปฏิเสธสาย' })}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="primary"
              aria-label={t({ en: 'Accept', th: 'รับสาย' })}
              className="!h-16 !w-16 !rounded-full !bg-safe-500 !p-0"
              onClick={onAccept}
            >
              <Phone className="h-6 w-6" aria-hidden="true" />
            </Button>
            <span className="text-caption text-slate-400">{t({ en: 'Accept', th: 'รับสาย' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
