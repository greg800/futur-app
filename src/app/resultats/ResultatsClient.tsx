'use client'

const ANSWER_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  oui:           { label: 'Oui',           color: '#1B4332', bg: '#D8F3DC' },
  non:           { label: 'Non',           color: '#7B2D2D', bg: '#FDECEA' },
  sans_position: { label: 'Sans pos.',     color: '#5A5A5A', bg: '#F0F0F0' },
}

interface Question { id: number; position: number; text: string }
interface Respondent { id: number; name: string; pseudo: string; entity: string | null; last_date: string }

interface Props {
  questions: Question[]
  respondents: Respondent[]
  responseMap: Record<number, Record<number, { answer: string; comment: string | null }>>
  summaries: string[]
}

export default function ResultatsClient({ questions, respondents, responseMap, summaries }: Props) {
  if (respondents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: 18 }}>Aucune réponse enregistrée pour l'instant.</p>
      </div>
    )
  }

  const CELL = 160
  const LABEL_W = 260

  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Résultats</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {respondents.length} participant{respondents.length > 1 ? 's' : ''} · {questions.length} questions
      </p>

      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
        <table style={{
          borderCollapse: 'collapse',
          minWidth: LABEL_W + respondents.length * CELL,
          background: '#fff',
          fontSize: 13,
        }}>
          {/* ---- HEADER ROWS ---- */}
          {/* Nom */}
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              <th style={thLabel()}>Participant</th>
              {respondents.map(r => (
                <th key={r.id} style={thCell()}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{r.name}</div>
                </th>
              ))}
            </tr>
            {/* Entité */}
            <tr style={{ background: 'var(--surface)' }}>
              <th style={{ ...thLabel(), color: 'var(--text-secondary)', fontWeight: 500 }}>Entité</th>
              {respondents.map(r => (
                <td key={r.id} style={{ ...tdCell(), color: 'var(--text-secondary)', fontSize: 12 }}>
                  {r.entity || '—'}
                </td>
              ))}
            </tr>
            {/* Date */}
            <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ ...thLabel(), color: 'var(--text-secondary)', fontWeight: 500 }}>Date de réponse</th>
              {respondents.map(r => (
                <td key={r.id} style={{ ...tdCell(), color: 'var(--text-secondary)', fontSize: 12 }}>
                  {new Date(r.last_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </td>
              ))}
            </tr>
          </thead>

          {/* ---- QUESTION ROWS ---- */}
          <tbody>
            {questions.map((q, idx) => (
              <tr
                key={q.id}
                style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#fff' : 'var(--surface)' }}
              >
                <td style={{
                  padding: '12px 16px',
                  width: LABEL_W,
                  minWidth: LABEL_W,
                  maxWidth: LABEL_W,
                  verticalAlign: 'middle',
                  borderRight: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--green)',
                      background: 'var(--green-pale)', padding: '2px 7px',
                      borderRadius: 10, flexShrink: 0, marginTop: 1,
                    }}>
                      Q{q.position}
                    </span>
                    <span style={{ color: 'var(--text)', lineHeight: 1.4, fontSize: 12 }}>
                      {summaries[idx] || q.text.slice(0, 60)}
                    </span>
                  </div>
                </td>
                {respondents.map(r => {
                  const resp = responseMap[r.id]?.[q.id]
                  const display = resp ? ANSWER_DISPLAY[resp.answer] : null
                  return (
                    <td key={r.id} style={{ ...tdCell(), textAlign: 'center' }} title={resp?.comment || undefined}>
                      {display ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: display.bg,
                          color: display.color,
                          fontWeight: 600,
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}>
                          {display.label}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--border)', fontSize: 16 }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
        Survolez une réponse pour voir le commentaire éventuel.
      </p>
    </div>
  )
}

function thLabel(): React.CSSProperties {
  return {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: 12,
    color: 'var(--text)',
    width: 260,
    minWidth: 260,
    borderRight: '1px solid var(--border)',
    position: 'sticky',
    left: 0,
    background: 'var(--surface)',
    zIndex: 1,
  }
}

function thCell(): React.CSSProperties {
  return {
    padding: '12px 16px',
    textAlign: 'center',
    fontWeight: 600,
    borderRight: '1px solid var(--border)',
    minWidth: 160,
    maxWidth: 160,
  }
}

function tdCell(): React.CSSProperties {
  return {
    padding: '10px 16px',
    borderRight: '1px solid var(--border)',
    verticalAlign: 'middle',
  }
}
