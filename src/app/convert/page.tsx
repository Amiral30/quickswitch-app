import Link from "next/link";

const converters = {
  video: [
    { from: 'mp4', to: 'mp3', label: 'MP4 vers MP3', accept: 'video/*' },
    { from: 'mov', to: 'mp4', label: 'MOV vers MP4', accept: 'video/*' },
    { from: 'avi', to: 'mp4', label: 'AVI vers MP4', accept: 'video/*' },
  ],
  image: [
    { from: 'png', to: 'jpg', label: 'PNG vers JPG', accept: 'image/png' },
    { from: 'jpg', to: 'png', label: 'JPG vers PNG', accept: 'image/jpeg' },
    { from: 'webp', to: 'jpg', label: 'WebP vers JPG', accept: 'image/webp' },
  ],
  document: [
    { from: 'pdf', to: 'jpg', label: 'PDF vers JPG', accept: 'application/pdf' },
    { from: 'docx', to: 'pdf', label: 'DOCX vers PDF', accept: '.docx' },
  ]
}

export default function ConvertHub() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen px-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Retour
        </Link>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Convertisseur de Fichiers
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🎬 Vidéo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {converters.video.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/ffmpeg?from=${conv.from}&to=${conv.to}`}
                  className="p-2 text-sm text-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {conv.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🖼️ Image
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {converters.image.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/image/${conv.from}-${conv.to}`}
                  className="p-2 text-sm text-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {conv.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              📄 Document
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {converters.document.map(conv => (
                <Link 
                  key={`${conv.from}-${conv.to}`}
                  href={`/convert/document/${conv.from}-${conv.to}`}
                  className="p-2 text-sm text-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {conv.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-center mt-8 text-gray-500">
          Toutes les conversions se font localement sur votre appareil
        </p>
      </div>
    </div>
  )
}