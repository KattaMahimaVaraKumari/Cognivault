"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, LayoutList } from "lucide-react"

export type LayoutMode = "stack" | "grid" | "list"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
  content?: ReactNode
  badge?: string
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  onCardClick?: (card: CardData) => void
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const SWIPE_THRESHOLD = 40

export function Component({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
  activeIndex: controlledActiveIndex,
  onActiveIndexChange,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [internalActiveIndex, setInternalActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex

  const setActiveIndex = (updater: number | ((prev: number) => number)) => {
    const nextIndex = typeof updater === "function" ? updater(activeIndex) : updater
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(nextIndex)
    }
    onActiveIndexChange?.(nextIndex)
  }

  if (!cards || cards.length === 0) {
    return null
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x

    if (offset.x < -SWIPE_THRESHOLD || swipe < -800) {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 800) {
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i, originalIndex: index })
    }
    return reordered.reverse()
  }

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack":
        if (stackPosition > 2) {
          return {
            top: 20,
            scale: 0.92,
            opacity: 0,
            zIndex: 0,
            rotate: 0,
            pointerEvents: "none" as const,
          }
        }
        return {
          top: stackPosition * 12,
          scale: 1 - stackPosition * 0.035,
          zIndex: 10 - stackPosition,
          rotate: stackPosition === 0 ? 0 : stackPosition % 2 === 0 ? 1 : -1,
          opacity: stackPosition === 0 ? 1 : stackPosition === 1 ? 0.88 : 0.65,
          pointerEvents: (stackPosition === 0 ? "auto" : "none") as "auto" | "none",
        }
      case "grid":
        return {
          top: 0,
          scale: 1,
          zIndex: 1,
          rotate: 0,
          opacity: 1,
          pointerEvents: "auto" as const,
        }
      case "list":
        return {
          top: 0,
          scale: 1,
          zIndex: 1,
          rotate: 0,
          opacity: 1,
          pointerEvents: "auto" as const,
        }
    }
  }

  const containerStyles = {
    stack: "relative min-h-[480px] w-full max-w-2xl mx-auto pb-10",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full",
    list: "flex flex-col gap-4 w-full max-w-3xl mx-auto",
  }

  const displayCards =
    layout === "stack"
      ? getStackOrder()
      : cards.map((c, i) => ({ ...c, stackPosition: i, originalIndex: i }))

  return (
    <div className={cn("space-y-6", className)}>
      {/* Layout Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#735562]">
          <span>Card View Mode</span>
        </div>

        <div className="flex items-center justify-center gap-1 rounded-xl glass-panel p-1 shadow-2xs border border-[#ffdce4]">
          {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
            const Icon = layoutIcons[mode]
            return (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  layout === mode
                    ? "bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs"
                    : "text-[#6e535e] hover:text-[#2d1b24] hover:bg-[#fff0f4]",
                )}
                aria-label={`Switch to ${mode} layout`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="capitalize">{mode}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards Container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout])}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard = layout === "stack" && card.stackPosition === 0

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    x: 0,
                    ...styles,
                    ...(isExpanded ? { scale: 1.02 } : {}),
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -250 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 26,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.01, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return
                    if (layout !== "stack") {
                      setActiveIndex(card.originalIndex)
                      setExpandedCard(isExpanded ? null : card.id)
                    }
                    onCardClick?.(card)
                  }}
                  className={cn(
                    "rounded-2xl glass-panel p-6 sm:p-8 transition-all shadow-md",
                    "border border-[#ffdce4]/95 bg-white/85 backdrop-blur-xl",
                    layout === "stack" && "absolute inset-x-0 w-full",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing shadow-lg shadow-[#f0507e]/10 border-[#fcaec2] ring-1 ring-[#fcaec2]/40",
                    layout === "grid" && "cursor-pointer hover:border-[#fcaec2] hover:shadow-md",
                    layout === "list" && "cursor-pointer hover:border-[#fcaec2]",
                    isExpanded && "ring-2 ring-[#e0567b] shadow-lg",
                    card.originalIndex === activeIndex && layout !== "stack" && "ring-2 ring-[#e0567b] border-[#f48ea8] shadow-md",
                  )}
                >
                  <div className="space-y-4">
                    {/* Badge and Icon */}
                    <div className="flex items-center justify-between gap-3">
                      {card.badge && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#fff0f4] text-[#8c1d3c] border border-[#fcaec2]/60 shadow-2xs">
                          {card.badge}
                        </span>
                      )}

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0f4] border border-[#fcaec2]/70 text-[#c0385c] shadow-2xs">
                        {card.icon}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h2 className="text-base sm:text-lg font-bold text-[#2d1b24] tracking-tight leading-snug">
                        {card.title}
                      </h2>
                      {card.description && (
                        <p className="text-xs sm:text-sm text-[#735562] font-medium">
                          {card.description}
                        </p>
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="pt-2">{card.content}</div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

export default Component
