import { Pill } from './Pill'

// Match both the English intent tags and their Thai translations (see
// scenarios.data.ts `intent`), so danger tone survives localization.
const dangerIntents = new Set([
  'asks for OTP',
  'money transfer',
  'payment demand',
  'ขอรหัส OTP',
  'โอนเงิน',
  'เรียกเก็บเงิน',
])

interface IntentPillRowProps {
  intents: string[]
}

export function IntentPillRow({ intents }: IntentPillRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {intents.map((intent) => (
        <Pill key={intent} tone={dangerIntents.has(intent) ? 'danger' : 'warn'} size="xs">
          {intent}
        </Pill>
      ))}
    </div>
  )
}
