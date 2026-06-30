'use client'

import { useState, useEffect } from 'react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useQuota } from '@/hooks/useQuota'
import AuthModal from '@/components/AuthModal'
import AdInterstitial from '@/components/AdInterstitial'
import { supabase } from '@/lib/supabase'
import { removeBackground } from '@imgly/background-removal'

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progress, setProgress] = useState(0)
  
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

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

  const handleUpload = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setError("Format d'image non pris en charge. Veuillez utiliser JPG, PNG ou WEBP.")
      return
    }

    const fileSizeMB = selectedFile.size / 1024 / 1024
    // Standard limits: free users 10MB, pro 4GB
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Limite de 1 Mo sans compte. Créez un compte !`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Vous dépassez votre limite. Passez à e-swiftools Pro.`)
      } else {
        setError(`Fichier trop lourd. Limite dépassée.`)
      }
      return
    }

    setFile(selectedFile)
    setError('')
    setProgress(0)
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

    try {
      // Configuration optionally allows a custom 'publicPath' for WASM assets
      // but imgly hosts it themselves by default perfectly fine.
      // We pass progress callback to provide UI feedback since it loads a ~40MB model the first time
      const config = {
        progress: (key: string, current: number, total: number) => {
          if (key.includes('fetch:')) {
            setProgressMsg("Téléchargement du modèle IA (Ceci n'arrive qu'une fois)...")
            setProgress(Math.round((current / total) * 100))
          } else if (key.includes('compute:')) {
            setProgressMsg("Détourage IA en cours...")
            setProgress(Math.round((current / total) * 100))
          }
        }
      }

      const resultBlob = await removeBackground(file, config)
      
      const url = URL.createObjectURL(resultBlob)
      const fname = `transparent_${file.name.replace(/\.[^.]+$/, '.png')}`
      
      setResultUrl(url)
      setResultFilename(fname)

      saveToHistory(file.name, 'Détourage IA', 'Fond supprimé', 'success')
      recordAction()

      setIsInterstitialOpen(true)
      
    } catch (err: any) {
      setError("Erreur IA lors du détourage. Image potentiellement non supportée.")
      console.error(err)
      saveToHistory(file.name, 'Détourage IA', 'Échec', 'error')
    } finally {
      setProcessing(false)
      setProgress(0)
      setProgressMsg('')
    }
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' Mo'
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-xl w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Retour
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
            Détourage IA
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suppresseur de Fond d'Image
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supprimez l'arrière-plan de vos photos instantanément grâce à notre IA 100% Locale. Aucun fichier envoyé !
          </p>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div 
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors duration-200 cursor-pointer 
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
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Glissez-déposez une image ici
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              JPG, PNG, WEBP acceptés
            </p>
            
            <span className="mt-6 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold pointer-events-none">
              Parcourir les fichiers
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Taille originale : {formatSize(file.size)}</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 disabled:opacity-50"
                title="Changer d'image"
                disabled={processing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Action button */}
            <button
              onClick={handleRemoveBackground}
              disabled={processing}
              className={`w-full py-3.5 px-4 font-bold rounded-xl disabled:opacity-80 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                processing ? 'bg-gray-100 dark:bg-white/5 text-indigo-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01]'
              }`}
            >
              {processing ? (
                <>
                  <div className="absolute inset-0 bg-indigo-500/10" style={{ width: `${progress}%` }} />
                  <div className="relative flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {progressMsg}
                    </div>
                    {progress > 0 && (
                      <span className="text-[10px] opacity-70 font-mono font-bold leading-none">{progress}%</span>
                    )}
                  </div>
                </>
              ) : (
                'Supprimer le fond (Magie IA ✨)'
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl leading-relaxed">
            ⚠️ {error}
          </p>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <AdInterstitial
        isOpen={isInterstitialOpen}
        tier={tier}
        filename={resultFilename}
        blobUrl={resultUrl}
        onClose={() => setIsInterstitialOpen(false)}
        delaySeconds={5}
      />
    </div>
  )
}
