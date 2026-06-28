'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'

type QrType = 'text' | 'url' | 'email' | 'wifi' | 'vcard'

export default function QrGenerator() {
  const [qrType, setQrType] = useState<QrType>('text')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [size, setSize] = useState(256)

  // Form states
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [wifiName, setWifiName] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiHidden, setWifiHidden] = useState(false)
  const [vcardName, setVcardName] = useState('')
  const [vcardPhone, setVcardPhone] = useState('')
  const [vcardEmail, setVcardEmail] = useState('')

  const getQrValue = () => {
    switch (qrType) {
      case 'text': return text
      case 'url': return url
      case 'email': return `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      case 'wifi': return `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`
      default: return ''
    }
  }

  const renderForm = () => {
    switch (qrType) {
      case 'text':
        return (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Entrez votre texte..."
            className="w-full h-24 p-3 border rounded-lg mb-4 resize-none dark:bg-gray-700 dark:text-white"
          />
        )
      case 'url':
        return (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com"
            className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
          />
        )
      case 'email':
        return (
          <div className="space-y-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Sujet"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Message"
              className="w-full h-20 p-3 border rounded-lg resize-none dark:bg-gray-700 dark:text-white"
            />
          </div>
        )
      case 'wifi':
        return (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={wifiName}
              onChange={(e) => setWifiName(e.target.value)}
              placeholder="Nom du réseau WiFi"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="password"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden(e.target.checked)}
              />
              Réseau caché
            </label>
          </div>
        )
      case 'vcard':
        return (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={vcardName}
              onChange={(e) => setVcardName(e.target.value)}
              placeholder="Nom complet"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="tel"
              value={vcardPhone}
              onChange={(e) => setVcardPhone(e.target.value)}
              placeholder="Téléphone"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              value={vcardEmail}
              onChange={(e) => setVcardEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        )
      default:
        return null
    }
  }

  const qrValue = getQrValue()

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Générateur QR Code
        </h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['text', 'url', 'email', 'wifi', 'vcard'] as QrType[]).map((type) => (
            <button
              key={type}
              onClick={() => setQrType(type)}
              className={`px-3 py-1 text-sm rounded ${
                qrType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {type === 'text' ? 'Texte' : 
               type === 'url' ? 'Lien' :
               type === 'email' ? 'Email' :
               type === 'wifi' ? 'WiFi' : 'vCard'}
            </button>
          ))}
        </div>

        {renderForm()}

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

        {qrValue && (
          <div className="flex justify-center mb-4">
            <QRCodeCanvas
              value={qrValue}
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
          disabled={!qrValue}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
        >
          Télécharger PNG
        </button>
      </div>
    </div>
  )
}