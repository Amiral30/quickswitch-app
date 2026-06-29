'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { saveToHistory } from '@/lib/history'
import Link from 'next/link'

type QrType = 'text' | 'url' | 'email' | 'wifi' | 'vcard'

export default function QrGenerator() {
  const [qrType, setQrType] = useState<QrType>('text')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [size] = useState(256)

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
    const inputStyle = "w-full p-3.5 bg-gray-500/5 border border-gray-200/10 rounded-xl text-sm font-semibold tracking-wide focus:outline-none focus:border-purple-500/80 transition-colors"
    
    switch (qrType) {
      case 'text':
        return (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Entrez votre texte..."
            className="w-full h-28 p-3.5 bg-gray-500/5 border border-gray-200/10 rounded-xl text-sm font-semibold tracking-wide focus:outline-none focus:border-purple-500/80 transition-colors resize-none"
          />
        )
      case 'url':
        return (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com"
            className={inputStyle}
          />
        )
      case 'email':
        return (
          <div className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className={inputStyle}
            />
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Sujet du email (optionnel)"
              className={inputStyle}
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Corps du message (optionnel)"
              className="w-full h-24 p-3.5 bg-gray-500/5 border border-gray-200/10 rounded-xl text-sm font-semibold tracking-wide focus:outline-none focus:border-purple-500/80 transition-colors resize-none"
            />
          </div>
        )
      case 'wifi':
        return (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={wifiName}
              onChange={(e) => setWifiName(e.target.value)}
              placeholder="Nom du réseau (SSID)"
              className={inputStyle}
            />
            <input
              type="password"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="Mot de passe"
              className={inputStyle}
            />
            <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-500"
              />
              Réseau masqué (caché)
            </label>
          </div>
        )
      case 'vcard':
        return (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={vcardName}
              onChange={(e) => setVcardName(e.target.value)}
              placeholder="Nom complet (ex: Jean Dupont)"
              className={inputStyle}
            />
            <input
              type="tel"
              value={vcardPhone}
              onChange={(e) => setVcardPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              className={inputStyle}
            />
            <input
              type="email"
              value={vcardEmail}
              onChange={(e) => setVcardEmail(e.target.value)}
              placeholder="Adresse email"
              className={inputStyle}
            />
          </div>
        )
      default:
        return null
    }
  }

  const qrValue = getQrValue()

  const handleDownload = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode_${qrType}.png`
      a.click()
      
      // Log successful QR Code generation
      saveToHistory(`qrcode_${qrType}.png`, 'Créer QR Code', `${qrType.toUpperCase()} ➔ QR Code`, 'success')
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-md w-full glass-premium p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-purple-500 hover:underline">
            ← Accueil
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
            QR Code
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Générateur de QR Code
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Générez des codes QR personnalisés et téléchargez-les instantanément.
          </p>
        </div>

        {/* Tab selection grid */}
        <div className="grid grid-cols-5 p-1 bg-gray-500/5 rounded-xl border border-gray-250/10">
          {(['text', 'url', 'email', 'wifi', 'vcard'] as QrType[]).map((type) => (
            <button
              key={type}
              onClick={() => setQrType(type)}
              className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                qrType === type
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {type === 'text' ? 'Texte' : 
               type === 'url' ? 'Lien' :
               type === 'email' ? 'Email' :
               type === 'wifi' ? 'WiFi' : 'vCard'}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {renderForm()}
        </div>

        {/* Color customizers */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-500/5 border border-gray-200/10">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Couleur du QR</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer overflow-hidden outline-none bg-transparent"
              />
              <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">{fgColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Couleur du fond</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer overflow-hidden outline-none bg-transparent"
              />
              <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        {qrValue && (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner border border-gray-200/20 max-w-[280px] mx-auto w-full">
            <QRCodeCanvas
              value={qrValue}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              className="max-w-[200px] max-h-[200px]"
            />
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider mt-4 uppercase">
              Aperçu en direct
            </span>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!qrValue}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-650 to-pink-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-95 shadow-md shadow-purple-500/10 hover:scale-[1.01] duration-150 flex items-center justify-center gap-2 cursor-pointer bg-purple-600"
        >
          Télécharger le Code QR
        </button>
      </div>
    </div>
  )
}