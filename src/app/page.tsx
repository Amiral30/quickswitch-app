'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'
import { useQuota } from '@/hooks/useQuota'
import AdBanner from '@/components/AdBanner'

interface HistoryItem {
  id: string;
  filename: string;
  toolType: string;
  details: string;
  timestamp: string;
  status: 'success' | 'error';
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { tier, limits, actionsToday, loading } = useQuota()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session) setUserEmail(data.session.user.email ?? null)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUserEmail(session?.user?.email ?? null)
    })

    const stored = localStorage.getItem('swiftools_history')
    if (stored) {
      try { setHistory(JSON.parse(stored)) } catch (e) { console.error(e) }
    }

    return () => { authListener.subscription.unsubscribe() }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('swiftools_history')
    setHistory([])
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-transparent">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass-premium border-b border-gray-200/20 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <Image src="/logo.png" alt="e-swiftools" width={250} height={84}
              className="h-10 sm:h-14 w-auto object-contain duration-300 group-hover:scale-105 dark:hidden -ml-1 -mt-0.5 -mb-1" priority />
            <Image src="/nlogo.png" alt="e-swiftools" width={250} height={84}
              className="h-10 sm:h-14 w-auto object-contain duration-300 group-hover:scale-105 hidden dark:block -ml-1 -mt-0.5 -mb-1" priority />
          </Link>

          {/* Nav Links — desktop only */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <a
              href="#how"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/8 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Comment ça marche
            </a>
            <Link href="/legal/privacy" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Confidentialité
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3 flex-shrink-0 relative">
            {!loading && userEmail ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {tier === 'PRO' ? '⚡ Premium' : 'Membre Free'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {tier === 'PRO' ? 'Crédits illimités' : `${limits.maxActions - actionsToday} / ${limits.maxActions} crédits`}
                  </span>
                </div>

                {/* Badge mobile compact si Pro/Free */}
                <div className="md:hidden flex items-center mr-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full select-none ${
                    tier === 'PRO' 
                      ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white animate-pulse' 
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {tier === 'PRO' ? '⚡ Premium' : `${limits.maxActions - actionsToday} c.`}
                  </span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 duration-150 border border-white/20 select-none cursor-pointer"
                    title="Menu profil"
                  >
                    {userEmail[0].toUpperCase()}
                  </button>

                  {/* Dropdown Menu Glassmorphism */}
                  {isProfileOpen && (
                    <>
                      {/* Overlay discret pour fermer au clic dehors */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      
                      <div className="absolute right-0 mt-3 w-64 glass-premium rounded-2xl p-4 shadow-xl border border-gray-250/10 z-20 animate-float" style={{ animationDuration: '4s' }}>
                        <div className="border-b border-gray-200/10 pb-3 mb-3">
                          <p className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Compte connecté</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userEmail}</p>
                          <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                            tier === 'PRO' ? 'bg-amber-500/20 text-orange-500 border border-amber-500/30' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {tier === 'PRO' ? 'Premium (2,99€)' : 'Gratuit (10 Limite/jour)'}
                          </span>
                        </div>

                        {/* Quota Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            <span>Crédits du jour :</span>
                            <span>{tier === 'PRO' ? '∞' : `${limits.maxActions - actionsToday} restants`}</span>
                          </div>
                          {tier !== 'PRO' && (
                            <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(0, ((limits.maxActions - actionsToday) / limits.maxActions) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {tier !== 'PRO' && (
                            <button className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 transition-all">
                              ⚡ Passer Premium (2,99€)
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              supabase.auth.signOut()
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg shadow-blue-500/20 hover:scale-[1.02] duration-150"
                >
                  ⚡ <span className="hidden sm:inline">e-swiftools </span>Premium
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-12">

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto flex flex-col gap-4 animate-float">
          <div className="inline-flex self-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Traitement 100% Hors-ligne / Local
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Gérez vos fichiers en un <span className="text-gradient">Raccourci</span>
          </h1>
          <p className="text-md md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Convertissez, compressez et lisez des QR codes instantanément. Vos données ne quittent jamais votre ordinateur.
          </p>
        </section>

        {/* Tools Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Link href="/convert" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(59,130,246,0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Convertisseur</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Modifiez le format de vos fichiers vidéo, audio, images et documents en local.</p>
              </div>
              <span className="text-xs font-semibold text-blue-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">Lancer l'outil →</span>
            </div>
          </Link>

          <Link href="/compress/image" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(235,120,11,0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-orange-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Compresseur</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Réduisez le poids de vos images JPG ou PNG avec curseur de gestion de la qualité.</p>
              </div>
              <span className="text-xs font-semibold text-orange-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">Lancer l'outil →</span>
            </div>
          </Link>

          <Link href="/qr/generate" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(168,85,247,0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zm2 2h2v2h-2zm-2 2h2v-2zm4 0h2v2h-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Créer QR Code</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Générez des QR codes pour vos liens, configurations WiFi, emails ou fiches vCard.</p>
              </div>
              <span className="text-xs font-semibold text-purple-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">Lancer l'outil →</span>
            </div>
          </Link>

          <Link href="/qr/scan" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(20,184,166,0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-9h1m-16 0h1m3-6h8a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Scanner QR Code</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Lisez instantanément des codes QR par flux caméra ou en déposant une image.</p>
              </div>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">Lancer l'outil →</span>
            </div>
          </Link>

          {/* Card: À venir */}
          <div className="h-full glass-premium p-8 rounded-2xl flex flex-col justify-between gap-6 border border-dashed border-gray-300/30 dark:border-white/10 opacity-75 hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-gray-500 dark:text-gray-400">Et d'autres...</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 animate-pulse border border-blue-500/20">
                  À venir
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                De nouveaux outils d'édition de médias (Audio, Vidéos, PDF) arrivent très prochainement.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Restez à l'écoute</span>
          </div>
        </section>

        {/* Dashboard — History + Pro Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* History */}
          <section className="lg:col-span-2 glass-premium p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Historique Local Récent
                <span className="text-xs bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded-full font-normal">
                  {history.length} actions
                </span>
              </h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-500 font-semibold hover:underline">
                  Tout effacer
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200/10 rounded-xl">
                Vos conversions récentes s'afficheront ici. Rien n'est conservé hors de votre navigateur.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/10 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="pb-3 pt-1">Fichier</th>
                      <th className="pb-3 pt-1">Outil / Type</th>
                      <th className="pb-3 pt-1">Détails</th>
                      <th className="pb-3 pt-1 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-250/5">
                    {history.map((item: HistoryItem) => (
                      <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-3 font-medium truncate max-w-[200px]">{item.filename}</td>
                        <td className="py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-300">
                            {item.toolType}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500">{item.details}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'success' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-red-500/15 text-red-700 dark:text-red-400'
                          }`}>
                            {item.status === 'success' ? 'Réussi' : 'Échoué'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Pro Card */}
          <section id="pricing" className="glass-premium p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 flex flex-col gap-4">
            <div className="text-xs uppercase tracking-widest font-black text-blue-500">OFFRE LIMITÉE</div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">Passez à e-swiftools Pro</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Débloquez la conversion par lot, des fichiers jusqu'à 4 Go, le support prioritaire et la suppression des pubs.
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 flex flex-col gap-2 py-2">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Fichiers lourds (&gt; 10 Mo)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Conversion par lot (x10)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                QR Code sans watermark
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Sans publicités
              </li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-95 shadow-md shadow-blue-500/10 hover:scale-[1.01] duration-150">
              Accéder au forfait Pro (2,99€/mois)
            </button>
          </section>
        </div>

        {/* ── Section: Comment ça marche ─────────────────────────────────── */}
        <section id="how" className="mt-8 pt-10 border-t border-gray-200/10 flex flex-col gap-10">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Comment ça marche ?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trois étapes rapides et privées. Vos fichiers ne transitent sur aucun serveur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glass-premium p-6 rounded-2xl flex flex-col gap-4 border border-gray-200/10 hover-premium" style={{ '--glow-color': 'rgba(59, 130, 246, 0.1)' } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Glissez vos fichiers
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Importez vos documents, images ou vidéos directement dans nos modules locaux de conversion ou de compression.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-premium p-6 rounded-2xl flex flex-col gap-4 border border-gray-200/10 hover-premium" style={{ '--glow-color': 'rgba(147, 51, 234, 0.1)' } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Traitement instantané
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Le navigateur exécute le traitement en local grâce à WebAssembly (FFmpeg, Canvas). Zéro chargement serveur.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-premium p-6 rounded-2xl flex flex-col gap-4 border border-gray-200/10 hover-premium" style={{ '--glow-color': 'rgba(16, 185, 129, 0.1)' } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-md text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Téléchargement sécurisé
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Enregistrez le résultat en qualité optimale immédiatement. Vos données restent privées de bout en bout.
              </p>
            </div>
          </div>
        </section>

        {/* Bannière pub horizontale */}
        <AdBanner format="horizontal" className="mt-2" />

      </main>
    </div>
  )
}