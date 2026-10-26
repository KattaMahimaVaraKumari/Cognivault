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
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 800) {
      // Swiped right - go to previous card
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
    return reordered.reverse() // Reverse so top card renders last (on top)
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
          top: stackPosition * 10,
          scale: 1 - stackPosition * 0.03,
          zIndex: 20 - stackPosition,
          rotate: (stackPosition - 1) * 1.5,
          opacity: stackPosition === 0 ? 1 : 0.65 - stackPosition * 0.25,
          pointerEvents: stackPosition === 0 ? ("auto" as const) : ("none" as const),
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
    stack: "relative min-h-[460px] w-full max-w-2xl mx-auto pb-10",
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
        <div className="text-xs font-medium text-gray-500">
          <span>Display Layout</span>
        </div>

        <div className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-2xs">
          {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
            const Icon = layoutIcons[mode]
            return (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  layout === mode
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
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
                    "rounded-xl border border-gray-200 bg-white p-5 sm:p-7 transition-all shadow-xs",
                    layout === "stack" && "absolute inset-x-0 w-full",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing border-gray-300 shadow-md",
                    layout === "grid" && "cursor-pointer hover:border-gray-400 hover:shadow-xs",
                    layout === "list" && "cursor-pointer hover:border-gray-300",
                    isExpanded && "ring-2 ring-gray-900",
                    card.originalIndex === activeIndex && layout !== "stack" && "ring-1 ring-gray-900 border-gray-900",
                  )}
                  style={{
                    backgroundColor: card.color || undefined,
                  }}
                >
                  {/* Top card header with icon and title */}
                  <div className="flex items-start gap-3.5">
                    {card.icon && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {card.badge && (
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          {card.badge}
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">
                        {card.title}
                      </h3>
                      {card.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Question content & interactive answer choices */}
                  {card.content && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      {card.content}
                    </div>
                  )}

                  {isTopCard && layout === "stack" && (
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Swipe card left/right or use controls below</span>
                      <span className="font-medium text-gray-600">
                        Card {card.originalIndex + 1} of {cards.length}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Pagination dots for stack layout */}
      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-2 flex-wrap max-w-md mx-auto">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all cursor-pointer",
                index === activeIndex
                  ? "w-6 bg-gray-900"
                  : "w-2 bg-gray-200 hover:bg-gray-400",
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const MorphingCardStack = Component
export default Component
