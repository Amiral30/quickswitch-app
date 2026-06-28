'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function DocumentConverter({ searchParams }: { 
  searchParams: Promise<{ from?: string; to?: string }> 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('pdf')
  const [to, setTo] = useState('jpg')
  
  const handleConvert = async () => {
    if (!file) return
    
    setConverting(true)
    setError('')

    try {
      if (from === 'docx' && to === 'pdf') {
        const arrayBuffer = await file.arrayBuffer()
        const mammoth = await import('mammoth')
        
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial;margin:20px}img{max-width:100%}</style></head><body>${result.value}</body></html>`
        
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const newWindow = window.open(url, '_blank')
        if (newWindow) {
          setTimeout(() => newWindow.print(), 1000)
        }
      } else if (from === 'pdf' && to === 'jpg') {
        // PDF vers JPG via canvas - nécessite pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist')
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const page = await pdf.getPage(1)
        
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvas: canvas,
          canvasContext: ctx,
          viewport: viewport
        }).promise
        
        canvas.toBlob(blob => {
          if (blob) {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = file.name.replace('.pdf', '.jpg')
            a.click()
          }
        }, 'image/jpeg', 0.95)
      }
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
          {from.toUpperCase()} vers {to.toUpperCase()}
        </h1>

        <input
          type="file"
          accept={from === 'docx' ? '.docx' : 'application/pdf'}
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
          {converting ? 'Conversion...' : 'Convertir'}
        </button>
      </div>
    </div>
  )
}