'use client'

import { useEffect, useState, useRef } from 'react'
import AdBanner from '@/components/AdBanner'
import type { Tier } from '@/hooks/useQuota'

interface AdInterstitialProps {
  isOpen: boolean
  tier: Tier | null
  filename: string
  blobUrl: string | null
  onClose: () => void
  delaySeconds?: number
}

export default function AdInterstitial({
  isOpen,
  tier,
  filename,
  blobUrl,
  onClose,
  delaySeconds = 4,
}: AdInterstitialProps) {
  const [countdown, setCountdown] = useState(delaySeconds)
  const [ready, setReady] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset + start countdown each time the modal opens
  useEffect(() => {
    if (!isOpen) return

    // PRO users get instant access — no waiting
    if (tier === 'PRO') {
      setCountdown(0)
      setReady(true)
      return
    }

    setCountdown(delaySeconds)
    setReady(false)

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setReady(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOpen, tier, delaySeconds])

  const handleDownload = () => {
    if (!blobUrl || !ready) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.click()
    // Small delay before revoking to let the browser start the download
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
      onClose()
    }, 500)
  }

  if (!isOpen) return null

  const progress = tier === 'PRO' ? 100 : ((delaySeconds - countdown) / delaySeconds) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md glass-premium rounded-2xl shadow-2xl border border-gray-200/20 overflow-hidden animate-float" style={{ animationDuration: '6s' }}>

        {/* Progress bar at top */}
        <div className="h-1 w-full bg-gray-200/10">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              tier === 'PRO'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 w-full'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tier === 'PRO' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  ⚡ Accès Premium
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                  🆓 Version Gratuite
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="5" />
              </svg>
              <span className="text-xs font-bold">Traitement terminé ✓</span>
            </div>
          </div>

          {/* File name */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-500/5 border border-gray-200/10">
            <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-800 dark:text-gray-200 truncate">{filename}</p>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5">Prêt à télécharger</p>
            </div>
          </div>

          {/* Ad zone — only for non-PRO users */}
          {tier !== 'PRO' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message sponsorisé</span>
                {!ready && (
                  <span className="text-[11px] font-black text-blue-500 tabular-nums">
                    {countdown}s
                  </span>
                )}
              </div>
              <AdBanner format="rectangle" className="max-h-[180px] h-[180px]" />
              
              {/* Upgrade pitch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-500/8 to-purple-500/8 border border-blue-500/15">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug font-medium">
                  Passez Pro — plus d'attente,<br />jamais de publicités. ⚡
                </p>
                <button
                  onClick={onClose}
                  className="ml-3 flex-shrink-0 text-[10px] font-black px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                >
                  2,99€/mois
                </button>
              </div>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={!ready}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              ready
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:opacity-95 hover:scale-[1.01] cursor-pointer'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {ready ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger mon fichier
              </>
            ) : (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Disponible dans {countdown}s...
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
