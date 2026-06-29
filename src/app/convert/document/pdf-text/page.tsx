'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) return
    
    setConverting(true)
    setError('')

    try {
      const pdfjsLib = await import('pdfjs-dist')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n\n'
      }
      
      setText(fullText)
    } catch (err) {
      setError('Erreur lors de la conversion PDF')
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
          PDF vers Texte
        </h1>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        {text && (
          <div className="mb-4">
            <textarea
              value={text}
              readOnly
              className="w-full h-48 p-3 border rounded resize-none dark:bg-gray-700 dark:text-white text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(text)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Copier le texte
            </button>
          </div>
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
          {converting ? 'Conversion...' : 'Extraire le texte'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Maximum 10 pages. Copiez le texte dans Word.
        </p>
      </div>
    </div>
  )
}