'use client'

import { useState, useEffect } from 'react'

export interface PricingInfo {
  price: string
  priceWithPeriod: string
  currency: 'EUR' | 'XOF' | 'USD'
  amount: number
}

export function usePricing(): PricingInfo {
  const [pricing, setPricing] = useState<PricingInfo>({
    price: '3,99 €',
    priceWithPeriod: '3,99 € / mois',
    currency: 'EUR',
    amount: 3.99
  })

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      if (tz.includes('Africa')) {
        setPricing({
          price: '1 999 FCFA',
          priceWithPeriod: '1 999 FCFA / mois',
          currency: 'XOF',
          amount: 1999
        })
      } else if (tz.includes('Europe')) {
        setPricing({
          price: '3,99 €',
          priceWithPeriod: '3,99 € / mois',
          currency: 'EUR',
          amount: 3.99
        })
      } else {
        setPricing({
          price: '3.99 $',
          priceWithPeriod: '3.99 $ / month',
          currency: 'USD',
          amount: 3.99
        })
      }
    } catch (e) {
      console.error('Error resolving timezone for pricing:', e)
    }
  }, [])

  return pricing
}
