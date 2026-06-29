'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import Link from 'next/link'

export default function ImageToPdf() {
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
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        })
        
        const format = file.name.endsWith('.png') ? 'PNG' : 'JPEG'
        pdf.addImage(imageUrl, format, 0, 0, img.width, img.height)
        pdf.save(file.name.replace(/\.[^.]+$/, '.pdf'))
        URL.revokeObjectURL(imageUrl)
      }
      img.src = imageUrl
    } catch (err) {
      setError('Erreur lors de la conversion')
      console.error(err)
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/convert" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Convertisseur Image en PDF
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        {file && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Fichier: {file.name}
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
          {converting ? 'Conversion...' : 'Convertir en PDF'}
        </button>
      </div>
    </div>
  )
}