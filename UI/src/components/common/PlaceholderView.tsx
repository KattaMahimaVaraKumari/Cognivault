import React from 'react'
import { LucideIcon } from 'lucide-react'

interface PlaceholderViewProps {
  title: string
  description: string
  icon: LucideIcon
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  description,
  icon: Icon,
}) => {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <div className="glass-panel p-8 sm:p-10 border border-[#ffdce4]/90">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl border border-[#fcaec2]/80 bg-[#fff0f4] text-[#c0385c] shadow-2xs backdrop-blur-xs">
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#2d1b24]">{title}</h1>
            <p className="text-sm text-[#614752] leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderView
