'use client'

import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function QrScanner() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [useCamera, setUseCamera] = useState(false)
  const [streamReady, setStreamReady] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = stream
      setStreamReady(true)
      setError('')
    } catch (err) {
      setError('Caméra inaccessible. Veuillez vérifier les autorisations dans votre navigateur.')
      setUseCamera(false)
    }
  }

  useEffect(() => {
    if (!useCamera) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      setStreamReady(false)
      return
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [useCamera])

  useEffect(() => {
    if (streamReady && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(e => console.error(e))
    }
  }, [streamReady])

  useEffect(() => {
    if (!streamReady || !videoRef.current) return

    const scan = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (!video || !canvas) return

      if (video.videoWidth === 0) {
        rafRef.current = requestAnimationFrame(scan)
        return
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          // Log camera scan success
          saveToHistory('Scanner QR', 'Scanner QR Code', 'Scanné via caméra', 'success')
          const params = new URLSearchParams({ data: code.data })
          router.push(`/qr/result?${params.toString()}`)
          return
        }
      } catch (e) {
        // Continue scanning
      }

      rafRef.current = requestAnimationFrame(scan)
    }

    rafRef.current = requestAnimationFrame(scan)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [streamReady, router])

  const handleFileUpload = () => {
    if (!file) return
    setError('')
    
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          // Log file scan success
          saveToHistory(file.name, 'Scanner QR Code', 'Scanné depuis fichier', 'success')
          const params = new URLSearchParams({
            data: code.data,
            url: imageUrl,
            type: 'image'
          })
          router.push(`/qr/result?${params.toString()}`)
        } else {
          setError("Aucun code QR détecté dans cette image. Assurez-vous d'importer une photo de bonne qualité.")
          saveToHistory(file.name, 'Scanner QR Code', 'Échec scan (Aucun QR)', 'error')
        }
      } catch (e) {
        setError('Erreur lors de la lecture du code.')
        saveToHistory(file.name, 'Scanner QR Code', 'Erreur de scan', 'error')
      }
    }
    img.onerror = () => {
      setError("Impossible d'importer l'image de code QR.")
    }
    img.src = imageUrl
  }

  const ext = file?.name.split('.').pop()?.toUpperCase() || ''

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
            ← Accueil
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
            QR Code
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Scanner un QR Code
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Lisez instantanément les données en local via votre appareil photo ou un fichier.
          </p>
        </div>

        {!useCamera ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setUseCamera(true)}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10"
            >
              📷 Utiliser l'appareil photo/caméra
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="px-2 text-gray-500 bg-transparent">ou</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setError('')
                }}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-500/15 file:text-teal-600 file:cursor-pointer hover:file:bg-teal-500/25"
              />

              {file && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-500/5 border border-gray-200/10">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 font-bold text-[10px]">
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
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-200/10 bg-black">
              <video 
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay 
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                {/* Focusing box element overlay */}
                <div className="w-40 h-40 border-2 border-dashed border-white rounded-xl"></div>
              </div>
            </div>
            
            <button
              onClick={() => setUseCamera(false)}
              className="py-2.5 px-4 bg-gray-500/15 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-500/25 duration-150 cursor-pointer"
            >
              Fermer la caméra
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <p className="text-red-500 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl leading-relaxed">
            ⚠️ {error}
          </p>
        )}

        {!useCamera && (
          <button
            onClick={handleFileUpload}
            disabled={!file}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-95 shadow-md shadow-teal-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer bg-teal-600"
          >
            Décoder le QR Code
          </button>
        )}
      </div>
    </div>
  )
}