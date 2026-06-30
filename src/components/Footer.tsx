'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuota } from '@/hooks/useQuota'

const tools = [
  { label: 'Générateur de mot de passe', href: '/password' },
  { label: 'Convertisseur de fichiers', href: '/convert' },
  { label: 'Compresseur d\'images', href: '/compress/image' },
  { label: 'Compresseur vidéo', href: '/compress/video' },
  { label: 'Créer un QR Code', href: '/qr/generate' },
  { label: 'Scanner un QR Code', href: '/qr/scan' },
]

const legal = [
  { label: 'Politique de confidentialité', href: '/legal/privacy' },
  { label: 'Conditions d\'utilisation', href: '/legal/terms' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { tier } = useQuota()

  return (
    <footer className="relative z-10 w-full mt-8 md:mt-12 border-t border-gray-200 dark:border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">

          {/* Col 1 — Branding */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <Image
              src="/logo.png"
              alt="e-swiftools"
              width={300}
              height={84}
              className="w-56 sm:w-72 h-auto object-contain dark:hidden -mt-8 -mb-4 -ml-4"
            />
            <Image
              src="/nlogo.png"
              alt="e-swiftools"
              width={300}
              height={84}
              className="w-56 sm:w-72 h-auto object-contain hidden dark:block -mt-8 -mb-4 -ml-4"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[250px]">
              Vos fichiers. Vos données. 100% en local.
              Aucun fichier ne quitte votre appareil.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full w-fit">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Conforme RGPD
            </div>
          </div>

          {/* Col 2 — Outils */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Outils Gratuits
            </h4>
            <ul className="flex flex-col gap-2.5">
              {tools.map(t => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors" />
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Légal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Informations légales
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legal.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  © {year} E-Swiftools
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4 — Pro / CTA */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              {tier === 'PRO' ? (
                <span className="text-amber-500">Membre Pro</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Passer à Pro</span>
              )}
            </h4>
            
            {tier === 'PRO' ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col gap-3">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                  Merci pour votre soutien ! Vous profitez d'une expérience illimitée et sans publicité.
                </p>
                <div className="text-xs font-bold text-center py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Statut Premium Actif
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex flex-col gap-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Conversion par lot, fichiers jusqu'à 4 Go, QR Code sans watermark.
                </p>
                <Link
                  href="/#pricing"
                  className="text-xs font-bold text-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20"
                >
                  ⚡ Upgrade — 2,99€/mois
                </Link>
              </div>
            )}
            
            <p className="text-[10px] text-gray-400 dark:text-gray-600 leading-relaxed">
              Vos fichiers restent sur votre appareil. Nous ne stockons, n'analysons ni ne transmettons aucune donnée.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-gray-600">
          <span>© {year} E-Swiftools — Tous droits réservés.</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Traitement 100% local · Aucune donnée envoyée · Zéro tracking
          </span>
        </div>
      </div>
    </footer>
  )
}
