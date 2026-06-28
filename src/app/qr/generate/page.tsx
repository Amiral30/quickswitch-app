'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'

export default function QrGenerator() {
  const [text, setText] = useState('')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [size, setSize] = useState(256)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Générateur QR Code
        </h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Entrez votre texte, URL, etc."
          className="w-full h-24 p-3 border rounded-lg mb-4 resize-none dark:bg-gray-700 dark:text-white"
        />

        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500">Couleur</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fond</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </div>

{text && (
           <div className="flex justify-center mb-4">
             <QRCodeCanvas
               value={text}
               size={size}
               fgColor={fgColor}
               bgColor={bgColor}
             />
           </div>
         )}

        <button
          onClick={() => {
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              const url = canvas.toDataURL('image/png')
              const a = document.createElement('a')
              a.href = url
              a.download = 'qrcode.png'
              a.click()
            }
          }}
          disabled={!text}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          Télécharger PNG
        </button>
      </div>
    </div>
  )
}