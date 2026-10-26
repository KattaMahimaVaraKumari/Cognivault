import React from 'react'
import { NavLink } from 'react-router-dom'
import { Leaf, X } from 'lucide-react'
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
          className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-800">
              <Leaf className="h-4 w-4 stroke-[2]" />
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">
              Cognivault AI
            </span>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Navigation List (Items 1-7 + Settings) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span className="truncate">{item.title}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom-Pinned Profile Item */}
        <div className="border-t border-gray-200 p-3">
          <NavLink
            to={PROFILE_NAV_ITEM.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            <PROFILE_NAV_ITEM.icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
            <span className="truncate">{PROFILE_NAV_ITEM.title}</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
