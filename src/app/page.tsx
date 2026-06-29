import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen px-4">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="e-swiftools"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            e-swiftools
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Convertissez, compressez et générez des QR codes gratuitement
          </p>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-8 max-w-3xl mx-auto mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            100% sécurisé - Rien n'est uploadé sur nos serveurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Link href="/convert" className="group">
            <div className="glass dark:glass-dark p-8 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Convertisseur
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Audio, Vidéo, Image, Document
              </p>
            </div>
          </Link>

          <Link href="/compress/image" className="group">
            <div className="glass dark:glass-dark p-8 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all">
              <div className="text-3xl mb-3">🗜️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Compresseur
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG, PDF
              </p>
            </div>
          </Link>

          <Link href="/qr/generate" className="group">
            <div className="glass dark:glass-dark p-8 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all">
              <div className="text-3xl mb-3">🔳</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                QR Générateur
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Texte, URL, WiFi, vCard
              </p>
            </div>
          </Link>

          <Link href="/qr/scan" className="group">
            <div className="glass dark:glass-dark p-8 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all">
              <div className="text-3xl mb-3">📷</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                QR Scanner
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lire un QR code
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}