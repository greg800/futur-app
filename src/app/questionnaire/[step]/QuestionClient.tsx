'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: number
  section: string
  preamble: string
  text: string
  position: number
}

interface Props {
  step: number
  total: number
  question: Question
  initialAnswer: string | null
  initialComment: string
  user: { first_name: string; last_name: string; pseudo: string; role: string }
}

const ANSWERS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'sans_position', label: 'Sans position' },
]

export default function QuestionClient({ step, total, question, initialAnswer, initialComment }: Props) {
  const router = useRouter()
  const [answer, setAnswer] = useState<string | null>(initialAnswer)
  const [comment, setComment] = useState(initialComment)
  const [showComment, setShowComment] = useState(!!initialComment)
  const [exiting, setExiting] = useState(false)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const progress = Math.round(step / total * 100)

  const navigate = useCallback(async (selectedAnswer: string, currentComment: string) => {
    await fetch('/api/questionnaire/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, answer: selectedAnswer, comment: currentComment }),
    })
    setExiting(true)
    setTimeout(() => {
      if (step < total) router.push(`/questionnaire/${step + 1}`)
      else router.push('/questionnaire/merci')
    }, 320)
  }, [question.id, step, total, router])

  const handleAnswerClick = useCallback((value: string) => {
    if (exiting) return
    setAnswer(value)
    // Si commentaire ouvert, ne pas auto-avancer
    if (showComment) return
    if (autoTimer.current) clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(() => navigate(value, comment), 500)
  }, [exiting, showComment, comment, navigate])

  const handleValidate = useCallback(() => {
    if (!answer || exiting) return
    if (autoTimer.current) clearTimeout(autoTimer.current)
    navigate(answer, comment)
  }, [answer, comment, exiting, navigate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Enter' && answer) handleValidate()
      if (e.key === '1') handleAnswerClick('oui')
      if (e.key === '2') handleAnswerClick('non')
      if (e.key === '3') handleAnswerClick('sans_position')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, handleValidate, handleAnswerClick])

  useEffect(() => () => { if (autoTimer.current) clearTimeout(autoTimer.current) }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Progress bar — seul élément permanent */}
      <div style={{ height: 3, background: 'var(--green-pale)', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--green)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Contenu animé */}
      <div
        className={exiting ? 'slide-exit' : 'slide-enter'}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 680 }}>
          {/* Step + preamble */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
              background: 'var(--surface)', padding: '4px 10px', borderRadius: 20,
            }}>
              {step} / {total}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: 'var(--green)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {question.preamble}
            </span>
          </div>

          {/* Question */}
          <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 40, color: 'var(--text)' }}>
            {question.text}
          </h2>

          {/* Answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {ANSWERS.map((opt, i) => {
              const selected = answer === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAnswerClick(opt.value)}
                  disabled={exiting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 22px',
                    border: `2px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 12,
                    background: selected ? 'var(--green-pale)' : '#fff',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    cursor: exiting ? 'default' : 'pointer',
                  }}
                >
                  <span style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: selected ? 'var(--green)' : 'var(--surface)',
                    color: selected ? '#fff' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 17, fontWeight: selected ? 600 : 400,
                    color: selected ? 'var(--green)' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>
                    {opt.label}
                  </span>
                  {selected && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 18 }}>✓</span>}
                </button>
              )
            })}
          </div>

          {/* Comment + navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!showComment ? (
              <button
                onClick={() => { setShowComment(true); if (autoTimer.current) clearTimeout(autoTimer.current) }}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer', padding: '2px 0',
                  textDecoration: 'underline', textAlign: 'left',
                }}
              >
                + Ajouter un commentaire
              </button>
            ) : (
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Commentaire optionnel…"
                rows={3}
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: 15, color: 'var(--text)', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              {step > 1 && (
                <button
                  onClick={() => router.push(`/questionnaire/${step - 1}`)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    padding: '10px 18px', borderRadius: 8, fontSize: 14,
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  ← Retour
                </button>
              )}
              {(showComment || !answer) && (
                <button
                  onClick={handleValidate}
                  disabled={!answer || exiting}
                  className="btn"
                  style={{ minWidth: 140 }}
                >
                  {step < total ? 'Valider →' : 'Terminer ✓'}
                </button>
              )}
              {!showComment && answer && !exiting && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Entrée pour valider
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{
        padding: '14px 24px', display: 'flex', justifyContent: 'center',
        gap: 5, borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            onClick={() => !exiting && router.push(`/questionnaire/${i + 1}`)}
            style={{
              width: i + 1 === step ? 22 : 7, height: 7, borderRadius: 4,
              background: i + 1 <= step ? 'var(--green)' : 'var(--border)',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}
