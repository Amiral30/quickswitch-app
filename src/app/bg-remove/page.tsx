'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useQuota } from '@/hooks/useQuota'
import AuthModal from '@/components/AuthModal'
import AdInterstitial from '@/components/AdInterstitial'
import { supabase } from '@/lib/supabase'

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Before/After slider
  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const { tier, hasQuota, recordAction, limits } = useQuota()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session) setUserEmail(data.session.user.email ?? null)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => { authListener.subscription.unsubscribe() }
  }, [])

  const handleSliderMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingSlider || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pos = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100))
    setSliderPos(pos)
  }, [isDraggingSlider])

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleSliderMove)
      window.addEventListener('touchmove', handleSliderMove)
      window.addEventListener('mouseup', () => setIsDraggingSlider(false))
      window.addEventListener('touchend', () => setIsDraggingSlider(false))
    }
    return () => {
      window.removeEventListener('mousemove', handleSliderMove)
      window.removeEventListener('touchmove', handleSliderMove)
    }
  }, [isDraggingSlider, handleSliderMove])

  const handleUpload = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setError("Format non pris en charge. Utilisez JPG, PNG ou WEBP.")
      return
    }
    const fileSizeMB = selectedFile.size / 1024 / 1024
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Limite de 1 Mo sans compte.`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Passez à e-swiftools Pro.`)
      } else {
        setError(`Fichier trop lourd. Limite dépassée.`)
      }
      return
    }
    setResultUrl(null)
    setSliderPos(50)
    setFile(selectedFile)
    setOriginalUrl(URL.createObjectURL(selectedFile))
    setError('')
    setProgressMsg('')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleUpload(droppedFile)
  }

  const handleRemoveBackground = async () => {
    if (!file) return
    if (!hasQuota) {
      if (!userEmail) {
        setError("Limite journalière atteinte. Créez un compte pour plus d'actions !")
      } else {
        setError("Quota quotidien atteint. Revenez demain ou passez Pro !")
      }
      setIsAuthOpen(true)
      return
    }

    setProcessing(true)
    setError('')
    setProgressMsg('Envoi de l\'image au serveur...')
    setResultUrl(null)
    setResultFilename(`transparent_${file.name.replace(/\.[^.]+$/, '.png')}`)
    setIsInterstitialOpen(true)

    try {
      // Build multipart form and call our secure server-side route
      const formData = new FormData()
      formData.append('image_file', file, file.name)

      setProgressMsg('Détourage IA en cours... ⚡')

      const response = await fetch('/api/bg-remove', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Erreur inattendue.' }))
        throw new Error(data.error || `Erreur ${response.status}`)
      }

      // The route returns the PNG blob directly
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setResultUrl(url)
      setSliderPos(50)

      saveToHistory(file.name, 'Détourage IA', 'Fond supprimé', 'success')
      recordAction()

    } catch (err: any) {
      setError(err.message || "Erreur lors du détourage. Réessayez.")
      console.error(err)
      saveToHistory(file?.name ?? 'image', 'Détourage IA', 'Échec', 'error')
      setIsInterstitialOpen(false)
    } finally {
      setProcessing(false)
      setProgressMsg('')
    }
  }

  const formatSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(1) + ' Mo'

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-2xl w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Retour
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
              Détourage IA
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1">
              <svg className="w-2.5 h-2.5 fill-green-500" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
              Traitement Cloud ⚡
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suppresseur de Fond d'Image
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supprimez l'arrière-plan instantanément grâce à notre IA Cloud. Résultat en quelques secondes !
          </p>
        </div>

        {/* Speed badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-3 py-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            2–5 secondes
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/8 border border-blue-500/15 rounded-full px-3 py-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Qualité Professionnelle
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/8 border border-purple-500/15 rounded-full px-3 py-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            PNG Transparent
          </div>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors duration-200 cursor-pointer 
              ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-300 dark:border-white/10 hover:border-indigo-500/50 hover:bg-gray-500/5'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) handleUpload(selected)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Sélectionner une photo"
            />
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Glissez-déposez une image ici</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">JPG, PNG, WEBP • Max {limits.maxFileSizeMB} Mo</p>
            <span className="mt-6 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold pointer-events-none">
              Parcourir les fichiers
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Before/After Slider — shown when result is ready */}
            {resultUrl && originalUrl ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Avant / Après — Faites glisser</p>
                <div
                  ref={sliderRef}
                  className="relative w-full rounded-xl overflow-hidden cursor-col-resize select-none"
                  style={{ aspectRatio: '16/9' }}
                >
                  {/* Checkerboard for transparency */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#d0d0d0 0% 25%, #f8f8f8 0% 50%)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  {/* Original */}
                  {/* Result image - middle layer, showing checkerboard through transparent parts */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="Sans fond" className="absolute inset-0 w-full h-full object-contain" />
                  
                  {/* Original image - top layer, clipped on the left to reveal transparent result + checkerboard */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={originalUrl} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-contain" 
                    style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }} 
                  />
                  {/* Divider */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-black/40"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-col-resize"
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onTouchStart={() => setIsDraggingSlider(true)}
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-indigo-500/80 text-white px-2 py-0.5 rounded-full">Sans fond</span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full">Original</span>
                </div>
              </div>
            ) : (
              /* File preview */
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {originalUrl && <img src={originalUrl} alt="preview" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Taille : {formatSize(file.size)}</p>
                </div>
                <button
                  onClick={() => { setFile(null); setResultUrl(null); setOriginalUrl(null) }}
                  className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 disabled:opacity-50"
                  title="Changer d'image"
                  disabled={processing}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Processing progress */}
            {processing && (
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressMsg}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">L'IA Cloud analyse votre image...</p>
                  </div>
                </div>
                {/* Animated indeterminate bar */}
                <div className="w-full h-1 bg-indigo-100 dark:bg-indigo-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {resultUrl && (
                <button
                  onClick={() => { setFile(null); setResultUrl(null); setOriginalUrl(null) }}
                  className="flex-1 py-3 px-4 font-bold rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm border border-gray-200/50 dark:border-white/10 transition"
                >
                  Nouvelle image
                </button>
              )}
              <button
                onClick={handleRemoveBackground}
                disabled={processing || !!resultUrl}
                className={`flex-1 py-3.5 px-4 font-bold rounded-xl disabled:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  processing
                    ? 'bg-gray-100 dark:bg-white/5 text-indigo-500 cursor-wait'
                    : resultUrl
                    ? 'bg-green-500/15 text-green-600 cursor-default'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01]'
                }`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Traitement en cours...
                  </>
                ) : resultUrl ? (
                  '✓ Fond supprimé avec succès !'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Supprimer le fond (2–5 sec ⚡)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl leading-relaxed">
            ⚠️ {error}
          </p>
        )}

        {/* Info footer */}
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-600">
          Propulsé par Clipdrop AI · Vos images sont traitées de façon sécurisée et ne sont pas stockées
        </p>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <AdInterstitial
        isOpen={isInterstitialOpen}
        processing={processing}
        tier={tier}
        filename={resultFilename}
        blobUrl={resultUrl}
        onClose={() => setIsInterstitialOpen(false)}
        delaySeconds={5}
      />
    </div>
  )
}
