'use client'

import { useState, useRef } from 'react'
import { loadFFmpeg, convertVideoToAudio } from '@/lib/ffmpeg'
import { canUseFree, incrementUsage } from '@/lib/fingerprint'
import Link from 'next/link'

export default function Mp4Mp3Converter() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = async () => {
    if (!file) return
    
    if (!canUseFree()) {
      setError('Limite gratuite atteinte (10 conversions/j). Créez un compte gratuit pour en avoir plus.')
      return
    }

    setConverting(true)
    setProgress(0)
    setError('')

    try {
      const ffmpeg = await loadFFmpeg()
      
      const blob = await convertVideoToAudio(ffmpeg, file, 'mp3')
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^/.]+$/, '.mp3')
      a.click()
      
      incrementUsage()
      setProgress(100)
    } catch (err) {
      setError('Erreur lors de la conversion. Réessayez ou fichier trop lourd (>50Mo).')
      console.error(err)
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          MP4 vers MP3
        </h1>

        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        {file && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Fichier: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </p>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || converting}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {converting ? `Conversion... ${progress}%` : 'Convertir'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Max 50Mo pour le gratuit. Traitement 100% local.
        </p>
      </div>
    </div>
  )
}