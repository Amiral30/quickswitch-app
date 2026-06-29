import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — E-Swiftools',
  description: 'Découvrez comment E-Swiftools protège vos données. Traitement 100% local, aucun fichier envoyé sur nos serveurs, conformité RGPD totale.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-8 block">
            ← Retour à l'accueil
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full mb-4">
            🔒 Dernière mise à jour : Juin 2025
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Chez E-Swiftools, votre vie privée est notre priorité absolue. Cette page explique de manière transparente comment nous (ne) traitons (pas) vos données.
          </p>
        </div>

        {/* TL;DR Summary */}
        <div className="p-6 rounded-2xl bg-blue-500/8 border border-blue-500/20 mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Résumé en 3 points</h2>
          <ul className="space-y-2.5">
            {[
              'Vos fichiers ne quittent jamais votre appareil. Tout le traitement s\'effectue dans votre navigateur.',
              'Nous ne collectons aucune donnée personnelle liée à vos fichiers, documents ou contenus.',
              'Aucun cookie de suivi tiers n\'est déposé sur votre appareil sans votre consentement explicite.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-10">

          <Section title="1. Responsable du traitement">
            <p>E-Swiftools est un service en ligne édité et exploité par une entité indépendante.</p>
            <p>Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@e-swiftools.fr" className="text-blue-600 dark:text-blue-400 hover:underline">contact@e-swiftools.fr</a></p>
          </Section>

          <Section title="2. Données traitées et finalité">
            <p>E-Swiftools est une application de traitement de fichiers <strong>100% locale (client-side)</strong>. Cela signifie que :</p>
            <ul className="list-none space-y-2 mt-3">
              {[
                'Les fichiers que vous importez (images, vidéos, documents) sont traités exclusivement dans votre navigateur via WebAssembly (FFmpeg.wasm) et l\'API Canvas HTML5.',
                'Aucun de vos fichiers n\'est transmis à nos serveurs ou à des serveurs tiers.',
                'Le contenu de vos fichiers n\'est pas lisible, accessible, analysé ou stocké par E-Swiftools.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 pl-2 border-l-2 border-blue-500/30">
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. Données techniques collectées">
            <p>Comme tout service web, notre infrastructure peut collecter automatiquement certaines données techniques anonymisées lors de votre visite :</p>
            <table className="w-full text-sm mt-4 border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-gray-400">Donnée</th>
                  <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-gray-400">Finalité</th>
                  <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Conservation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[
                  ['Adresse IP (anonymisée)', 'Sécurité, prévention des abus', '30 jours'],
                  ['Type de navigateur / OS', 'Statistiques techniques', '90 jours'],
                  ['Pages consultées', 'Amélioration du service', '90 jours'],
                ].map(([d, f, c]) => (
                  <tr key={d}>
                    <td className="py-2.5 pr-4 text-gray-700 dark:text-gray-300">{d}</td>
                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{f}</td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="4. Cookies et stockage local">
            <p>E-Swiftools utilise le <strong>localStorage</strong> de votre navigateur uniquement pour enregistrer :</p>
            <ul className="mt-3 space-y-2">
              {[
                { item: 'Votre historique de conversions local', note: 'stocké uniquement sur votre appareil, jamais envoyé' },
                { item: 'Vos préférences d\'interface (thème)', note: 'stocké uniquement sur votre appareil' },
              ].map(({ item, note }) => (
                <li key={item} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  <span><strong>{item}</strong> <span className="text-gray-400 text-xs">({note})</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-4">Aucun cookie publicitaire ou traceur tiers n'est déposé sur votre terminal sans votre consentement explicite.</p>
          </Section>

          <Section title="5. Partage des données avec des tiers">
            <p>E-Swiftools <strong>ne vend, ne loue et ne partage jamais</strong> vos données personnelles avec des tiers à des fins commerciales.</p>
            <p>Les seules informations pouvant être partagées sont les données techniques anonymisées listées au point 3, uniquement avec nos prestataires d'hébergement (ex: Vercel) dans le cadre strict de l'exécution du service.</p>
          </Section>

          <Section title="6. Vos droits (RGPD)">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), vous disposez des droits suivants :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                ['Droit d\'accès', 'Obtenir une copie de vos données'],
                ['Droit de rectification', 'Corriger des informations inexactes'],
                ['Droit à l\'effacement', 'Demander la suppression de vos données'],
                ['Droit à la portabilité', 'Recevoir vos données dans un format lisible'],
                ['Droit d\'opposition', 'Vous opposer à certains traitements'],
                ['Droit à la limitation', 'Limiter l\'utilisation de vos données'],
              ].map(([title, desc]) => (
                <div key={title} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-4">Pour exercer vos droits, contactez-nous à : <a href="mailto:privacy@e-swiftools.fr" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@e-swiftools.fr</a></p>
          </Section>

          <Section title="7. Sécurité">
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger votre accès au service. Cependant, étant donné que toute donnée sensible reste sur votre appareil, la surface d'exposition est naturellement minimale.</p>
          </Section>

          <Section title="8. Modifications de cette politique">
            <p>Nous nous réservons le droit de mettre à jour cette politique à tout moment. Toute modification substantielle sera signalée sur la page d'accueil du service. La date de dernière mise à jour est affichée en haut de ce document.</p>
          </Section>

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
