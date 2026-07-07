'use client'

import { useState, useEffect } from 'react'

export interface PricingInfo {
  price: string
  priceWithPeriod: string
  currency: 'EUR' | 'XOF' | 'USD' | 'GBP' | 'CAD'
  amount: number
}

// Timezones Afrique subsaharienne / zone FCFA
const XOF_TIMEZONES = [
  'Africa/Abidjan', 'Africa/Accra', 'Africa/Bamako', 'Africa/Banjul',
  'Africa/Bissau', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Freetown',
  'Africa/Lome', 'Africa/Monrovia', 'Africa/Niamey', 'Africa/Nouakchott',
  'Africa/Ouagadougou', 'Africa/Sao_Tome', 'Africa/Porto-Novo',
  // Afrique centrale (BEAC)
  'Africa/Douala', 'Africa/Libreville', 'Africa/Luanda', 'Africa/Malabo',
  'Africa/Ndjamena', 'Africa/Brazzaville', 'Africa/Bangui',
  // Maghreb / reste Afrique → dollar par défaut, mais on capture ici
]

const EUR_TIMEZONES_PREFIX = [
  'Europe/',
]

const GBP_TIMEZONES = ['Europe/London']

const CAD_TIMEZONES = ['America/Toronto', 'America/Vancouver', 'America/Winnipeg',
  'America/Edmonton', 'America/Halifax', 'America/St_Johns']

export function usePricing(): PricingInfo {
  const [pricing, setPricing] = useState<PricingInfo>({
    price: '3.99 $',
    priceWithPeriod: '3.99 $ / month',
    currency: 'USD',
    amount: 3.99,
  })

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

      if (XOF_TIMEZONES.includes(tz) || tz.startsWith('Africa/')) {
        // Zone Afrique → FCFA (2 499 FCFA ≈ 3,99€)
        setPricing({
          price: '2 499 FCFA',
          priceWithPeriod: '2 499 FCFA / mois',
          currency: 'XOF',
          amount: 2499,
        })
      } else if (GBP_TIMEZONES.includes(tz)) {
        // Royaume-Uni
        setPricing({
          price: '£3.49',
          priceWithPeriod: '£3.49 / month',
          currency: 'GBP',
          amount: 3.49,
        })
      } else if (EUR_TIMEZONES_PREFIX.some((p) => tz.startsWith(p))) {
        // Europe → Euro
        setPricing({
          price: '3,99 €',
          priceWithPeriod: '3,99 € / mois',
          currency: 'EUR',
          amount: 3.99,
        })
      } else if (CAD_TIMEZONES.includes(tz)) {
        // Canada
        setPricing({
          price: '5.49 $CA',
          priceWithPeriod: '5.49 $CA / mois',
          currency: 'CAD',
          amount: 5.49,
        })
      } else {
        // Reste du monde → Dollar US
        setPricing({
          price: '$3.99',
          priceWithPeriod: '$3.99 / month',
          currency: 'USD',
          amount: 3.99,
        })
      }
    } catch (e) {
      console.error('Error resolving timezone for pricing:', e)
    }
  }, [])

  return pricing
}
