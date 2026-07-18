'use client'

import { useState, useEffect } from 'react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useQuota } from '@/hooks/useQuota'
import AuthModal from '@/components/AuthModal'
import AdInterstitial from '@/components/AdInterstitial'
import { supabase } from '@/lib/supabase'
import FileDropzone from '@/components/FileDropzone'

export default function CompressImage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')
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
    // Validation de la taille de fichier maximale
    const fileSizeMB = selectedFile.size / 1024 / 1024
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Les utilisateurs non-connectés sont limités à 1 Mo. Veuillez créer un compte gratuit pour compresser jusqu'à 10 Mo.`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Ce fichier dépasse la limite gratuite de 10 Mo. Passez à e-swiftools Pro pour lever toutes les limites.`)
      } else {
        setError(`Fichier trop lourd. Limite maximale de 4 Go dépassée.`)
      }
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleCompress = async () => {
    if (!file) return
    
    // Validation du quota quotidien au clic
    if (!hasQuota) {
      if (!userEmail) {
        setError("Limite journalière de 2 actions atteinte. Créez un compte gratuit pour obtenir 10 actions quotidiennes !")
      } else {
        setError("Votre quota de 10 actions a été atteint. Revenez demain ou passez à e-swiftools Pro pour un accès illimité !")
      }
      setIsAuthOpen(true)
      return
    }

    setCompressing(true)
    setError('')
    setResultUrl(null)
    setResultFilename(`compressed_${file.name}`)
    setIsInterstitialOpen(true)

    try {
      const canvas = document.createElement('canvas')
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.src = url
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const ctx = canvas.getContext('2d')!
            canvas.width = img.width
            canvas.height = img.height
            
            const isPng = file.type === 'image/png'
            
            // Fill background with white ONLY path for non-PNG images to avoid ugly black spots on transparency
            if (!isPng) {
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            
            ctx.drawImage(img, 0, 0)
            
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  setResultUrl(url)
                  resolve()
                } else {
                  reject(new Error("La compression Canvas a échoué."))
                }
              },
              file.type, // Maintain original MIME type (image/png or image/jpeg)
              isPng ? undefined : quality // Quality only applies to lossy compression formats (jpg/webp)
            )
          } catch (e) {
            reject(e)
          }
        }
        img.onerror = () => reject(new Error("Impossible d'importer l'image."))
      })

      saveToHistory(file.name, 'Compresseur', `Qualité : ${(quality * 100).toFixed(0)}%`, 'success')
      recordAction()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Erreur lors de la compression de la photo.')
      console.error(err)
      saveToHistory(file.name, 'Compresseur', 'Échec compression', 'error')
      setIsInterstitialOpen(false)
    } finally {
      setCompressing(false)
    }
  }

  const ext = file?.name.split('.').pop()?.toUpperCase() || ''

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Retour
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
            Compresseur
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compresser Image JPG/PNG
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Réduisez le poids de vos fichiers tout en conservant la transparence originale.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {!file ? (
            <FileDropzone
              accept="image/png,image/jpeg,image/jpg"
              onFileSelected={handleUpload}
              colorTheme="orange"
              title="Glissez-déposez une image ici"
              description={`JPG, PNG (Max : ${limits.maxFileSizeMB} Mo)`}
            />
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-500 font-bold text-[10px]">
                {ext}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {(file.size / 1024).toFixed(0)} Ko
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {file && file.type !== 'image/png' && (
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Qualité de compression</span>
                <span className="text-sm font-extrabold text-orange-500 dark:text-orange-450">
                  {(quality * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-[10px] text-gray-500">
                Une qualité plus faible réduit la netteté mais diminue radicalement le poids du fichier.
              </span>
            </div>
          )}

          {file && file.type === 'image/png' && (
            <div className="p-3 text-[10px] bg-orange-500/5 text-orange-500 border border-orange-500/20 rounded-xl leading-relaxed">
              💡 Les fichiers au format PNG étant compressés sans perte (lossless), le curseur de qualité n'est pas modifiable pour préserver la transparence du fichier.
            </div>
          )}
        </div>

        <button
          onClick={handleCompress}
          disabled={!file || compressing}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-550 to-amber-500 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-95 shadow-md shadow-orange-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer bg-orange-500"
        >
          {compressing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Compression...
            </>
          ) : 'Compresser'}
        </button>

        {error && (
          <p className="text-red-500 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl leading-relaxed">
            ⚠️ {error}
          </p>
        )}
      </div>
      
      {/* Modale d'authentification intégrée */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      {/* Modale publicitaire + téléchargement */}
      <AdInterstitial
        isOpen={isInterstitialOpen}
        processing={compressing}
        tier={tier}
        filename={resultFilename}
        blobUrl={resultUrl}
        onClose={() => setIsInterstitialOpen(false)}
        delaySeconds={5}
      />
    </div>
  )
}