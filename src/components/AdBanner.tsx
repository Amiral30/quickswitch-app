'use client'

import { useEffect, useState } from 'react'
import { useQuota } from '@/hooks/useQuota'

interface AdBannerProps {
  slot?: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdBanner({ slot, format = 'horizontal', className = '' }: AdBannerProps) {
  const { tier, loading } = useQuota()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  // Map format sizes and IDs
  const sizes = {
    horizontal: { 
      label: '728×90 — Leaderboard', 
      h: 'min-h-[90px] h-[90px]', 
      w: 'max-w-[728px] w-full',
      defaultSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HORIZONTAL,
      aadsUnit: process.env.NEXT_PUBLIC_AADS_UNIT_HORIZONTAL,
      sizeStr: 'Adaptive'
    },
    rectangle:  { 
      label: '300×250 — Medium Rectangle', 
      h: 'min-h-[250px] h-[250px]', 
      w: 'max-w-[300px] w-full',
      defaultSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
      aadsUnit: process.env.NEXT_PUBLIC_AADS_UNIT_RECTANGLE,
      sizeStr: '300x250'
    },
    vertical:   { 
      label: '160×600 — Wide Skyscraper', 
      h: 'min-h-[600px] h-[600px]', 
      w: 'max-w-[160px] w-full',
      defaultSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT_VERTICAL,
      aadsUnit: undefined,
      sizeStr: '160x600'
    },
  }

  const { label, h, w, defaultSlot, aadsUnit, sizeStr } = sizes[format]
  const adSlot = slot || defaultSlot || ''

  // Initialize AdSense only if loading real AdSense ads
  useEffect(() => {
    if (mounted && !loading && tier !== 'PRO' && !aadsUnit && publisherId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        console.error('AdSense push error:', e)
      }
    }
  }, [mounted, loading, tier, aadsUnit, publisherId])

  // We render the iframe during server-side rendering so that web crawlers/bots (which don't execute JS)
  // can verify the ad unit code. On the client, we hide it if the user is verified PRO.
  const isPro = mounted && !loading && tier === 'PRO';

  if (isPro) return null;

  // 1. Prioritize A-Ads if the corresponding identity is configured in environment parameters
  if (aadsUnit) {
    return (
      <div className={`w-full overflow-hidden flex items-center justify-center ${h} ${className}`}>
        <iframe
          src={`https://acceptable.a-ads.com/${aadsUnit}/?size=${sizeStr}`}
          style={{ width: '100%', height: '100%', border: '0px', padding: '0', overflow: 'hidden', backgroundColor: 'transparent' }}
          title="A-Ads Advertisement"
        />
      </div>
    )
  }

  // 2. Fallback to Google AdSense if publisher id is set
  if (publisherId) {
    return (
      <div className={`w-full overflow-hidden flex items-center justify-center ${h} ${className}`}>
        {/* @ts-ignore */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={publisherId}
          data-ad-slot={adSlot || undefined}
          data-ad-format={adSlot ? undefined : 'auto'}
          data-full-width-responsive={adSlot ? undefined : 'true'}
        />
      </div>
    )
  }

  // 3. Fallback to our internal Premium pitch card
  return (
    <div
      className={`w-full ${h} rounded-xl border border-dashed border-gray-300 dark:border-white/10
        bg-gray-50/50 dark:bg-white/3 flex flex-col items-center justify-center p-4 text-center gap-1.5
        text-gray-500 dark:text-gray-400 select-none overflow-hidden hover:bg-gray-100/30 transition duration-150 ${className}`}
      aria-label="Publicité"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <span>Espace Publicitaire</span>
      </div>
      <p className="text-[10px] text-gray-400 max-w-md line-clamp-1 leading-snug">
        Enlevez toutes les publicités de la plateforme instantanément en vous abonnant.
      </p>
      <a 
        href="#pricing"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
        }}
        className="text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full shadow-sm hover:opacity-90 duration-150"
      >
        ⚡ Passer Premium 2,99€
      </a>
    </div>
  )
}
