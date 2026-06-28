'use client'

import { useState, useRef } from 'react'
import jsQR from 'jsqr'
import Link from 'next/link'

export default function QrScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleScan = async () => {
    if (!file) return
    
    setError('')
    setResult('')
    
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        setResult(code.data)
      } else {
        setError('Aucun QR code trouvé dans l\'image')
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

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

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

        <button
          onClick={handleScan}
          disabled={!file}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          Scanner
        </button>
      </div>
    </div>
  )
}