import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FUTUR — Questionnaire ENR',
  description: 'Positionnement des partis politiques sur les énergies renouvelables',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
