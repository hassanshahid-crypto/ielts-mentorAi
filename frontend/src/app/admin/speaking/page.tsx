'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner, Modal } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { getToken } from '@/lib/auth'
import { Mic, Plus, Trash2, Brain, Filter, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SpeakingTest } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function AdminSpeakingPage() {
  const [tests, setTests] = useState<SpeakingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTest, setEditingTest] = useState<SpeakingTest | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [form, setForm] = useState({ part_number: 1, topic: '', difficulty: 'intermediate' })

  const loadTests = () => {
    setLoading(true)
    api.getSpeakingTests(filter ? Number(filter) : undefined).then(setTests).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadTests() }, [filter])

  const openCreate = () => {
    setEditingTest(null)
    setForm({ part_number: 1, topic: '', difficulty: 'intermediate' })
    setShowModal(true)
  }

  const openEdit = (test: SpeakingTest) => {
    setEditingTest(test)
    setForm({ part_number: test.part_number, topic: test.topic, difficulty: 'intermediate' })
    setShowModal(true)
  }

  const generateWithAI = async () => {
    setAiGenerating(true)
    try {
      const res = await fetch(`${API}/speaking/generate-topic/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ part_number: form.part_number, difficulty: form.difficulty }),
      })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, topic: data.topic })
        toast.success('AI generated a topic!')
      } else {
        toast.error('AI generation failed. Check Gemini API key.')
      }
    } catch {
      toast.error('AI generation failed.')
    } finally {
      setAiGenerating(false)
    }
  }

  const saveTest = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic'); return }
    setSaving(true)
    try {
      if (editingTest) {
        const res = await fetch(`${API}/speaking/tests/${editingTest.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ topic: form.topic, part_number: form.part_number }),
        })
        if (res.ok) toast.success('Test updated!')
        else toast.error('Failed to update')
      } else {
        await api.createSpeakingTest({ topic: form.topic, part_number: form.part_number })
        toast.success('Speaking test created!')
      }
      setShowModal(false)
      loadTests()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTest = async (id: number) => {
    if (!confirm('Delete this speaking test?')) return
    try {
      await fetch(`${API}/speaking/tests/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      toast.success('Test deleted')
      setTests(tests.filter(t => t.id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Speaking Tests</h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage speaking test topics</p>
          </div>
          <Button variant="secondary" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Create Speaking Test
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Parts</option>
            <option value="1">Part 1</option>
            <option value="2">Part 2</option>
            <option value="3">Part 3</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tests.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Speaking Tests</h3>
              <p className="text-gray-500 mb-4">Create your first speaking test for students</p>
              <Button variant="secondary" onClick={openCreate}>Create Speaking Test</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-3">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardBody className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mic className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">Part {test.part_number}</h3>
                        <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'}>{test.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{test.topic}</p>
                      <p className="text-xs text-gray-400">{formatDate(test.created_at)} &bull; by {test.user_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {test.feedback && <span className="text-lg font-bold text-green-600">{formatBandScore(test.feedback.overall_band)}</span>}
                    <Link href={`/speaking/${test.id}`}><Button variant="outline" size="sm">View</Button></Link>
                    <button onClick={() => openEdit(test)} className="text-gray-400 hover:text-blue-600 transition-colors"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteTest(test.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTest ? 'Edit Speaking Test' : 'Create Speaking Test'}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.part_number} onChange={(e) => setForm({ ...form, part_number: Number(e.target.value) })}>
                <option value={1}>Part 1 — Introduction</option>
                <option value={2}>Part 2 — Long Turn</option>
                <option value={3}>Part 3 — Discussion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Topic / Prompt</label>
              <button onClick={generateWithAI} disabled={aiGenerating} className="flex items-center text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                <Brain className="h-3.5 w-3.5 mr-1" /> {aiGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Enter the speaking topic or use AI to generate one..." value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" onClick={saveTest} loading={saving}>{editingTest ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
