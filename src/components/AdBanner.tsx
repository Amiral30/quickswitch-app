/**
 * AdBanner — Espace publicitaire réutilisable
 * Remplacez les commentaires par votre script Google AdSense
 * ou votre code de réseau publicitaire (ex: Ezoic, Mediavine, etc.)
 */

interface AdBannerProps {
  slot?: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
  className?: string
}

export default function AdBanner({ format = 'horizontal', className = '' }: AdBannerProps) {
  const sizes: Record<string, { label: string; h: string }> = {
    horizontal: { label: '728×90 — Leaderboard', h: 'h-[90px]' },
    rectangle:  { label: '300×250 — Medium Rectangle', h: 'h-[250px]' },
    vertical:   { label: '160×600 — Wide Skyscraper', h: 'h-[600px]' },
  }

  const { label, h } = sizes[format]

  return (
    <div
      className={`w-full ${h} rounded-xl border border-dashed border-gray-300 dark:border-white/10
        bg-gray-50 dark:bg-white/3 flex flex-col items-center justify-center gap-2
        text-gray-400 dark:text-gray-600 select-none overflow-hidden ${className}`}
      aria-label="Espace publicitaire"
    >
      {/* ── Remplacez ce bloc par votre balise AdSense ─────────────────────
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-XXXXXXXX"
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          ──────────────────────────────────────────────────────────────── */}
      <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
      <span className="text-[11px] font-mono opacity-50">{label}</span>
      <span className="text-[10px] opacity-30">Publicité</span>
    </div>
  )
}
