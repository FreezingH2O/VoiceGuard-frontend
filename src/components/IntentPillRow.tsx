import { Pill } from './Pill'

const dangerIntents = new Set(['asks for OTP', 'money transfer', 'payment demand'])

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
