'use client'

import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'
import Link from 'next/link'

export default function QrScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!useCamera) return
    
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    }).then(stream => {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          startScanning()
        }
      }
    }).catch(err => {
      setError('Caméra non accessible: ' + err.message)
      setUseCamera(false)
    })

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [useCamera])

  const startScanning = () => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current) return
      
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (video.videoWidth === 0) {
        animationRef.current = requestAnimationFrame(scan)
        return
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          setResult(code.data)
          return
        }
      } catch (e) {
        console.error('Scan error:', e)
      }

      if (!result) {
        animationRef.current = requestAnimationFrame(scan)
      }
    }
    
    scan()
  }

  const handleFileUpload = () => {
    if (!file) return
    
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
          setResult(code.data)
        } else {
          setError('Aucun QR code trouvé dans l\'image')
        }
      } catch (e) {
        setError('Erreur de lecture: ' + (e as Error).message)
      }
      
      URL.revokeObjectURL(imageUrl)
    }
    img.src = imageUrl
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Scanner QR Code
        </h1>

        {!useCamera ? (
          <div className="space-y-3 mb-4">
            <button
              onClick={() => setUseCamera(true)}
              className="w-full py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              📷 Utiliser la caméra
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
        ) : (
          <div className="mb-4">
            <video 
              ref={videoRef} 
              className="w-full rounded-lg"
              autoPlay 
              playsInline
              muted
            />
            <p className="text-xs text-center mt-2 text-gray-500">
              Pointez un QR code à l'écran
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <label className="text-xs text-gray-500">Résultat :</label>
            <p className="text-sm font-mono break-all">{result}</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </p>
        )}

        {!useCamera && (
          <button
            onClick={handleFileUpload}
            disabled={!file}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
          >
            Scanner depuis fichier
          </button>
        )}
      </div>
    </div>
  )
}