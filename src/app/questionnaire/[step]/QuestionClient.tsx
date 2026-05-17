'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface Question {
  id: number
  section: string
  preamble: string
  text: string
  position: number
}

interface User {
  first_name: string
  last_name: string
  pseudo: string
  role: string
}

interface Props {
  step: number
  total: number
  question: Question
  initialAnswer: string | null
  initialComment: string
  user: User
}

const ANSWERS = [
  { value: 'oui', label: 'Oui', emoji: '✓' },
  { value: 'non', label: 'Non', emoji: '✗' },
  { value: 'sans_position', label: 'Sans position', emoji: '–' },
]

export default function QuestionClient({ step, total, question, initialAnswer, initialComment, user }: Props) {
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  const router = useRouter()
  const [answer, setAnswer] = useState<string | null>(initialAnswer)
  const [comment, setComment] = useState(initialComment)
  const [saving, setSaving] = useState(false)
  const [showComment, setShowComment] = useState(!!initialComment)

  const progress = Math.round((step - 1) / total * 100)

  const handleValidate = useCallback(async () => {
    if (!answer) return
    setSaving(true)

    await fetch('/api/questionnaire/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, answer, comment }),
    })

    setSaving(false)

    if (step < total) {
      router.push(`/questionnaire/${step + 1}`)
    } else {
      router.push('/questionnaire/merci')
    }
  }, [answer, comment, question.id, step, total, router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && answer && !saving) handleValidate()
      if (e.key === '1') setAnswer('oui')
      if (e.key === '2') setAnswer('non')
      if (e.key === '3') setAnswer('sans_position')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, saving, handleValidate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
    }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--green-pale)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--green)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: '#fff',
      }}>
        <Link href="/questionnaire"><Logo size={26} /></Link>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {step} / {total}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.role === 'admin' && (
            <Link href="/admin/users" style={{
              fontSize: 13, fontWeight: 600, color: 'var(--green)',
              background: 'var(--green-pale)', padding: '5px 12px', borderRadius: 20,
            }}>Admin</Link>
          )}
          <Link href="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 10px 5px 5px', borderRadius: 20,
            border: '1px solid var(--border)', textDecoration: 'none',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--green)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{user.pseudo}</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          {/* Preamble */}
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--green)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 20,
          }}>
            {question.preamble}
          </p>

          {/* Question text */}
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 48,
            color: 'var(--text)',
          }}>
            {question.text}
          </h2>

          {/* Answer options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {ANSWERS.map((opt, i) => {
              const selected = answer === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setAnswer(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 24px',
                    border: `2px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 12,
                    background: selected ? 'var(--green-pale)' : '#fff',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: selected ? 'var(--green)' : 'var(--surface)',
                    color: selected ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: selected ? 600 : 400,
                    color: selected ? 'var(--green)' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>
                    {opt.label}
                  </span>
                  {selected && (
                    <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 20 }}>
                      {opt.emoji}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Comment toggle */}
          {!showComment ? (
            <button
              onClick={() => setShowComment(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 14,
                cursor: 'pointer',
                padding: '4px 0',
                textDecoration: 'underline',
                marginBottom: 32,
              }}
            >
              + Ajouter un commentaire
            </button>
          ) : (
            <div style={{ marginBottom: 32 }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Commentaire optionnel…"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 15,
                  color: 'var(--text)',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                autoFocus
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {step > 1 && (
              <button
                onClick={() => router.push(`/questionnaire/${step - 1}`)}
                className="btn-ghost"
              >
                ← Précédente
              </button>
            )}
            <button
              onClick={handleValidate}
              disabled={!answer || saving}
              className="btn"
              style={{ minWidth: 180 }}
            >
              {saving ? 'Enregistrement…' : step < total ? 'Valider →' : 'Terminer ✓'}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>
              ou appuyez sur Entrée
            </span>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div style={{
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        borderTop: '1px solid var(--border)',
      }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: i + 1 === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i + 1 < step ? 'var(--green)' : i + 1 === step ? 'var(--green)' : 'var(--border)',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/questionnaire/${i + 1}`)}
          />
        ))}
      </div>
    </div>
  )
}
