'use client'

import { useState, useRef } from 'react'

interface FileDropzoneProps {
  accept?: string
  onFileSelected: (file: File) => void
  title?: string
  description?: string
  colorTheme?: 'blue' | 'orange' | 'pink' | 'red' | 'indigo'
  multiple?: boolean
}

export default function FileDropzone({
  accept,
  onFileSelected,
  title = "Glissez-déposez votre fichier ici",
  description = "ou cliquez pour parcourir vos dossiers",
  colorTheme = 'blue',
  multiple = false,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const themeStyles = {
    blue: {
      bgActive: 'bg-blue-500/5 dark:bg-blue-500/10',
      borderActive: 'border-blue-500 dark:border-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
      buttonBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
      glow: 'shadow-blue-500/10 dark:shadow-blue-400/20',
      strokeColor: '#3b82f6',
    },
    orange: {
      bgActive: 'bg-orange-500/5 dark:bg-orange-500/10',
      borderActive: 'border-orange-500 dark:border-orange-400',
      iconBg: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400',
      buttonBg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 hover:bg-orange-500/20 dark:hover:bg-orange-500/30',
      glow: 'shadow-orange-500/10 dark:shadow-orange-400/20',
      strokeColor: '#f97316',
    },
    pink: {
      bgActive: 'bg-pink-500/5 dark:bg-pink-500/10',
      borderActive: 'border-pink-500 dark:border-pink-400',
      iconBg: 'bg-pink-500/10 text-pink-500 dark:bg-pink-500/20 dark:text-pink-400',
      buttonBg: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 hover:bg-pink-500/20 dark:hover:bg-pink-500/30',
      glow: 'shadow-pink-500/10 dark:shadow-pink-400/20',
      strokeColor: '#ec4899',
    },
    red: {
      bgActive: 'bg-red-500/5 dark:bg-red-500/10',
      borderActive: 'border-red-500 dark:border-red-400',
      iconBg: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400',
      buttonBg: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30',
      glow: 'shadow-red-500/10 dark:shadow-red-400/20',
      strokeColor: '#ef4444',
    },
    indigo: {
      bgActive: 'bg-indigo-500/5 dark:bg-indigo-500/10',
      borderActive: 'border-indigo-500 dark:border-indigo-400',
      iconBg: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400',
      buttonBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30',
      glow: 'shadow-indigo-500/10 dark:shadow-indigo-400/20',
      strokeColor: '#6366f1',
    },
  }

  const activeTheme = themeStyles[colorTheme]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0])
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0])
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full min-h-[220px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10
        flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all duration-300 group
        hover:border-transparent hover:shadow-lg ${activeTheme.glow}
        ${dragActive ? `border-transparent ${activeTheme.bgActive} scale-[1.01]` : 'bg-transparent hover:bg-gray-500/5'}`}
    >
      {/* Animated SVG Border on Dragover */}
      {dragActive && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="14"
            fill="none"
            stroke={activeTheme.strokeColor}
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-dash-rotate"
          />
        </svg>
      )}

      {/* SVG Border on Hover */}
      {!dragActive && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="14"
            fill="none"
            stroke={activeTheme.strokeColor}
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        </svg>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        {/* Upload Icon with micro-animation */}
        <div className={`w-14 h-14 rounded-2xl ${activeTheme.iconBg} flex items-center justify-center transition-all duration-300 
          group-hover:scale-110 shadow-sm border border-transparent dark:border-white/5`}>
          <svg
            className="w-7 h-7 transform transition-transform duration-300 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-black text-gray-800 dark:text-gray-200">
            {title}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick();
          }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-200 ${activeTheme.buttonBg}`}
        >
          Parcourir les fichiers
        </button>
      </div>
    </div>
  )
}
