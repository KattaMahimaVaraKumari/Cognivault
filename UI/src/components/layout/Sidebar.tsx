import React from 'react'
import { NavLink } from 'react-router-dom'
import { Sparkles, X, Shield } from 'lucide-react'
import { NAVIGATION_ITEMS, PROFILE_NAV_ITEM } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#3b121e]/20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          'bg-white/85 backdrop-blur-2xl border-r border-[#ffdce4] shadow-[8px_0_32px_rgba(235,160,185,0.12)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#ffdce4]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f87d9f] via-[#f0507e] to-[#fcaec2] text-white shadow-md shadow-[#f0507e]/25 ring-1 ring-white/50">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-[#441322] via-[#73253b] to-[#a83c58] bg-clip-text text-transparent">
                Cognivault
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#c45b79] -mt-0.5">
                AI Wellness
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#8a6874] hover:text-[#3b121e] hover:bg-[#fff0f4] rounded-lg transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9f7988]">
            Platform Console
          </div>
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#ffe4ec] via-[#fff0f5] to-white/60 text-[#821935] shadow-xs border border-[#fcaec2]/70 font-semibold'
                      : 'text-[#6e535e] hover:text-[#34111d] hover:bg-[#fff2f6]/70 hover:border hover:border-[#ffd6e0]/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                        isActive
                          ? 'bg-gradient-to-br from-[#f87d9f] to-[#dc2b60] text-white shadow-xs shadow-[#dc2b60]/25'
                          : 'text-[#9c7886] group-hover:text-[#be4162] group-hover:bg-[#fedee6]/60'
                      )}
                    >
                      <Icon className="h-4 w-4 stroke-[1.8]" />
                    </div>
                    <span className="truncate">{item.title}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Profile / Settings Item */}
        <div className="p-3 border-t border-[#ffdce4]/80">
          <NavLink
            to={PROFILE_NAV_ITEM.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#ffe4ec] to-white/60 text-[#821935] border border-[#fcaec2]/70 font-semibold'
                  : 'text-[#6e535e] hover:text-[#34111d] hover:bg-[#fff2f6]/70'
              )
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe8ef] border border-[#fcaec2]/60 text-[#bf4667] group-hover:text-[#8c1d3c] group-hover:bg-[#fed6e2]">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-[#34111d]">
                {PROFILE_NAV_ITEM.title}
              </span>
              <span className="text-[10px] text-[#9c7886] truncate">
                Active Session
              </span>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
