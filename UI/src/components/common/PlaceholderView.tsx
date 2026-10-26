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
    <div className="max-w-4xl">
      <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700">
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
