import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — E-Swiftools',
  description: 'Consultez les conditions générales d\'utilisation du service E-Swiftools. Service de traitement de fichiers 100% en local, gratuit et conforme RGPD.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-8 block">
            ← Retour à l'accueil
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
            📋 Version en vigueur depuis Juin 2025
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            En utilisant E-Swiftools, vous acceptez les présentes conditions. Prenez le temps de les lire attentivement.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-10">

          <Section title="Article 1 — Présentation du Service">
            <p>E-Swiftools est une application web de productivité disponible à l'adresse <strong>e-swiftools.fr</strong> (ou tout sous-domaine associé). Elle permet à ses utilisateurs d'effectuer gratuitement les opérations suivantes, entièrement dans leur navigateur :</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                'Conversion de fichiers vidéo, audio et image (MP4, WebM, MP3, JPG, PNG, PDF…)',
                'Compression d\'images JPEG et PNG',
                'Génération de codes QR personnalisés',
                'Décodage et lecture de codes QR par image ou caméra',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Article 2 — Accès au Service">
            <p>L'accès à E-Swiftools est <strong>gratuit</strong> et ouvert à toute personne disposant d'un navigateur web compatible (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).</p>
            <p>Des fonctionnalités avancées peuvent être accessibles via un abonnement <strong>E-Swiftools Pro</strong> (voir article 8).</p>
            <p>E-Swiftools se réserve le droit de suspendre, modifier ou interrompre tout ou partie du service à tout moment, notamment pour maintenance ou raisons techniques, sans obligation de préavis.</p>
          </Section>

          <Section title="Article 3 — Utilisation Acceptable">
            <p>L'utilisateur s'engage à utiliser E-Swiftools dans le respect des lois et réglementations en vigueur et à ne pas :</p>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {[
                'Utiliser le service pour traiter, diffuser ou stocker des contenus illégaux, offensants ou portant atteinte aux droits de tiers',
                'Tenter de contourner, altérer ou compromettre la sécurité ou les fonctionnalités du service',
                'Utiliser des outils automatisés (bots, scrapers) pour exploiter le service de manière abusive',
                'Se faire passer pour une autre personne ou entité',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-500/8 border border-red-200 dark:border-red-500/20 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Article 4 — Propriété Intellectuelle">
            <p>L'ensemble des éléments composant le service E-Swiftools (code source, design, logo, textes, marque) est la propriété exclusive d'E-Swiftools et est protégé par les lois relatives à la propriété intellectuelle.</p>
            <p>L'utilisateur reconnaît que l'utilisation du service ne lui confère aucun droit sur ces éléments.</p>
            <p>Le code source de certains modules peut s'appuyer sur des bibliothèques open-source tiers (FFmpeg.wasm, jsPDF, jsQR), chacune soumise à sa propre licence.</p>
          </Section>

          <Section title="Article 5 — Traitement des Données et Confidentialité">
            <p>E-Swiftools a été conçu selon le principe du <strong>Privacy by Design</strong>. Vos fichiers sont traités exclusivement dans votre navigateur via WebAssembly et ne sont jamais transmis à nos serveurs.</p>
            <p>Pour plus de détails sur notre gestion des données, consultez notre <Link href="/legal/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Politique de Confidentialité</Link>.</p>
          </Section>

          <Section title="Article 6 — Limitation de Responsabilité">
            <p>E-Swiftools est fourni <strong>"en l'état"</strong>, sans garantie d'aucune sorte, expresse ou implicite. En particulier :</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {[
                'Nous ne garantissons pas que le service sera ininterrompu, exempt d\'erreurs ou de virus.',
                'La qualité de la conversion des fichiers dépend des capacités de votre navigateur et de votre terminal ; nous ne garantissons pas un résultat parfait pour tous les formats.',
                'Nous déclinons toute responsabilité en cas de perte de données résultant de l\'utilisation du service.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Article 7 — Liens Hypertextes">
            <p>Le service peut contenir des liens vers des sites ou services tiers. E-Swiftools n'exerce aucun contrôle sur ces ressources externes et décline toute responsabilité quant à leur contenu ou leurs pratiques en matière de confidentialité.</p>
          </Section>

          <Section title="Article 8 — Offre Pro (Abonnement Payant)">
            <p>E-Swiftools propose une offre payante <strong>«&nbsp;Pro&nbsp;»</strong> donnant accès à des fonctionnalités étendues (traitement de fichiers lourds, conversions par lot, etc.).</p>
            <div className="mt-4 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Prix :</strong> 2,99€ / mois (TTC), sans engagement.</p>
              <p><strong>Résiliation :</strong> À tout moment, depuis votre espace personnel, avec effet à la fin de la période en cours.</p>
              <p><strong>Remboursement :</strong> Conformément à la législation européenne, un droit de rétractation de 14 jours s'applique à compter de l'activation de l'abonnement.</p>
            </div>
          </Section>

          <Section title="Article 9 — Droit Applicable et Juridiction">
            <p>Les présentes CGU sont régies par le droit français. En cas de litige relatif à leur interprétation ou exécution, les parties s'efforceront de trouver une solution amiable avant tout recours judiciaire.</p>
            <p>À défaut d'accord amiable dans un délai de 30 jours, tout litige sera porté devant les juridictions compétentes du ressort de Paris, France.</p>
          </Section>

          <Section title="Article 10 — Modification des CGU">
            <p>E-Swiftools se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par une notification sur le service. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.</p>
          </Section>

        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Une question sur nos CGU ou notre politique de confidentialité ?</p>
          <a
            href="mailto:contact@e-swiftools.fr"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ✉ contact@e-swiftools.fr
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </section>
  )
}
