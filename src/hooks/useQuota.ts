'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type Tier = 'ANON' | 'FREE' | 'PRO'

export interface QuotaLimits {
  tier: Tier
  maxActions: number
  maxFileSizeMB: number
  maxBatchSize: number
}

const LIMITS: Record<Tier, QuotaLimits> = {
  ANON: { tier: 'ANON', maxActions: 2, maxFileSizeMB: 1, maxBatchSize: 1 },
  FREE: { tier: 'FREE', maxActions: 10, maxFileSizeMB: 10, maxBatchSize: 5 },
  PRO: { tier: 'PRO', maxActions: 9999, maxFileSizeMB: 4000, maxBatchSize: 9999 },
}

export function useQuota() {
  const [tier, setTier] = useState<Tier>('ANON')
  const [actionsToday, setActionsToday] = useState(0)
  const [loading, setLoading] = useState(true)

  // Determine current tier from session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // In the future, check user's Stripe status from DB.
      // For now: No session = ANON, Session = FREE.
      setTier(session ? 'FREE' : 'ANON')
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setTier(session ? 'FREE' : 'ANON')
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Load today's action count from LocalStorage (based on current Tier / User)
  useEffect(() => {
    if (loading) return

    const today = new Date().toISOString().split('T')[0]
    // Prefix cache key by tier so switching Tier creates a new bucket,
    // though usually you'd sync it to a real DB.
    const storageKey = `swiftools_quota_${tier}_${today}`
    
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setActionsToday(parseInt(stored, 10))
    } else {
      setActionsToday(0)
    }
  }, [tier, loading])

  // Function to register a conversion
  const recordAction = () => {
    const today = new Date().toISOString().split('T')[0]
    const storageKey = `swiftools_quota_${tier}_${today}`
    
    const newCount = actionsToday + 1
    setActionsToday(newCount)
    localStorage.setItem(storageKey, newCount.toString())
  }

  const limits = LIMITS[tier]
  const hasQuota = actionsToday < limits.maxActions

  return { tier, limits, actionsToday, hasQuota, loading, recordAction }
}
