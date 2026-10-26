import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { PredictionPage } from '@/pages/PredictionPage'
import { MeditationPage } from '@/pages/MeditationPage'
import { PhysicalWellnessPage } from '@/pages/PhysicalWellnessPage'
import { AssistantPage } from '@/pages/AssistantPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/meditation" element={<MeditationPage />} />
          <Route path="/physical-wellness" element={<PhysicalWellnessPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Catch-all redirect to overview */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
