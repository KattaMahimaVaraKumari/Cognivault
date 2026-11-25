import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Activity } from 'lucide-react'
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6 bg-white/75 backdrop-blur-2xl border-b border-[#ffd7e2]/70 shadow-[0_4px_24px_-4px_rgba(240,170,190,0.14)]">
      <div className="flex items-center gap-3.5">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#7d5c68] hover:text-[#3b121e] hover:bg-[#fff0f4] rounded-xl transition-all border border-[#fed5df]/80 shadow-2xs cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Current page title */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#3b121e] tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Header Status Pill */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#fed0dc] shadow-sm text-xs font-medium text-[#6e4653] backdrop-blur-md">
        <Activity className="w-3.5 h-3.5 text-[#e0567b] animate-pulse" />
        <span className="text-[11px] text-[#6e4653] font-medium tracking-wide">
          Cognivault AI Active
        </span>
      </div>
    </header>
  )
}

export default Header
