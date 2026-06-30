'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { saveToHistory } from '@/lib/history'

export default function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copied, setCopied] = useState(false)
  const [strength, setStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: '',
    color: 'bg-gray-200'
  })

  // Evaluate password strength
  const evaluateStrength = (pass: string) => {
    let score = 0
    if (pass.length > 8) score += 1
    if (pass.length >= 16) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Moyen', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Fort', color: 'bg-green-500' }
    return { score, label: 'Très Fort', color: 'bg-emerald-600' }
  }

  // Generate password securely
  const generatePassword = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='

    let chars = ''
    if (includeUppercase) chars += upper
    if (includeLowercase) chars += lower
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    // Default fallback if nothing is selected
    if (chars === '') {
      chars = lower
      setIncludeLowercase(true)
    }

    // Use Web Crypto API for secure random numbers
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)

    let newPassword = ''
    for (let i = 0; i < length; i++) {
      newPassword += chars[array[i] % chars.length]
    }

    setPassword(newPassword)
    setStrength(evaluateStrength(newPassword))
    setCopied(false)
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols])

  // Generate on first mount and when dependencies change
  useEffect(() => {
    generatePassword()
  }, [generatePassword])

  const copyToClipboard = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    
    // Log history
    saveToHistory('Mot de passe généré', 'Sécurité', `${password.length} caractères`, 'success')

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Retour
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            100% Gratuit
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Générateur de Mots de Passe
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Créé instantanément et sécurisé. Aucun mot de passe n'est stocké ou transmis sur Internet (API Locale).
          </p>
        </div>

        {/* Display */}
        <div className="relative group">
          <div className="w-full min-h-[4rem] flex flex-wrap items-center justify-center p-4 bg-gray-500/5 border border-gray-200/20 rounded-xl text-center break-all font-mono text-xl sm:text-2xl font-medium tracking-tight text-gray-800 dark:text-gray-100 selection:bg-blue-500/30">
            {password || 'Génération...'}
          </div>
          
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-black/5 dark:border-white/10 text-gray-600 dark:text-gray-300 transition-all shadow-sm"
            title="Copier le mot de passe"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Strength Indicator */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>Force du mot de passe</span>
            <span className={`px-2 py-0.5 rounded text-white ${strength.color}`}>
              {strength.label}
            </span>
          </div>
          <div className="flex gap-1 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`h-full flex-1 transition-colors duration-300 ${
                  level <= strength.score ? strength.color : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-2" />

        {/* Controls */}
        <div className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Longueur</span>
              <span className="text-sm font-extrabold text-blue-500">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeUppercase} 
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              Majuscules (A-Z)
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeLowercase} 
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              Minuscules (a-z)
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeNumbers} 
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              Chiffres (0-9)
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={includeSymbols} 
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              Symboles (!@#)
            </label>
          </div>

        </div>

        <div className="flex gap-3">
          <button
            onClick={generatePassword}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 border border-gray-200/50 dark:border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-générer
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl disabled:opacity-40 shadow-lg shadow-blue-500/20 hover:scale-[1.02] duration-150 flex items-center justify-center gap-2"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>

      </div>
    </div>
  )
}
