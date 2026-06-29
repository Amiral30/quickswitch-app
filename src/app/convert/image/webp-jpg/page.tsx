'use client'

import { useState } from 'react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'

export default function WebpToJpg() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) return
    
    setConverting(true)
    setError('')

    try {
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = img.width
            canvas.height = img.height
            // Set white background for transparent WebPs
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            
            canvas.toBlob(blob => {
              if (blob) {
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = file.name.replace(/\.[^.]+$/, '.jpg')
                a.click()
                resolve()
              } else {
                reject(new Error("La compression Canvas en JPG a échoué."))
              }
            }, 'image/jpeg', 0.95)
          } catch (e) {
            reject(e)
          }
        }
        img.onerror = () => reject(new Error("Impossible de charger l'image WebP."))
        img.src = imageUrl
      })

      saveToHistory(file.name, 'Convertisseur', 'WEBP ➔ JPG', 'success')
    } catch (err) {
      setError('Erreur lors de la conversion. Veuillez réutiliser un autre fichier.')
      console.error(err)
      saveToHistory(file.name, 'Convertisseur', 'WEBP ➔ JPG', 'error')
    } finally {
      setConverting(false)
    }
  }

  const ext = file?.name.split('.').pop()?.toUpperCase() || ''

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/convert" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline">
            ← Retour
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            Image
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Convertisseur WebP en JPG
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Générez des images JPG hautement compatibles à partir de vos fichiers WebP.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/webp"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setError('')
            }}
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/15 file:text-blue-500 hover:file:bg-blue-500/25 file:cursor-pointer"
          />

          {file && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-500/5 border border-gray-200/10">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500 font-bold text-[10px]">
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

        <button
          onClick={handleConvert}
          disabled={!file || converting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-95 shadow-md shadow-blue-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          {converting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Conversion...
            </>
          ) : 'Convertir en JPG'}
        </button>

        {error && (
          <p className="text-red-500 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl leading-relaxed">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  )
}