'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Lire la page sauvegardée avant le login
    const savedPath = localStorage.getItem('auth_redirect')
    localStorage.removeItem('auth_redirect')
    
    if (savedPath && savedPath !== '/' && savedPath.startsWith('/')) {
      router.replace(savedPath)
    } else {
      router.replace('/')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-500">
        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold">Connexion en cours...</p>
      </div>
    </div>
  )
}
