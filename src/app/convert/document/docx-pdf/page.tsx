'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DocxToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) return
    
    setConverting(true)
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const mammoth = await import('mammoth')
      
      const result = await mammoth.convertToHtml({ arrayBuffer })
      
      if (result.messages.length > 0) {
        console.warn('Conversion warnings:', result.messages)
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>${result.value}</body>
        </html>
      `

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const newWindow = window.open(url, '_blank')
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print()
          URL.revokeObjectURL(url)
        }
      }
      
    } catch (err) {
      setError('Erreur lors de la conversion DOCX')
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
          DOCX vers PDF
        </h1>

        <input
          type="file"
          accept=".docx"
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
          {converting ? 'Conversion...' : 'Convertir (ouvre print)'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          DOCX converti en HTML puis utilisez "Imprimer → Enregistrer en PDF"
        </p>
      </div>
    </div>
  )
}