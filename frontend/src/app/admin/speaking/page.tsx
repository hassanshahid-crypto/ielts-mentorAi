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

  // Full 3-part test set creation
  const [showSetModal, setShowSetModal] = useState(false)
  const [testSetForm, setTestSetForm] = useState({ difficulty: 'intermediate', theme: '', part1: '', part2: '', part3: '' })
  const [setGenerating, setSetGenerating] = useState(false)
  const [savingSet, setSavingSet] = useState(false)

  const openSetCreate = () => {
    setTestSetForm({ difficulty: 'intermediate', theme: '', part1: '', part2: '', part3: '' })
    setShowSetModal(true)
  }

  const generateFullSet = async () => {
    setSetGenerating(true)
    try {
      const data = await api.generateSpeakingTestSet(testSetForm.difficulty)
      setTestSetForm((prev) => ({ ...prev, theme: data.theme || '', part1: data.part1 || '', part2: data.part2 || '', part3: data.part3 || '' }))
      toast.success('AI generated a 3-part test!')
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed.')
    } finally {
      setSetGenerating(false)
    }
  }

  const saveFullSet = async () => {
    if (!testSetForm.part1.trim() || !testSetForm.part2.trim() || !testSetForm.part3.trim()) {
      toast.error('All three parts are required.')
      return
    }
    setSavingSet(true)
    try {
      await api.createSpeakingTestSet(testSetForm)
      toast.success('3-part speaking test created!')
      setShowSetModal(false)
      loadTests()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save test set.')
    } finally {
      setSavingSet(false)
    }
  }

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
    setForm({ part_number: test.part_number, topic: test.topic, difficulty: (test as any).difficulty || 'intermediate' })
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
          body: JSON.stringify({ topic: form.topic, part_number: form.part_number, difficulty: form.difficulty }),
        })
        if (res.ok) toast.success('Test updated!')
        else toast.error('Failed to update')
      } else {
        await api.createSpeakingTest({ topic: form.topic, part_number: form.part_number, difficulty: form.difficulty } as any)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Manage Speaking Tests</h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage speaking test topics</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
            <Button variant="outline" onClick={openCreate} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" /> Single Part
            </Button>
            <Button variant="secondary" onClick={openSetCreate} className="flex-1 sm:flex-none">
              <Brain className="h-4 w-4 mr-2" /> Create Full 3-Part Test
            </Button>
          </div>
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
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">Part {test.part_number}</h3>
                        <Badge variant={(test as any).difficulty === 'beginner' ? 'success' : (test as any).difficulty === 'pro' ? 'danger' : 'warning'}>
                          {(test as any).difficulty || 'intermediate'}
                        </Badge>
                        {(test as any).theme && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                            {(test as any).theme}
                          </span>
                        )}
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

      {/* Full 3-Part Test Set Modal */}
      <Modal isOpen={showSetModal} onClose={() => setShowSetModal(false)} title="Create Full Speaking Test (3 Parts)">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={testSetForm.difficulty} onChange={(e) => setTestSetForm({ ...testSetForm, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={generateFullSet} disabled={setGenerating} className="w-full flex items-center justify-center text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg font-medium disabled:opacity-50">
                <Brain className="h-4 w-4 mr-1.5" /> {setGenerating ? 'Generating all 3 parts...' : 'Generate Full Test with AI'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme <span className="text-gray-400 font-normal">(shared across all 3 parts)</span></label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Hometown and Travel" value={testSetForm.theme} onChange={(e) => setTestSetForm({ ...testSetForm, theme: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 1 — Introduction questions</label>
            <textarea className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="3-4 short personal warm-up questions" value={testSetForm.part1} onChange={(e) => setTestSetForm({ ...testSetForm, part1: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 2 — Long Turn cue card</label>
            <textarea className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Describe ... You should say: ... ... ... and explain ..." value={testSetForm.part2} onChange={(e) => setTestSetForm({ ...testSetForm, part2: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 3 — Discussion questions <span className="text-gray-400 font-normal">(linked to Part 2)</span></label>
            <textarea className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="2-3 abstract discussion questions expanding on Part 2" value={testSetForm.part3} onChange={(e) => setTestSetForm({ ...testSetForm, part3: e.target.value })} />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setShowSetModal(false)}>Cancel</Button>
            <Button variant="secondary" onClick={saveFullSet} loading={savingSet}>Save 3-Part Test</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
