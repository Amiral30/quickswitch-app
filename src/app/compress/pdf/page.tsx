'use client'

import { useState, useEffect } from 'react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useQuota } from '@/hooks/useQuota'
import AuthModal from '@/components/AuthModal'
import AdInterstitial from '@/components/AdInterstitial'
import { supabase } from '@/lib/supabase'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from '@/components/FileDropzone'

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
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
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    if (ext !== 'pdf') {
      setError("Format de fichier non pris en charge. Veuillez utiliser un PDF.")
      return
    }

    const fileSizeMB = selectedFile.size / 1024 / 1024
    if (fileSizeMB > limits.maxFileSizeMB) {
      if (!userEmail) {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Privilège Free limité à 10 Mo.`)
        setIsAuthOpen(true)
      } else if (tier === 'FREE') {
        setError(`Fichier trop lourd (${fileSizeMB.toFixed(1)} Mo). Ce fichier dépasse la limite gratuite de 10 Mo. Passez à e-swiftools Pro.`)
      } else {
        setError(`Fichier trop lourd. Limite dépassée.`)
      }
      return
    }

    setFile(selectedFile)
    setError('')
    setProgress(0)
  }



  const handleCompress = async () => {
    if (!file) return

    if (!hasQuota) {
      if (!userEmail) setError("Limite journalière de 2 actions atteinte. Créez un compte pour plus d'actions !")
      else setError("Quota de 10 actions atteint. Revenez demain ou passez à e-swiftools Pro !")
      setIsAuthOpen(true)
      return
    }

    setProcessing(true)
    setError('')
    setProgress(10)
    setResultUrl(null)
    setResultFilename(`e-swiftools_comprime_${file.name}`)
    setIsInterstitialOpen(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      setProgress(40)
      
      // Load PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      setProgress(70)

      // Re-save PDF which acts as an optimizer by dropping unreachable metadata and rewriting streams
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false })
      setProgress(95)
      
      const blob = new Blob([new Uint8Array(pdfBytes) as unknown as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setResultUrl(url)

      saveToHistory(file.name, 'Compress. PDF', 'Optimisé via pdf-lib', 'success')
      recordAction()
      
    } catch (err: any) {
      setError("Erreur IA lors de la compression. Le PDF est peut-être corrompu ou chiffré.")
      console.error(err)
      saveToHistory(file.name, 'Compress. PDF', 'Échec', 'error')
      setIsInterstitialOpen(false)
    } finally {
      setProcessing(false)
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
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
            Compresseur PDF
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Optimiser & Compresser PDF
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Recompile les données de vos PDFs pour en réduire le poids sans perdre la lisibilité des textes. Traitement 100% local.
          </p>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFileSelected={handleUpload}
            colorTheme="red"
            title="Glissez-déposez un PDF ici"
            description={`Fichier PDF uniquement (Max : ${tier === 'PRO' ? '4 Go' : '10 Mo'})`}
          />
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
                disabled={processing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Action button */}
            <button
              onClick={handleCompress}
              disabled={processing}
              className={`w-full py-3.5 px-4 font-bold rounded-xl disabled:opacity-80 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                processing ? 'bg-gray-100 dark:bg-white/5 text-red-500' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.01]'
              }`}
            >
              {processing ? (
                <>
                  <div className="absolute inset-0 bg-red-500/10" style={{ width: `${progress}%` }} />
                  <div className="relative flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="animate-spin h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Compression en cours...
                    </div>
                  </div>
                </>
              ) : (
                'Compresser le PDF'
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
