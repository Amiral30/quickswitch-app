'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CompressImage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [compressing, setCompressing] = useState(false)

  const handleCompress = async () => {
    if (!file) return
    
    setCompressing(true)
    
    const canvas = document.createElement('canvas')
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.src = url
    await new Promise(resolve => img.onload = resolve)
    
    const ctx = canvas.getContext('2d')!
    canvas.width = img.width
    canvas.height = img.height
    
    ctx.drawImage(img, 0, 0)
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = file.name
          a.click()
        }
        setCompressing(false)
      },
      'image/jpeg',
      quality
    )
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Compresser Image JPG/PNG
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        {file && (
          <div className="mb-4">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Qualité: {(quality * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={!file || compressing}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {compressing ? 'Compression...' : 'Compresser'}
        </button>
      </div>
    </div>
  )
}