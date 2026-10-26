import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { loadSettings } from '@/utils/settings'
import { AppSettings } from '@/types/settings'

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => loadSettings().reduceMotion)

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const detail = (e as CustomEvent<AppSettings>).detail
      if (detail && typeof detail.reduceMotion === 'boolean') {
        setReduceMotion(detail.reduceMotion)
      }
    }

    window.addEventListener('cognivault-settings-changed', handleSettingsChange)
    return () => {
      window.removeEventListener('cognivault-settings-changed', handleSettingsChange)
    }
  }, [])

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-white">
        {/* Desktop & Mobile Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </MotionConfig>
  )
}
