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

const OUTPUT_FORMATS: Record<string, string[]> = {
  video: ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  image: ['jpg', 'png', 'webp', 'gif', 'pdf'],
  document: ['pdf', 'txt', 'docx']
}

function getCategory(filename: string): keyof typeof OUTPUT_FORMATS | null {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) return 'audio'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image'
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
  return null
}

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [outputFormat, setOutputFormat] = useState('')
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const { tier, hasQuota, recordAction, limits } = useQuota()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    // 1. Validation de l'extension
    const category = getCategory(selectedFile.name)
    if (!category) {
      setError("Format de fichier non pris en charge pour la conversion.")
      return
    }

    // 2. Validation de la taille de fichier maximale
    const fileSizeMB = selectedFile.size / 1024 / 1024
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Les utilisateurs non-connectés sont limités à 1 Mo. Veuillez créer un compte gratuit pour convertir jusqu'à 10 Mo.`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Ce fichier dépasse la limite gratuite de 10 Mo. Passez à e-swiftools Pro pour lever toutes les limites.`)
      } else {
        setError(`Fichier trop lourd. Limite maximale de 4 Go dépassée.`)
      }
      return
    }

    setFile(selectedFile)
    setStep(2)
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleUpload(selected)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleUpload(droppedFile)
  }

  const handleConvert = async () => {
    if (!file || !outputFormat) return
    
    // 3. Validation de la limite quotidienne de quota
    if (!hasQuota) {
      if (!userEmail) {
        setError("Limite journalière de 2 conversions atteinte. Créez un compte gratuit Google en 1 clic pour obtenir 10 conversions quotidiennes !")
      } else {
        setError("Votre quota de 10 conversions quotidiennes a été atteint. Revenez dans 24H ou passez à e-swiftools Pro pour des conversions illimitées !")
      }
      setIsAuthOpen(true)
      return
    }

    setConverting(true)
    setError('')
    setResultUrl(null)
    setResultFilename(file.name.replace(/\.[^.]+$/, `.${outputFormat}`))
    setIsInterstitialOpen(true)

    try {
      // Reuse shared loader to avoid loading 30MB over and over
      const ffmpeg = await loadFFmpeg()
      
      const ext = file.name.split('.').pop() || 'mp4'
      const inputName = `input.${ext}`
      const outputName = `output.${outputFormat}`
      
      const fileData = await fetchFile(file)
      await ffmpeg.writeFile(inputName, fileData)
      
      await ffmpeg.exec(['-i', inputName, outputName])
      
      const data = await ffmpeg.readFile(outputName)
      const uint8 = typeof data === 'string' 
        ? new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
        : new Uint8Array(data)
      
      const mimeType = outputFormat === 'mp3' ? 'audio/mp3' : 
                       outputFormat === 'jpg' ? 'image/jpeg' : 
                       outputFormat === 'png' ? 'image/png' : 
                       `video/${outputFormat}`
      
      const blob = new Blob([uint8], { type: mimeType })
      const url = URL.createObjectURL(blob)
      setResultUrl(url)

      // Log success to local storage history
      saveToHistory(file.name, 'Convertisseur', `${ext.toUpperCase()} ➔ ${outputFormat.toUpperCase()}`, 'success')
      
      // Déduire un crédit du quota
      recordAction()
      
    } catch (err) {
      setError('Erreur lors de la conversion. Le fichier est peut-être corrompu ou trop lourd.')
      console.error(err)
      setIsInterstitialOpen(false)
      
      if (file) {
        saveToHistory(file.name, 'Convertisseur', `${file.name.split('.').pop()?.toUpperCase()} ➔ ${outputFormat.toUpperCase()}`, 'error')
      }
    } finally {
      setConverting(false)
    }
  }

  const category = file ? getCategory(file.name) : null
  const inputExt = file?.name.split('.').pop()?.toLowerCase() || ''
  const outputFormats = category ? OUTPUT_FORMATS[category].filter(fmt => fmt !== inputExt) : []

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-xl w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Accueil
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            Convertisseur
          </span>
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Convertisseur Multi-formats
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Encodez et transformez vos fichiers multimédias 100% hors-ligne.
          </p>
        </div>

        {step === 1 && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' 
                : 'border-gray-250/20 hover:border-blue-500/60 hover:bg-blue-500/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*,audio/*,image/*,.pdf,.doc,.docx"
              onChange={handleInputChange}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" stroke="m4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            </div>

            <div className="text-center">
              <p className="font-bold text-gray-700 dark:text-gray-300">
                Glissez-déposez un fichier ici
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ou cliquez pour parcourir les dossiers
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {['MP4', 'MOV', 'MP3', 'WAV', 'PNG', 'JPG', 'PDF', 'DOCX'].map((badge) => (
                <span key={badge} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 dark:text-gray-400">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 2 && file && (
          <div className="flex flex-col gap-6">
            {/* Selected File Card View */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
                {inputExt}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-250 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
              <button 
                onClick={() => { setFile(null); setStep(1); setOutputFormat(''); }}
                className="text-gray-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 7-.8 13.2a2 2 0 01-2 1.8H7.8a2 2 0 01-2-1.8L5 7m5 4v6m4-6v6M1 4h22M8 4V1h8v3" />
                </svg>
              </button>
            </div>

            {/* Target Select View */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Sélectionner le format de destination :
              </label>
              
              <div className="relative">
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-3.5 bg-gray-500/5 border border-gray-200/10 rounded-xl text-sm font-semibold tracking-wide dark:text-white appearance-none focus:outline-none focus:border-blue-500/80 transition-colors cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">Choisir un format...</option>
                  {outputFormats.map(fmt => (
                    <option key={fmt} value={fmt} className="dark:bg-slate-900">{fmt.toUpperCase()}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!outputFormat || converting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-95 shadow-md shadow-blue-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {converting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Conversion en cours...
                </>
              ) : 'Démarrer la conversion'}
            </button>
          </div>
        )}

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
        processing={converting}
        tier={tier}
        filename={resultFilename}
        blobUrl={resultUrl}
        onClose={() => setIsInterstitialOpen(false)}
        delaySeconds={5}
      />
    </div>
  )
}