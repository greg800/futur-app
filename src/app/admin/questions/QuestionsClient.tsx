'use client'

import { useState } from 'react'

interface Question {
  id: number
  position: number
  text: string
  section: string
  preamble: string
}

export default function QuestionsClient({ questions: initial }: { questions: Question[] }) {
  const [questions, setQuestions] = useState(initial)
  const [editing, setEditing] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  function startEdit(q: Question) {
    setEditing(q.id)
    setEditText(q.text)
  }

  async function saveEdit(q: Question) {
    if (!editText.trim()) return
    setSaving(true)
    const res = await fetch(`/api/admin/questions/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText }),
    })
    if (res.ok) {
      setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, text: editText.trim() } : item))
      setEditing(null)
    }
    setSaving(false)
  }

  async function deleteQuestion(q: Question) {
    if (!confirm(`Supprimer la question ${q.position} ?\n\nToutes les réponses à cette question seront également supprimées. Cette action est irrémédiable.`)) return
    setDeleting(q.id)
    const res = await fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' })
    if (res.ok) {
      const filtered = questions.filter(item => item.id !== q.id)
      setQuestions(filtered.map((item, i) => ({ ...item, position: i + 1 })))
    }
    setDeleting(null)
  }

  async function addQuestion() {
    if (!newText.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText }),
    })
    if (res.ok) {
      const data = await fetch('/api/admin/questions').then(r => r.json())
      setQuestions(data.questions)
      setNewText('')
      setShowAdd(false)
    }
    setAdding(false)
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Questionnaire</h1>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="btn"
          style={{ fontSize: 14, padding: '10px 20px' }}
        >
          + Ajouter une question
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {questions.length} question{questions.length > 1 ? 's' : ''}
      </p>

      {showAdd && (
        <div style={{
          background: '#fff', border: '1px solid var(--green)', borderRadius: 12,
          padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 10 }}>
            Nouvelle question (position {questions.length + 1})
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Texte de la question…"
            rows={3}
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 15, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={addQuestion}
              disabled={adding || !newText.trim()}
              className="btn"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              {adding ? 'Ajout…' : 'Ajouter'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewText('') }}
              className="btn-ghost"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map(q => (
          <div
            key={q.id}
            style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
              padding: '18px 20px', opacity: deleting === q.id ? 0.4 : 1, transition: 'opacity 0.2s',
            }}
          >
            {editing === q.id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={3}
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid var(--green)',
                    borderRadius: 8, fontSize: 15, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                    marginBottom: 10,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => saveEdit(q)}
                    disabled={saving}
                    className="btn"
                    style={{ fontSize: 13, padding: '8px 16px' }}
                  >
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="btn-ghost"
                    style={{ fontSize: 13, padding: '8px 16px' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--green)',
                  background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 10,
                  flexShrink: 0, marginTop: 2,
                }}>Q{q.position}</span>
                <span style={{ flex: 1, fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>
                  {q.text}
                </span>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(q)}
                    style={{
                      background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteQuestion(q)}
                    disabled={deleting === q.id}
                    style={{
                      background: 'none', border: '1px solid #F5C6C0', color: '#C0392B',
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
