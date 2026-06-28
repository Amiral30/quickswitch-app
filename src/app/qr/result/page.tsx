'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function QrResult() {
  const [data, setData] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setData(params.get('data') || '')
    setImageUrl(params.get('url') || '')
  }, [])

  const isUrl = data.startsWith('http://') || data.startsWith('https://')
  const isWifi = data.startsWith('WIFI:')
  const isVCard = data.startsWith('BEGIN:VCARD')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data)
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/qr/scan" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Résultat du Scan
        </h1>

        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="QR scanné"
            className="w-full h-64 object-contain mb-4 rounded"
          />
        )}

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <label className="text-xs text-gray-500">Contenu :</label>
          <p className="text-sm font-mono break-all mt-1">{data}</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={copyToClipboard}
            className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Copier le contenu
          </button>

          {isUrl && (
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-3 bg-green-600 text-white text-center rounded hover:bg-green-700 transition"
            >
              🔗 Ouvrir le lien
            </a>
          )}

          {isWifi && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              Réseau WiFi détecté - Connectez-vous manuellement
            </p>
          )}

          {isVCard && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              Contact vCard - Ajoutez à votre carnet d'adresses
            </p>
          )}
        </div>
      </div>
    </div>
  )
}