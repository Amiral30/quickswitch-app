'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function QrResult() {
  const [data, setData] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    setData(params.get('data') || '')
    setImageUrl(params.get('url') || '')
  }, [])

  const isUrl = data.startsWith('http://') || data.startsWith('https://')
  const isWifi = data.startsWith('WIFI:')
  const isVCard = data.startsWith('BEGIN:VCARD')

  const copyToClipboard = () => {
    if (!data) return
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/qr/scan" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
            ← Scanner à nouveau
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
            Résultat
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Données décodées
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Informations récupérées localement suite au décodage du code QR.
          </p>
        </div>

        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-200/10 bg-white/50 p-2">
            <img 
              src={imageUrl} 
              alt="Code QR Scanné"
              className="w-full h-48 object-contain rounded-xl"
            />
          </div>
        )}

        {/* Decode display card */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Contenu brut</span>
            
            {isUrl && <span className="text-[10px] text-blue-500 font-bold">Lien Web</span>}
            {isWifi && <span className="text-[10px] text-green-500 font-bold">Réseau WiFi</span>}
            {isVCard && <span className="text-[10px] text-amber-500 font-bold">Fiche Contact (vCard)</span>}
          </div>
          
          <p className="text-sm font-semibold font-mono break-all mt-1 text-gray-800 dark:text-gray-200 select-all selection:bg-teal-500/20 leading-relaxed">
            {data || 'Aucune donnée décodée.'}
          </p>
        </div>

        {/* Context actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={copyToClipboard}
            className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-md duration-150 flex items-center justify-center gap-2 cursor-pointer transition ${
              copied 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-550/20 text-gray-850 dark:text-white hover:bg-gray-500/15 border border-gray-200/10'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Copié dans le presse-papiers !
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                </svg>
                Copier le texte brute
              </>
            )}
          </button>

          {isUrl && (
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center font-bold rounded-xl shadow-md shadow-teal-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer bg-teal-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Ouvrir l'adresse URL
            </a>
          )}

          {isWifi && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.282 7.657C9.7 6.108 11.737 5.25 12 5.25c.263 0 2.3 1.196 3.718 2.407m-7.436 3.518C9.333 10.103 10.97 9.5 12 9.5c1.03 0 2.667.603 3.718 1.675m-5.436 3.518a2.5 2.5 0 013.436 0M12 17h.01" />
              </svg>
              <span>Ce QR Code contient les paramètres d'un réseau WiFi. Connectez-vous via l'appareil photo natif de votre terminal mobile pour une configuration automatique.</span>
            </div>
          )}

          {isVCard && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h37.5M15 12h37.5M15 15h37.5M15 18H30M9 9h.01M9 12h.01M9 15h.01M9 18h.01" />
              </svg>
              <span>Fiche électronique de contact (vCard) détectée. Copiez le texte ci-dessus et enregistrez-le dans un fichier ".vcf" pour l'importer dans vos contacts.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}