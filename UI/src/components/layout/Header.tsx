import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ALL_ROUTES } from '@/config/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation()

  // Match the current path to find the current page title
  const currentRoute = ALL_ROUTES.find((item) => item.href === location.pathname)
  const pageTitle = currentRoute?.title ?? 'Cognivault AI'

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Current page title */}
        <h1 className="text-base font-semibold text-gray-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>
    </header>
  )
}
