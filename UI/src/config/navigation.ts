import {
  LayoutDashboard,
  Brain,
  Wind,
  HeartPulse,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  Settings,
  UserRound,
} from 'lucide-react'
import { NavItem } from '@/types/navigation'

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    description: 'Summary dashboard displaying overall burnout indicators and wellness metrics.',
  },
  {
    title: 'Stress Prediction',
    href: '/prediction',
    icon: Brain,
    description: 'Interactive stress assessment and burnout risk evaluation module.',
  },
  {
    title: 'Meditation',
    href: '/meditation',
    icon: Wind,
    description: 'Mindfulness practices, guided breathing exercises, and relaxation audio.',
  },
  {
    title: 'Physical Wellness',
    href: '/physical-wellness',
    icon: HeartPulse,
    description: 'Movement reminders, desk ergonomics, and somatic tension relief routines.',
  },
  {
    title: 'Wellness Assistant',
    href: '/assistant',
    icon: MessageSquare,
    description: 'Conversational assistant for stress management and guided reflection.',
  },
  {
    title: 'Feedback',
    href: '/feedback',
    icon: MessageCircle,
    description: 'Daily mood tracking, sentiment pulse checks, and user feedback logs.',
  },
  {
    title: 'My Progress',
    href: '/progress',
    icon: TrendingUp,
    description: 'Long-term stress reduction trends, habit consistency, and progress analytics.',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure application preferences, notifications, and privacy options.',
  },
]

export const PROFILE_NAV_ITEM: NavItem = {
  title: 'Profile',
  href: '/profile',
  icon: UserRound,
  description: 'Manage your user profile, personal goals, and account details.',
}

export const ALL_ROUTES: NavItem[] = [...NAVIGATION_ITEMS, PROFILE_NAV_ITEM]
