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

// Generate smooth cubic bezier SVG path from array of 2D coordinates
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
  series1Name,
  series2Name,
  series1Unit = 'mins',
  series2Unit = 'breaks',
  height = 240,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartId = useId()

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-gray-100 bg-gray-50/50 min-h-[220px]">
        <span className="text-xs font-medium text-gray-500">No chart data available</span>
        <span className="text-[11px] text-gray-400 mt-1">
          Record your first session to visualize progress.
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

  // Find max across both series to scale Y axis
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.series1, d.series2)),
    10 // Minimum scale
  )
  // Round up to nice number
  const yAxisMax = Math.ceil(maxVal / 5) * 5

  // Map data points to SVG coordinates
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

  const baselineY = paddingTop + chartHeight

  // Generate SVG curve strings
  const linePath1 = generateCurvedPath(points1)
  const linePath2 = generateCurvedPath(points2)

  // Area paths (close path to baseline)
  const areaPath1 = `${linePath1} L ${points1[points1.length - 1][0]},${baselineY} L ${points1[0][0]},${baselineY} Z`
  const areaPath2 = `${linePath2} L ${points2[points2.length - 1][0]},${baselineY} L ${points2[0][0]},${baselineY} Z`

  // Y-axis grid ticks (4 divisions)
  const yTicks = [0, yAxisMax * 0.33, yAxisMax * 0.66, yAxisMax]

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null

  return (
    <div className={cn('relative w-full space-y-3', className)}>
      {/* Legend & Current Hover Display */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />
            <span className="font-medium text-gray-700">{series1Name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="font-medium text-gray-600">{series2Name}</span>
          </div>
        </div>

        {activePoint ? (
          <div className="text-xs bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 flex items-center gap-3">
            <span className="font-semibold text-gray-900">{activePoint.date}:</span>
            <span>
              {series1Name}: <strong>{activePoint.series1}</strong> {series1Unit}
            </span>
            <span>•</span>
            <span>
              {series2Name}: <strong>{activePoint.series2}</strong> {series2Unit}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">Hover or tap on points to view details</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={`Area chart displaying ${series1Name} and ${series2Name}`}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={`gradient1-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#111827" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={`gradient2-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y Axis labels */}
          {yTicks.map((tickVal, idx) => {
            const yPos = paddingTop + chartHeight - (tickVal / yAxisMax) * chartHeight
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? undefined : '3,3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9ca3af"
                  fontFamily="inherit"
                >
                  {Math.round(tickVal)}
                </text>
              </g>
            )
          })}

          {/* Area Fills */}
          <path d={areaPath2} fill={`url(#gradient2-${chartId})`} />
          <path d={areaPath1} fill={`url(#gradient1-${chartId})`} />

          {/* Line Strokes */}
          <path
            d={linePath2}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={linePath1}
            fill="none"
            stroke="#111827"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = points1[i][0]
            const isHovered = hoveredIndex === i
            return (
              <g key={i}>
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#111827' : '#9ca3af'}
                  fontWeight={isHovered ? '600' : 'normal'}
                  fontFamily="inherit"
                >
                  {d.date}
                </text>
              </g>
            )
          })}

          {/* Interactive Hover Indicators & Hit Targets */}
          {data.map((_, i) => {
            const x1 = points1[i][0]
            const y1 = points1[i][1]
            const y2 = points2[i][1]
            const isHovered = hoveredIndex === i

            return (
              <g key={i}>
                {/* Vertical hover guideline */}
                {isHovered && (
                  <line
                    x1={x1}
                    y1={paddingTop}
                    x2={x1}
                    y2={baselineY}
                    stroke="#d1d5db"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Point dots */}
                <circle
                  cx={x1}
                  cy={y2}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  className="transition-all"
                />
                <circle
                  cx={x1}
                  cy={y1}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#111827"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Hit target for easier mouse/touch interaction */}
                <rect
                  x={x1 - chartWidth / (data.length * 2)}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight + 15}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default AreaChart
