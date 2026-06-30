'use client'

import { useState, useRef, useEffect } from 'react'
import { loadFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useQuota } from '@/hooks/useQuota'
import AuthModal from '@/components/AuthModal'
import AdInterstitial from '@/components/AdInterstitial'
import { supabase } from '@/lib/supabase'

export default function CompressVideo() {
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [compressing, setCompressing] = useState(false)
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
    if (!['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
      setError("Format de fichier non pris en charge. Veuillez utiliser MP4, MOV, AVI, MKV ou WEBM.")
      return
    }

    const fileSizeMB = selectedFile.size / 1024 / 1024
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Les utilisateurs non-connectés sont limités à 1 Mo. Créez un compte !`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Ce fichier dépasse la limite gratuite de 10 Mo. Passez à e-swiftools Pro.`)
      } else {
        setError(`Fichier trop lourd. Limite de 4 Go dépassée.`)
      }
      return
    }

    setFile(selectedFile)
    setError('')
    setProgress(0)
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

  const handleCompress = async () => {
    if (!file) return
    
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
    setProgress(0)

    try {
      const ffmpeg = await loadFFmpeg()
      
      // Update progress
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100))
      })
      
      const ext = file.name.split('.').pop() || 'mp4'
      const inputName = `input.${ext}`
      const outputName = `output.mp4` // Always output to mp4 for best web compatibility
      
      const fileData = await fetchFile(file)
      await ffmpeg.writeFile(inputName, fileData)
      
      // Setup FFmpeg arguments based on exact compression level
      let crf = '28' // Default medium
      if (compressionLevel === 'LOW') crf = '23'
      if (compressionLevel === 'HIGH') crf = '32'

      const args = [
        '-i', inputName,
        '-vcodec', 'libx264',
        '-crf', crf,
        '-preset', 'fast',
        outputName
      ]

      await ffmpeg.exec(args)
      
      const data = await ffmpeg.readFile(outputName)
      const uint8 = typeof data === 'string' 
        ? new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
        : new Uint8Array(data)
      
      const blob = new Blob([uint8], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const fname = `compressed_${file.name.replace(/\.[^.]+$/, '.mp4')}`
      
      setResultUrl(url)
      setResultFilename(fname)

      saveToHistory(file.name, 'Compress. Vidéo', `Niveau : ${compressionLevel}`, 'success')
      recordAction()

      // Cleanup
      ffmpeg.off('progress', () => {})
      setIsInterstitialOpen(true)
      
    } catch (err) {
      setError('Erreur lors de la compression. La vidéo est peut-être corrompue ou trop lourde.')
      console.error(err)
      saveToHistory(file.name, 'Compress. Vidéo', 'Échec', 'error')
    } finally {
      setCompressing(false)
      setProgress(0)
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
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            Compresseur Vidéo
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compresser Vidéo MP4 / MOV
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Réduisez drastiquement le poids de vos vidéos. Traitement local sans upload sur serveur.
          </p>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div 
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors duration-200 cursor-pointer 
              ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-300 dark:border-white/10 hover:border-blue-500/50 hover:bg-gray-500/5'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) handleUpload(selected)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Sélectionner une vidéo"
            />
            
            <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Glissez-déposez une vidéo ici
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              MP4, MOV, AVI, MKV (Max: {tier === 'PRO' ? '4 Go' : '10 Mo'})
            </p>
            
            <span className="mt-6 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold pointer-events-none">
              Parcourir les fichiers
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Taille originale : {formatSize(file.size)}</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 disabled:opacity-50"
                title="Changer de fichier"
                disabled={compressing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Config: Compression Level */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Niveau de compression</span>
              
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={compressing}
                    onClick={() => setCompressionLevel(level)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                      compressionLevel === level 
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                      : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-500/5'
                    }`}
                  >
                    {level === 'LOW' ? 'Légère' : level === 'MEDIUM' ? 'Recommandée' : 'Élevée'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                {compressionLevel === 'LOW' && 'Haute qualité visuelle, taille légèrement réduite.'}
                {compressionLevel === 'MEDIUM' && 'Excellent compromis entre qualité et poids du fichier.'}
                {compressionLevel === 'HIGH' && 'Perte de qualité visible, mais taille de fichier minimale.'}
              </p>
            </div>
            
            {/* Action button */}
            <button
              onClick={handleCompress}
              disabled={compressing}
              className={`w-full py-3.5 px-4 font-bold rounded-xl disabled:opacity-80 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                compressing ? 'bg-gray-100 dark:bg-white/5 text-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.01]'
              }`}
            >
              {compressing ? (
                <>
                  <div className="absolute inset-0 bg-blue-500/10" style={{ width: `${progress}%` }} />
                  <div className="relative flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Compression... {progress}%
                  </div>
                </>
              ) : (
                'Compresser la vidéo'
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
