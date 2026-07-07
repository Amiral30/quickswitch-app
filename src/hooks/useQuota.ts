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
  FREE: { tier: 'FREE', maxActions: 5, maxFileSizeMB: 10, maxBatchSize: 5 },
  PRO:  { tier: 'PRO', maxActions: 9999, maxFileSizeMB: 4000, maxBatchSize: 9999 },
}

export function useQuota() {
  const [tier, setTier] = useState<Tier>('ANON')
  const [actionsToday, setActionsToday] = useState(0)
  const [loading, setLoading] = useState(true)

  // Determine current tier from session + Supabase profiles table
  useEffect(() => {
    const resolveTier = async (userId: string) => {
      // Lire le tier depuis la table profiles dans Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .single()

      if (profile?.tier === 'PRO') {
        setTier('PRO')
      } else {
        setTier('FREE')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolveTier(session.user.id)
      } else {
        setTier('ANON')
      }
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          resolveTier(session.user.id)
        } else {
          setTier('ANON')
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Load today's action count from LocalStorage
  useEffect(() => {
    if (loading) return

    const today = new Date().toISOString().split('T')[0]
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
