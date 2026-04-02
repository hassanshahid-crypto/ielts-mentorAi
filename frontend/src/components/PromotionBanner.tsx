'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react'

interface PromotionBannerProps {
  progression: {
    promoted: boolean
    previous_level?: string
    new_level?: string
    current_level?: string
    avg_score: number
    total_tests: number
    needed_score?: number
  }
}

const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  pro: 'Pro',
}

const levelColors: Record<string, string> = {
  beginner: 'from-green-500 to-green-600',
  intermediate: 'from-yellow-500 to-orange-500',
  pro: 'from-red-500 to-purple-600',
}

export function PromotionBanner({ progression }: PromotionBannerProps) {
  if (!progression) return null

  if (progression.promoted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`bg-gradient-to-r ${levelColors[progression.new_level || 'intermediate']} rounded-2xl p-6 text-white text-center`}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
          <Trophy className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Level Up!</h3>
        <div className="flex items-center justify-center space-x-3 mb-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {levelLabels[progression.previous_level || 'beginner']}
          </span>
          <ArrowRight className="h-5 w-5" />
          <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">
            {levelLabels[progression.new_level || 'intermediate']}
          </span>
        </div>
        <p className="text-white/80 text-sm">
          Avg Band: {progression.avg_score}/9.0 across {progression.total_tests} tests
        </p>
      </motion.div>
    )
  }

  // Not promoted yet — show progress
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-5 w-5 text-primary-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            Level: {levelLabels[progression.current_level || 'beginner']}
          </p>
          <p className="text-xs text-gray-500">
            Avg Band: {progression.avg_score}/9.0 &bull; {progression.total_tests} tests completed &bull; Need {progression.needed_score}+ avg to level up
          </p>
        </div>
      </div>
    </div>
  )
}
