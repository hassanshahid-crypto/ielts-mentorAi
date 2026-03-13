'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardBody, Input, Spinner, Badge } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { Search, Users, ChevronRight } from 'lucide-react'
import type { AdminStudentStats } from '@/types'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      api.adminGetStudents(search || undefined).then(setStudents).catch(console.error).finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">Manage and view student performance</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-500">No students match your search criteria</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tests</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Writing</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Speaking</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reading</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{student.first_name ? `${student.first_name} ${student.last_name}` : student.username}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="text-center px-4 py-4 text-sm font-medium">{student.total_tests}</td>
                    <td className="text-center px-4 py-4">
                      <Badge variant={student.avg_score >= 6 ? 'success' : student.avg_score >= 4 ? 'warning' : 'danger'}>
                        {formatBandScore(student.avg_score)}
                      </Badge>
                    </td>
                    <td className="text-center px-4 py-4 text-sm">{student.writing_tests}</td>
                    <td className="text-center px-4 py-4 text-sm">{student.speaking_tests}</td>
                    <td className="text-center px-4 py-4 text-sm">{student.reading_tests}</td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/students/${student.id}`} className="text-primary-600 hover:text-primary-800">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
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
