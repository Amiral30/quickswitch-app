'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

  // Initialize client elements
  useEffect(() => {
    setMounted(true)

    // Load History
    const loadHistory = () => {
      const stored = localStorage.getItem('swiftools_history')
      if (stored) {
        try {
          setHistory(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
      }
    }
    loadHistory()
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('swiftools_history')
    setHistory([])
  }

  if (!mounted) {
    return null // Prevent flash on SSR
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-premium border-b border-gray-200/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="e-swiftools logo clair"
              width={140}
              height={48}
              className="h-10 w-auto object-contain duration-300 group-hover:scale-105 dark:hidden"
              priority
            />
            <Image
              src="/nlogo.png"
              alt="e-swiftools logo sombre"
              width={140}
              height={48}
              className="h-10 w-auto object-contain duration-300 group-hover:scale-105 hidden dark:block"
              priority
            />
          </Link>

          <div className="flex items-center gap-4">

            {/* Premium CTA */}
            <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:opacity-95 shadow-lg shadow-blue-500/20 hover:scale-[1.02] duration-150">
              ⚡ Upgrade Pro
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-12">
        <section className="text-center max-w-3xl mx-auto flex flex-col gap-4 animate-float">
          <div className="inline-flex self-center items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            🔒 Traitement 100% Hors-ligne / Local
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Gérez vos fichiers en un <span className="text-gradient">Raccourci</span>
          </h1>
          <p className="text-md md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Convertissez, compressez et lisez des QR codes instantanément. Vos données ne quittent jamais votre ordinateur.
          </p>
        </section>

        {/* Tools Section Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Convertisseur */}
          <Link href="/convert" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(59, 130, 246, 0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Convertisseur
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Modifiez le format de vos fichiers vidéo, audio, images et documents en local.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">
                Lancer l'outil →
              </span>
            </div>
          </Link>

          {/* Card: Compresseur */}
          <Link href="/compress/image" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(235, 120, 11, 0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-orange-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Compresseur
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Réduisez le poids de vos images JPG ou PNG avec curseur de gestion de la qualité.
                </p>
              </div>
              <span className="text-xs font-semibold text-orange-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">
                Lancer l'outil →
              </span>
            </div>
          </Link>

          {/* Card: QR Generator */}
          <Link href="/qr/generate" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(168, 85, 247, 0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zm2 2h2v2h-2zm-2 2h2v-2zm4 0h2v2h-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Créer QR Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Générez des QR codes pour vos liens, configurations WiFi, emails ou fiches vCard.
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-500 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">
                Lancer l'outil →
              </span>
            </div>
          </Link>

          {/* Card: QR Scanner */}
          <Link href="/qr/scan" className="group">
            <div className="h-full glass-premium p-8 rounded-2xl hover-premium flex flex-col justify-between gap-6" style={{ '--glow-color': 'rgba(20, 184, 166, 0.2)' } as React.CSSProperties}>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-9h1m-16 0h1m3-6h8a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Scanner QR Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Lisez instantanément des codes QR par flux caméra ou en déposant une image.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 duration-150 inline-flex items-center gap-1">
                Lancer l'outil →
              </span>
            </div>
          </Link>
        </section>

        {/* Dashboard Panels (Logs + Premium Banners) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent History Table */}
          <section className="lg:col-span-2 glass-premium p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📋 Historique Local Recente
                <span className="text-xs bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded-full font-normal">
                  {history.length} actions
                </span>
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
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
                    {history.map((item) => (
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

          {/* Premium Promotion Sidebar Card */}
          <section className="glass-premium p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 flex flex-col gap-4">
            <div className="text-xs uppercase tracking-widest font-black text-blue-500">
              OFFRE LIMITÉE
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Passez à e-swiftools Pro
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Débloquez la conversion par lot d'archives et de grands fichiers jusqu'à **4 Go**, le support prioritaire et la suppression des pubs.
            </p>
            <ul className="text-xs text-gray-500 flex flex-col gap-2 py-2">
              <li className="flex items-center gap-2">
                ✅ Fichiers lourds (&gt; 50 Mo)
              </li>
              <li className="flex items-center gap-2">
                ✅ Conversion par lot (x10)
              </li>
              <li className="flex items-center gap-2">
                ✅ QR Code sans watermark
              </li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-95 shadow-md shadow-blue-500/10 hover:scale-[1.01] duration-150">
              Accéder au forfait Pro (4.99€)
            </button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-16 glass border-t border-gray-200/10 text-center text-xs text-gray-500 leading-relaxed">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} e-swiftools. Tous droits réservés.
        </p>
        <p className="max-w-md mx-auto">
          Conformité RGPD garantie. Traitement 100% local par WebAssembly. Aucun fichier n'est conservé sur des serveurs externes.
        </p>
      </footer>
    </div>
  )
}