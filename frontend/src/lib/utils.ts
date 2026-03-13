import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatBandScore(score: number): string {
  return score % 1 === 0 ? score.toFixed(1) : score.toFixed(1)
}

export function getBandColor(band: number): string {
  if (band >= 7) return 'text-green-600'
  if (band >= 5.5) return 'text-yellow-600'
  if (band >= 4) return 'text-orange-600'
  return 'text-red-600'
}

export function getBandBgColor(band: number): string {
  if (band >= 7) return 'bg-green-100 text-green-800'
  if (band >= 5.5) return 'bg-yellow-100 text-yellow-800'
  if (band >= 4) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}
