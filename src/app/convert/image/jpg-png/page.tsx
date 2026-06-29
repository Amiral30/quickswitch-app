'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function JpgToPng() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)

  const handleConvert = () => {
    if (!file) return
    
    setConverting(true)
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(blob => {
        if (blob) {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = file.name.replace(/\.[^.]+$/, '.png')
          a.click()
        }
        setConverting(false)
      }, 'image/png')
    }
    img.src = imageUrl
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/convert" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Convertisseur JPG en PNG
        </h1>

        <input
          type="file"
          accept="image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        <button
          onClick={handleConvert}
          disabled={!file || converting}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {converting ? 'Conversion...' : 'Convertir'}
        </button>
      </div>
    </div>
  )
}