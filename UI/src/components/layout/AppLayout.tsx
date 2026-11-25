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
      {/* Light pastel baby-pink and pearl-white ambient background */}
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fff8fa] text-[#2c1f26] antialiased selection:bg-[#fcaec2]/40 selection:text-[#421623]">
        {/* Ambient atmospheric pastel pink blooms */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-32 right-0 h-[45rem] w-[45rem] rounded-full bg-radial from-[#fedbe3]/60 via-[#ffeef2]/40 to-transparent blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-1/3 -left-40 h-[42rem] w-[42rem] rounded-full bg-radial from-[#fde2e8]/55 via-[#fff0f4]/35 to-transparent blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -bottom-36 right-1/4 h-[38rem] w-[38rem] rounded-full bg-radial from-[#fed5df]/50 via-[#fff2f5]/30 to-transparent blur-[120px]"
        />

        {/* Subtle pearl texture grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-[0.02] mix-blend-multiply bg-[radial-gradient(#be687e_1px,transparent_1px)] [background-size:24px_24px]"
        />

        {/* Desktop & Mobile Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-200">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto relative z-10">
            <Outlet />
          </main>
        </div>
      </div>
    </MotionConfig>
  )
}

export default AppLayout
