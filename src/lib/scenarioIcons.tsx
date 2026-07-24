import {
  Landmark,
  ShieldAlert,
  HeartHandshake,
  CircleCheck,
  Phone,
  Stethoscope,
  Users,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react'

const scenarioIconMap: Record<string, LucideIcon> = {
  bank: Landmark,
  authority: ShieldAlert,
  family: HeartHandshake,
  safe: CircleCheck,
  phone: Phone,
  hospital: Stethoscope,
  community: Users,
}

export function getScenarioIconComponent(slug: string): LucideIcon {
  return scenarioIconMap[slug] ?? CircleHelp
}

export function ScenarioIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = getScenarioIconComponent(slug)
  return <Icon className={className} aria-hidden="true" />
}
