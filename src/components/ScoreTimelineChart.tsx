import { Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export interface TimelinePoint {
  t: number
  spoof: number
  scam: number
}

interface ScoreTimelineChartProps {
  data: TimelinePoint[]
  threshold: number
  height?: number
}

export function ScoreTimelineChart({ data, threshold, height = 120 }: ScoreTimelineChartProps) {
  return (
    <div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[0, 100]} />
            <ReferenceLine y={threshold} stroke="#D93A3A" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="spoof" stroke="#2B3A9F" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="scam" stroke="#EB7449" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-4 text-micro text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" /> Spoof score
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-coral-500" aria-hidden="true" /> Scam risk
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-3 bg-danger-600" aria-hidden="true" /> Threshold
        </span>
      </div>
    </div>
  )
}
