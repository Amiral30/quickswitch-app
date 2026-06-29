import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          e-swiftools
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Convertissez, compressez et générez des QR codes gratuitement
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
          100% sécurisé - Rien n'est uploadé sur nos serveurs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Link href="/convert" className="group">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Convertisseur de Fichiers
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vidéo, Image, Document
              </p>
            </div>
          </Link>

          <Link href="/compress/image" className="group">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🗜️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Compresseur Fichiers
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG, PDF, MP4
              </p>
            </div>
          </Link>

          <Link href="/qr/generate" className="group">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🔳</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Générateur QR Code
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Texte, URL, WiFi, vCard
              </p>
            </div>
          </Link>

          <Link href="/qr/scan" className="group">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">📷</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Scanner QR Code
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lire un QR depuis une image
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}