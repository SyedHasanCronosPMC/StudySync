import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

interface WeeklyTrendChartProps {
  data: Array<{
    check_in_date: string
    study_minutes: number | null
    tasks_completed: number | null
    focus_score: number | null
  }>
}

function formatDateLabel(date: string) {
  const parsed = new Date(date + 'T00:00:00')
  if (Number.isNaN(parsed.valueOf())) return date
  return parsed.toLocaleDateString(undefined, { weekday: 'short' })
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
  }

  const chartData = data.map((item) => ({
    date: formatDateLabel(item.check_in_date),
    minutes: item.study_minutes ?? 0,
    tasks: item.tasks_completed ?? 0,
    focus: item.focus_score ?? 0,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
          <Area type="stepAfter" dataKey="tasks" stroke="hsl(var(--secondary-foreground))" fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

