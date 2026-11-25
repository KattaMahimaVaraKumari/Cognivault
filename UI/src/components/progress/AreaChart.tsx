import React, { useState, useId } from 'react'
import { cn } from '@/lib/utils'

export interface ChartDataPoint {
  date: string
  series1: number
  series2: number
  label?: string
}

interface AreaChartProps {
  data: ChartDataPoint[]
  series1Name: string
  series2Name: string
  series1Unit?: string
  series2Unit?: string
  height?: number
  className?: string
}

function generateCurvedPath(points: [number, number][]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`

  let path = `M ${points[0][0]},${points[0][1]}`

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const controlPointX = (current[0] + next[0]) / 2

    path += ` C ${controlPointX},${current[1]} ${controlPointX},${next[1]} ${next[0]},${next[1]}`
  }

  return path
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  series1Name = 'Series 1',
  series2Name = 'Series 2',
  series1Unit = 'mins',
  series2Unit = 'breaks',
  height = 240,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartId = useId()

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#fcaec2] bg-white/50 min-h-[220px]">
        <span className="text-xs font-bold text-[#4b353f]">No chart trends logged yet</span>
        <span className="text-[11px] text-[#9c7886] mt-1">
          Complete your first breathing session or assessment to generate insights.
        </span>
      </div>
    )
  }

  // Dimensions & Padding
  const width = 640
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 35

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.series1, d.series2)),
    10
  )
  const yAxisMax = Math.ceil(maxVal / 5) * 5

  const points1: [number, number][] = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth
    const y = paddingTop + chartHeight - (d.series1 / yAxisMax) * chartHeight
    return [x, y]
  })

  const points2: [number, number][] = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth
    const y = paddingTop + chartHeight - (d.series2 / yAxisMax) * chartHeight
    return [x, y]
  })

  const linePath1 = generateCurvedPath(points1)
  const linePath2 = generateCurvedPath(points2)

  const areaPath1 = `${linePath1} L ${points1[points1.length - 1][0]} ${paddingTop + chartHeight} L ${points1[0][0]} ${paddingTop + chartHeight} Z`
  const areaPath2 = `${linePath2} L ${points2[points2.length - 1][0]} ${paddingTop + chartHeight} L ${points2[0][0]} ${paddingTop + chartHeight} Z`

  const yTicks = [0, yAxisMax / 2, yAxisMax]

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id={`grad1-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0507e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f0507e" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id={`grad2-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcaec2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fcaec2" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((val, idx) => {
          const y = paddingTop + chartHeight - (val / yAxisMax) * chartHeight
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#fed5df"
                strokeDasharray={idx === 0 ? undefined : '4 4'}
                strokeWidth={idx === 0 ? 1.5 : 1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#9c7886] text-[10px] font-mono"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* Area paths */}
        <path d={areaPath1} fill={`url(#grad1-${chartId})`} />
        <path d={areaPath2} fill={`url(#grad2-${chartId})`} />

        {/* Lines */}
        <path d={linePath1} fill="none" stroke="#f0507e" strokeWidth="2.5" />
        <path d={linePath2} fill="none" stroke="#fcaec2" strokeWidth="2.5" />

        {/* Data points & X Labels */}
        {data.map((d, i) => {
          const x = points1[i][0]
          const y1 = points1[i][1]
          const y2 = points2[i][1]
          const isHovered = hoveredIndex === i

          return (
            <g key={i}>
              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-[#735562] text-[10px] font-bold"
              >
                {d.date}
              </text>

              {/* Invisible interactive hover rect */}
              <rect
                x={x - 20}
                y={paddingTop}
                width={40}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Data circles */}
              <circle
                cx={x}
                cy={y1}
                r={isHovered ? 5 : 3}
                fill="#ffffff"
                stroke="#f0507e"
                strokeWidth="2.5"
                className="transition-all"
              />
              <circle
                cx={x}
                cy={y2}
                r={isHovered ? 5 : 3}
                fill="#ffffff"
                stroke="#fcaec2"
                strokeWidth="2.5"
                className="transition-all"
              />
            </g>
          )
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl glass-panel p-2.5 text-xs shadow-lg border border-[#ffdce4] transition-all -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points1[hoveredIndex][0] / width) * 100}%`,
            top: `${Math.min(points1[hoveredIndex][1], points2[hoveredIndex][1]) - 10}px`,
          }}
        >
          <div className="font-bold text-[#2d1b24] mb-1">
            {data[hoveredIndex].label || data[hoveredIndex].date}
          </div>
          <div className="flex items-center gap-2 text-[#a32849]">
            <span className="w-2 h-2 rounded-full bg-[#f0507e]" />
            <span>{series1Name}: {data[hoveredIndex].series1} {series1Unit}</span>
          </div>
          <div className="flex items-center gap-2 text-[#be4162]">
            <span className="w-2 h-2 rounded-full bg-[#fcaec2]" />
            <span>{series2Name}: {data[hoveredIndex].series2} {series2Unit}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaChart
