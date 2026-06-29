import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="e-swiftools" width={40} height={40} />
            <span className="text-xl font-bold text-primary">e-swiftools</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/convert" className="text-gray-600 hover:text-primary">Convertir</Link>
            <Link href="/compress/image" className="text-gray-600 hover:text-primary">Compresser</Link>
            <Link href="/qr/generate" className="text-gray-600 hover:text-primary">QR Code</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Convertissez vos fichiers en 1 clic
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Outils gratuits pour convertir, compresser et générer des QR codes. 100% sécurisé, rien n'est uploadé sur nos serveurs.
        </p>

        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/convert" className="group">
            <div className="glass dark:glass-dark p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Convertisseur</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">MP3, MP4, JPG, DOCX...</p>
            </div>
          </Link>

          <Link href="/compress/image">
            <div className="glass dark:glass-dark p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🗜️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Compresseur</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Réduisez la taille de vos images</p>
            </div>
          </Link>

          <Link href="/qr/generate">
            <div className="glass dark:glass-dark p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🔳</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">QR Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Générez et scannez des QR codes</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Fonctionnalités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold">Conversion rapide</h4>
              <p className="text-sm text-gray-500">En quelques secondes</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-semibold">100% sécurisé</h4>
              <p className="text-sm text-gray-500">Traitement local</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold">QR personnalisé</h4>
              <p className="text-sm text-gray-500">Couleurs et styles</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold">Mobile friendly</h4>
              <p className="text-sm text-gray-500">Responsive design</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2026 e-swiftools. Tous droits réservés.
      </footer>
    </div>
  );
}