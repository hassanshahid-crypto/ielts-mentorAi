'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardBody, CardHeader, Button, Badge, Spinner } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { ArrowLeft, User, PenTool, Mic, BookOpen } from 'lucide-react'

export default function AdminStudentDetailPage() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      api.adminGetStudent(Number(params.id)).then(setData).catch(console.error).finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!data) return <p>Student not found</p>

  const student = data.student
  const writingAvg = data.writing_tests.length > 0
    ? data.writing_tests.reduce((s: number, t: any) => s + (t.band || 0), 0) / data.writing_tests.length : 0
  const speakingAvg = data.speaking_tests.length > 0
    ? data.speaking_tests.reduce((s: number, t: any) => s + (t.band || 0), 0) / data.speaking_tests.length : 0
  const readingAvg = data.reading_tests.length > 0
    ? data.reading_tests.reduce((s: number, t: any) => s + (t.score || 0), 0) / data.reading_tests.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/admin/students"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
        <h1 className="text-xl font-bold text-gray-900">Student Analytics</h1>
      </div>

      {/* Student Info */}
      <Card>
        <CardBody className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {student.first_name ? `${student.first_name} ${student.last_name}` : student.username}
            </h2>
            <p className="text-gray-500">{student.email}</p>
            <p className="text-xs text-gray-400">Joined: {formatDate(student.joined)}</p>
          </div>
        </CardBody>
      </Card>

      {/* Averages */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardBody className="text-center"><PenTool className="h-6 w-6 text-blue-500 mx-auto mb-1" /><p className="text-2xl font-bold">{formatBandScore(writingAvg)}</p><p className="text-xs text-gray-500">Avg Writing ({data.writing_tests.length} tests)</p></CardBody></Card>
        <Card><CardBody className="text-center"><Mic className="h-6 w-6 text-green-500 mx-auto mb-1" /><p className="text-2xl font-bold">{formatBandScore(speakingAvg)}</p><p className="text-xs text-gray-500">Avg Speaking ({data.speaking_tests.length} tests)</p></CardBody></Card>
        <Card><CardBody className="text-center"><BookOpen className="h-6 w-6 text-purple-500 mx-auto mb-1" /><p className="text-2xl font-bold">{formatBandScore(readingAvg)}</p><p className="text-xs text-gray-500">Avg Reading ({data.reading_tests.length} tests)</p></CardBody></Card>
      </div>

      {/* Writing Tests */}
      {data.writing_tests.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold">Writing Test History</h3></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">TA</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">CC</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">LR</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">GR</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Band</th>
              </tr></thead>
              <tbody className="divide-y">
                {data.writing_tests.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{formatDate(t.date)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.task_type}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.task_achievement?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.coherence?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.lexical?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.grammar?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3"><Badge variant={t.band >= 6 ? 'success' : 'warning'}>{formatBandScore(t.band || 0)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Speaking Tests */}
      {data.speaking_tests.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold">Speaking Test History</h3></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Part</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pron.</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fluency</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Grammar</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Band</th>
              </tr></thead>
              <tbody className="divide-y">
                {data.speaking_tests.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{formatDate(t.date)}</td>
                    <td className="text-center px-4 py-3 text-sm">Part {t.part}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.pronunciation?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.fluency?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.grammar?.toFixed(1)}</td>
                    <td className="text-center px-4 py-3"><Badge variant={t.band >= 6 ? 'success' : 'warning'}>{formatBandScore(t.band || 0)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reading Tests */}
      {data.reading_tests.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold">Reading Test History</h3></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Passage</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Correct</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr></thead>
              <tbody className="divide-y">
                {data.reading_tests.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-sm">{t.passage}</td>
                    <td className="text-center px-4 py-3 text-sm">{t.correct}/{t.total}</td>
                    <td className="text-center px-4 py-3"><Badge variant={t.score >= 6 ? 'success' : 'warning'}>{formatBandScore(t.score)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
