'use client'

import { useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import Link from 'next/link'

const OUTPUT_FORMATS: Record<string, string[]> = {
  video: ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi'],
  image: ['jpg', 'png', 'webp', 'gif', 'pdf'],
  document: ['pdf', 'txt', 'docx']
}

function getCategory(filename: string): keyof typeof OUTPUT_FORMATS | null {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image'
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
  return null
}

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [outputFormat, setOutputFormat] = useState('')
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    const category = getCategory(selectedFile.name)
    if (category) setStep(2)
  }

  const handleConvert = async () => {
    if (!file || !outputFormat) return
    
    setConverting(true)
    setError('')

    try {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load()
      
      const ext = file.name.split('.').pop() || 'mp4'
      const inputName = `input.${ext}`
      const outputName = `output.${outputFormat}`
      
      const fileData = await fetchFile(file)
      await ffmpeg.writeFile(inputName, fileData)
      
      await ffmpeg.exec(['-i', inputName, outputName])
      
      const data = await ffmpeg.readFile(outputName)
      const uint8 = typeof data === 'string' 
        ? new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
        : new Uint8Array(data)
      
      const mimeType = outputFormat === 'mp3' ? 'audio/mp3' : 
                       outputFormat === 'jpg' ? 'image/jpeg' : 
                       outputFormat === 'png' ? 'image/png' : 
                       `video/${outputFormat}`
      
      const blob = new Blob([uint8], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^.]+$/, `.${outputFormat}`)
      a.click()
      
    } catch (err) {
      setError('Erreur lors de la conversion')
      console.error(err)
    } finally {
      setConverting(false)
    }
  }

  const category = file ? getCategory(file.name) : null
  const inputExt = file?.name.split('.').pop()?.toLowerCase() || ''
  const outputFormats = category ? OUTPUT_FORMATS[category].filter(fmt => fmt !== inputExt) : []

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Convertisseur de Fichiers
        </h1>

        {step === 1 && (
          <div>
            <input
              type="file"
              onChange={handleUpload}
              className="w-full p-4 border-2 border-dashed rounded-lg dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 mt-4">
              Formats supportés : MP4, MOV, AVI, PNG, JPG, WebP, PDF, DOCX
            </p>
          </div>
        )}

        {step === 2 && file && (
          <div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Fichier : {file.name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Format de sortie</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700"
              >
                <option value="">Sélectionner un format</option>
                {outputFormats.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleConvert}
              disabled={!outputFormat || converting}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
            >
              {converting ? 'Conversion...' : 'Convertir'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}