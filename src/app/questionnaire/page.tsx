import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default async function QuestionnaireLanding() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = getDb()
  const total = (db.prepare('SELECT COUNT(*) as c FROM questions').get() as any).c
  const answered = (db.prepare(
    'SELECT COUNT(*) as c FROM responses WHERE user_id = ? AND answer IS NOT NULL'
  ).get(session.userId) as any).c

  const nextStep = answered < total ? answered + 1 : 1

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--surface)',
    }}>
      <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
        <div style={{ marginBottom: 48 }}>
          <Logo size={40} />
        </div>

        <div style={{
          display: 'inline-block',
          background: 'var(--green-pale)',
          color: 'var(--green)',
          fontSize: 13,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 20,
          marginBottom: 24,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Présidentielle — Énergies Renouvelables
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
          Pour un droit effectif à choisir son énergie
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
          Ce questionnaire recense les engagements des partis politiques sur les énergies renouvelables.
          Répondez question par question, à votre rythme — vos réponses sont sauvegardées automatiquement.
        </p>

        {answered > 0 && (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                height: 8,
                background: 'var(--green-pale)',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8,
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(answered / total * 100)}%`,
                  background: 'var(--green)',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {answered} réponse{answered > 1 ? 's' : ''} sur {total}
              </p>
            </div>
          </div>
        )}

        <Link href={`/questionnaire/${nextStep}`} className="btn" style={{ fontSize: 18, padding: '16px 40px' }}>
          {answered === 0 ? 'Commencer →' : answered >= total ? 'Revoir mes réponses →' : 'Continuer →'}
        </Link>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {total} questions — environ 5 minutes
        </p>
      </div>
    </div>
  )
}
