'use client'

import { useState, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import Link from 'next/link'

export default function FfmpegConverter({ searchParams }: { 
  searchParams: Promise<{ from?: string; to?: string }> 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('mp4')
  const [to, setTo] = useState('mp3')
  
  useEffect(() => {
    searchParams.then(params => {
      if (params.from) setFrom(params.from)
      if (params.to) setTo(params.to)
    })
  }, [searchParams])

  const handleConvert = async () => {
    if (!file) return
    
    setConverting(true)
    setError('')

    try {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load()
      
      const inputName = 'input.' + from
      const outputName = `output.${to}`
      
      const fileData = await fetchFile(file)
      await ffmpeg.writeFile(inputName, fileData)
      
      await ffmpeg.exec(['-i', inputName, outputName])
      
      const data = await ffmpeg.readFile(outputName)
      const uint8 = typeof data === 'string' 
        ? new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
        : new Uint8Array(data)
      const blob = new Blob([uint8], { type: `audio/${to}` })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(new RegExp(`\\.[^.]+$`), `.${to}`)
      a.click()
      
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
           Convertisseur {from.toUpperCase()} en {to.toUpperCase()}
         </h1>

        <input
          type="file"
          accept="video/*"
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