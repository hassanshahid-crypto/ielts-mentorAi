'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner, Modal } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { BookOpen, Plus, Trash2, Brain, Filter, Edit } from 'lucide-react'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'
import type { ReadingPassage } from '@/types'

export default function AdminReadingPage() {
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [newPassage, setNewPassage] = useState({
    title: '', passage_text: '', difficulty: 'intermediate', category: '',
    questions: [{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', order: 1 }],
  })

  const loadPassages = () => {
    setLoading(true)
    api.getReadingPassages(filter || undefined).then(setPassages).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadPassages() }, [filter])

  const difficultyVariant = (d: string) => d === 'beginner' ? 'success' : d === 'intermediate' ? 'warning' : 'danger'

  const generateWithAI = async () => {
    setAiGenerating(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reading/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ difficulty: newPassage.difficulty, category: newPassage.category }),
      })
      if (res.ok) {
        const data = await res.json()
        const questions = (data.questions || []).map((q: any, i: number) => ({
          question_text: q.question_text || '',
          question_type: q.question_type || 'mcq',
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer || '',
          order: q.order || i + 1,
        }))
        setNewPassage({
          ...newPassage,
          title: data.title || '',
          passage_text: data.passage_text || '',
          questions: questions.length > 0 ? questions : newPassage.questions,
        })
        toast.success('AI generated a passage with questions!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'AI generation failed. Check Gemini API key.')
      }
    } catch {
      toast.error('AI generation failed. Check your connection.')
    } finally {
      setAiGenerating(false)
    }
  }

  const addQuestion = () => {
    setNewPassage({
      ...newPassage,
      questions: [...newPassage.questions, { question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', order: newPassage.questions.length + 1 }],
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const questions = [...newPassage.questions]
    questions[index] = { ...questions[index], [field]: value }
    setNewPassage({ ...newPassage, questions })
  }

  const removeQuestion = (index: number) => {
    setNewPassage({ ...newPassage, questions: newPassage.questions.filter((_, i) => i !== index) })
  }

  const createPassage = async () => {
    if (!newPassage.title.trim() || !newPassage.passage_text.trim()) {
      toast.error('Title and passage text are required')
      return
    }
    setCreating(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reading/passages/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newPassage.title,
          passage_text: newPassage.passage_text,
          difficulty: newPassage.difficulty,
          category: newPassage.category,
          questions: newPassage.questions.filter(q => q.question_text.trim()),
        }),
      })
      if (res.ok) {
        toast.success('Reading passage created!')
        setShowModal(false)
        setNewPassage({ title: '', passage_text: '', difficulty: 'intermediate', category: '', questions: [{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', order: 1 }] })
        loadPassages()
      } else {
        const err = await res.json()
        toast.error(err.detail || 'Failed to create passage')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const deletePassage = async (id: number) => {
    if (!confirm('Delete this passage and all its questions?')) return
    try {
      const token = getToken()
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reading/passages/${id}/edit/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      toast.success('Passage deleted')
      setPassages(passages.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Reading Tests</h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage reading passages & questions</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" /> Create Passage
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : passages.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reading Passages</h3>
              <p className="text-gray-500 mb-4">Create your first reading passage with questions</p>
              <Button onClick={() => setShowModal(true)}>Create Passage</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {passages.map((passage) => (
              <Card key={passage.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <Badge variant={difficultyVariant(passage.difficulty)}>{passage.difficulty}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => deletePassage(passage.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{passage.title}</h3>
                  {passage.category && <p className="text-xs text-gray-500 mb-2">{passage.category}</p>}
                  <p className="text-sm text-gray-500 mb-3">{passage.question_count || 0} questions</p>
                  <Link href={`/reading/${passage.id}`}>
                    <Button variant="outline" size="sm" className="w-full">View Passage</Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Reading Passage" className="max-w-2xl">
        <div className="space-y-5">
          <div className="flex justify-end">
            <button onClick={generateWithAI} disabled={aiGenerating} className="flex items-center text-xs text-purple-600 hover:text-purple-700 font-medium px-3 py-1.5 bg-purple-50 rounded-lg">
              <Brain className="h-3.5 w-3.5 mr-1" /> {aiGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={newPassage.difficulty} onChange={(e) => setNewPassage({ ...newPassage, difficulty: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Science, History..." value={newPassage.category} onChange={(e) => setNewPassage({ ...newPassage, category: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Passage title" value={newPassage.title} onChange={(e) => setNewPassage({ ...newPassage, title: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passage Text</label>
              <textarea className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" placeholder="Enter the reading passage..." value={newPassage.passage_text} onChange={(e) => setNewPassage({ ...newPassage, passage_text: e.target.value })} />
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Questions</label>
                <button onClick={addQuestion} className="text-xs text-primary-600 font-medium hover:text-primary-700">+ Add Question</button>
              </div>
              <div className="space-y-4">
                {newPassage.questions.map((q, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Question {i + 1}</span>
                      {newPassage.questions.length > 1 && (
                        <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                      )}
                    </div>
                    <input className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Question text" value={q.question_text} onChange={(e) => updateQuestion(i, 'question_text', e.target.value)} />
                    <select className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" value={q.question_type} onChange={(e) => updateQuestion(i, 'question_type', e.target.value)}>
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false_ng">True/False/Not Given</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                    {q.question_type === 'mcq' && (
                      <div className="grid grid-cols-2 gap-2">
                        {(q.options || ['', '', '', '']).map((opt: string, j: number) => (
                          <input key={j} className="px-2 py-1 border border-gray-300 rounded text-xs" placeholder={`Option ${j + 1}`} value={opt} onChange={(e) => {
                            const options = [...(q.options || ['', '', '', ''])]
                            options[j] = e.target.value
                            updateQuestion(i, 'options', options)
                          }} />
                        ))}
                      </div>
                    )}
                    <input className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Correct answer" value={q.correct_answer} onChange={(e) => updateQuestion(i, 'correct_answer', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={createPassage} loading={creating}>Create Passage</Button>
            </div>
          </div>
      </Modal>
    </>
  )
}
