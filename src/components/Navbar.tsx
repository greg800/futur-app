import Link from 'next/link'
import Logo from './Logo'

interface Props {
  user: {
    first_name: string
    last_name: string
    pseudo: string
    role: string
  }
}

export default function Navbar({ user }: Props) {
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  const canSeeResults = user.role === 'lecteur' || user.role === 'admin'

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/questionnaire">
          <Logo size={26} />
        </Link>
        <a
          href="https://futur.odoo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
          style={{ fontSize: 12 }}
        >
          notre site ↗
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {canSeeResults && (
          <Link href="/resultats" className="nav-link">
            Résultats
          </Link>
        )}

        {user.role === 'admin' && (
          <Link href="/admin/users" style={{
            fontSize: 13, fontWeight: 600, color: 'var(--green)',
            background: 'var(--green-pale)', padding: '6px 14px', borderRadius: 20,
          }}>
            Admin
          </Link>
        )}

        <Link href="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px 6px 6px', borderRadius: 24,
          border: '1px solid var(--border)', background: '#fff',
          textDecoration: 'none',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--green)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
            {user.pseudo}
          </span>
        </Link>
      </div>
    </div>
  )
}
