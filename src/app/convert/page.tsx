import Link from "next/link";

const converters = {
  video: [
    { from: 'mp4', to: 'mp3', label: 'MP4 en MP3', icon: '🎵', accept: 'video/*' },
    { from: 'mov', to: 'mp4', label: 'MOV en MP4', icon: '🎬', accept: 'video/*' },
    { from: 'avi', to: 'mp4', label: 'AVI en MP4', icon: '🎞️', accept: 'video/*' },
    { from: 'mkv', to: 'mp4', label: 'MKV en MP4', icon: '📽️', accept: 'video/*' },
    { from: 'webm', to: 'mp4', label: 'WebM en MP4', icon: '🌐', accept: 'video/*' },
  ],
  image: [
    { from: 'png', to: 'jpg', label: 'PNG en JPG', icon: '🖼️', accept: 'image/png' },
    { from: 'jpg', to: 'png', label: 'JPG en PNG', icon: '📷', accept: 'image/jpeg' },
    { from: 'webp', to: 'jpg', label: 'WebP en JPG', icon: '🌈', accept: 'image/webp' },
    { from: 'svg', to: 'png', label: 'SVG en PNG', icon: '🎨', accept: 'image/svg+xml' },
    { from: 'img', to: 'pdf', label: 'Image en PDF', icon: '📄', accept: 'image/*' },
  ],
  document: [
    { from: 'docx', to: 'pdf', label: 'DOCX en PDF', icon: '📘', accept: '.docx,.doc' },
    { from: 'pdf', to: 'txt', label: 'PDF en TXT', icon: '📝', accept: 'application/pdf' },
  ]
}

export default function ConvertHub() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 mb-6 inline-block">
          ← Retour à l'accueil
        </Link>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          Convertisseur de Fichiers
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>🎬</span> Vidéo
            </h2>
            <div className="space-y-3">
              {converters.video.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/ffmpeg?from=${conv.from}&to=${conv.to}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-2xl">{conv.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{conv.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>🖼️</span> Image
            </h2>
            <div className="space-y-3">
              {converters.image.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/image/${conv.from}-${conv.to}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-2xl">{conv.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{conv.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>📄</span> Document
            </h2>
            <div className="space-y-3">
              {converters.document.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/document/${conv.from}-${conv.to}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-2xl">{conv.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{conv.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}