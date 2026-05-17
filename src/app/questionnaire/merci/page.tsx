import Link from 'next/link'
import Logo from '@/components/Logo'

export default function MerciPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--surface)',
      textAlign: 'center',
    }}>
      <Logo size={40} />

      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'var(--green-pale)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        margin: '40px auto 32px',
      }}>
        ✓
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        Questionnaire complété
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
        Merci pour vos réponses. Elles ont été enregistrées et contribuent à cartographier les positions des partis sur les énergies renouvelables.
      </p>

      <Link href="/questionnaire" className="btn">
        Voir mes réponses
      </Link>
    </div>
  )
}
