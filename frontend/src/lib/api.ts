import { getToken } from './auth'
import type {
  User, AuthTokens, LoginRequest, RegisterRequest,
  WritingTest, WritingTestCreate, WritingTestSubmit, WritingFeedback,
  SpeakingTest, SpeakingFeedback,
  ReadingPassage, ReadingTest, ReadingTestSubmit,
  DashboardStats, StudentProgress, AdminStudentStats, AdminOverview,
  PlacementQuestions, PlacementSubmit, PlacementResult,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    let response: Response
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })
    } catch (err) {
      throw new Error('Network error. Make sure the backend server is running on port 8000.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      const message = error.detail
        || error.non_field_errors?.[0]
        || (Array.isArray(error) ? error[0] : null)
        || Object.values(error).flat().join(', ')
        || 'An error occurred'
      throw new Error(message)
    }

    if (response.status === 204) return {} as T
    return response.json()
  }

  // Auth
  async login(data: LoginRequest): Promise<{ tokens: AuthTokens; user: User; message: string }> {
    return this.request('/auth/login/', { method: 'POST', body: JSON.stringify(data) })
  }

  async register(data: RegisterRequest): Promise<{ user: User; message: string }> {
    return this.request('/auth/register/', { method: 'POST', body: JSON.stringify(data) })
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/profile/')
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) })
  }

  async changePassword(data: { old_password: string; new_password: string }): Promise<{ message: string }> {
    return this.request('/auth/change-password/', { method: 'PUT', body: JSON.stringify(data) })
  }

  // Placement
  async getPlacementQuestions(): Promise<PlacementQuestions> {
    return this.request('/auth/placement/questions/')
  }

  async submitPlacement(data: PlacementSubmit): Promise<PlacementResult> {
    return this.request('/auth/placement/submit/', { method: 'POST', body: JSON.stringify(data) })
  }

  async checkProgression(): Promise<any> {
    return this.request('/auth/progression/')
  }

  // Writing
  async getWritingTests(taskType?: string): Promise<WritingTest[]> {
    const query = taskType ? `?task_type=${taskType}` : ''
    return this.request(`/writing/tests/${query}`)
  }

  async getWritingTest(id: number): Promise<WritingTest> {
    return this.request(`/writing/tests/${id}/`)
  }

  async createWritingTest(data: WritingTestCreate): Promise<WritingTest> {
    return this.request('/writing/tests/', { method: 'POST', body: JSON.stringify(data) })
  }

  async submitWritingTest(id: number, data: WritingTestSubmit): Promise<WritingTest> {
    return this.request(`/writing/tests/${id}/submit/`, { method: 'POST', body: JSON.stringify(data) })
  }

  async getWritingFeedback(id: number): Promise<WritingFeedback> {
    return this.request(`/writing/tests/${id}/feedback/`)
  }

  async deleteWritingTest(id: number): Promise<void> {
    return this.request(`/writing/tests/${id}/`, { method: 'DELETE' })
  }

  async getWritingTemplates(params: { task_type?: string; difficulty?: string } = {}): Promise<WritingTest[]> {
    const q = new URLSearchParams()
    if (params.task_type) q.set('task_type', params.task_type)
    if (params.difficulty) q.set('difficulty', params.difficulty)
    const query = q.toString() ? `?${q.toString()}` : ''
    return this.request(`/writing/templates/${query}`)
  }

  // Speaking
  async getSpeakingTests(part?: number): Promise<SpeakingTest[]> {
    const query = part ? `?part=${part}` : ''
    return this.request(`/speaking/tests/${query}`)
  }

  async getSpeakingTemplates(params: { part?: number; difficulty?: string } = {}): Promise<SpeakingTest[]> {
    const q = new URLSearchParams()
    if (params.part) q.set('part', String(params.part))
    if (params.difficulty) q.set('difficulty', params.difficulty)
    const query = q.toString() ? `?${q.toString()}` : ''
    return this.request(`/speaking/templates/${query}`)
  }

  async getSpeakingTestSet(difficulty?: string): Promise<{ set_id: string | null; theme: string; parts: SpeakingTest[] }> {
    const query = difficulty ? `?difficulty=${difficulty}` : ''
    return this.request(`/speaking/test-set/${query}`)
  }

  async generateSpeakingTestSet(difficulty: string): Promise<{ theme: string; part1: string; part2: string; part3: string }> {
    return this.request('/speaking/generate-test-set/', { method: 'POST', body: JSON.stringify({ difficulty }) })
  }

  async createSpeakingTestSet(data: { difficulty: string; theme: string; part1: string; part2: string; part3: string }): Promise<any> {
    return this.request('/speaking/test-set/create/', { method: 'POST', body: JSON.stringify(data) })
  }

  async submitSpeakingSession(data: {
    set_id: string
    part1_transcript: string
    part2_transcript: string
    part3_transcript: string
    part1_duration?: number
    part2_duration?: number
    part3_duration?: number
  }): Promise<{ session_id: string; theme: string; canonical_test_id: number; feedback: any }> {
    return this.request('/speaking/session/submit/', { method: 'POST', body: JSON.stringify(data) })
  }

  async getSpeakingTest(id: number): Promise<SpeakingTest> {
    return this.request(`/speaking/tests/${id}/`)
  }

  async createSpeakingTest(data: { topic: string; part_number: number }): Promise<SpeakingTest> {
    return this.request('/speaking/tests/', { method: 'POST', body: JSON.stringify(data) })
  }

  async submitSpeakingTest(id: number, data: { transcript: string; duration?: number }): Promise<SpeakingTest> {
    return this.request(`/speaking/tests/${id}/submit/`, { method: 'POST', body: JSON.stringify(data) })
  }

  async uploadAudio(testId: number, file: File, duration: number): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('duration', duration.toString())
    return this.request(`/speaking/tests/${testId}/audio/`, { method: 'POST', body: formData })
  }

  async getSpeakingFeedback(id: number): Promise<SpeakingFeedback> {
    return this.request(`/speaking/tests/${id}/feedback/`)
  }

  // Reading
  async getReadingPassages(difficulty?: string): Promise<ReadingPassage[]> {
    const query = difficulty ? `?difficulty=${difficulty}` : ''
    return this.request(`/reading/passages/${query}`)
  }

  async getReadingPassage(id: number): Promise<ReadingPassage> {
    return this.request(`/reading/passages/${id}/`)
  }

  async startReadingTest(passageId: number): Promise<ReadingTest> {
    return this.request('/reading/tests/start/', { method: 'POST', body: JSON.stringify({ passage_id: passageId }) })
  }

  async submitReadingTest(id: number, data: ReadingTestSubmit): Promise<ReadingTest> {
    return this.request(`/reading/tests/${id}/submit/`, { method: 'POST', body: JSON.stringify(data) })
  }

  async getReadingResult(id: number): Promise<ReadingTest> {
    return this.request(`/reading/tests/${id}/result/`)
  }

  async getReadingHistory(): Promise<ReadingTest[]> {
    return this.request('/reading/tests/history/')
  }

  // Analytics
  async getDashboard(): Promise<DashboardStats> {
    return this.request('/analytics/dashboard/')
  }

  async getProgress(days?: number): Promise<StudentProgress> {
    const query = days ? `?days=${days}` : ''
    return this.request(`/analytics/progress/${query}`)
  }

  async adminGetStudents(search?: string): Promise<AdminStudentStats[]> {
    const query = search ? `?search=${search}` : ''
    return this.request(`/analytics/admin/students/${query}`)
  }

  async adminGetStudent(id: number): Promise<any> {
    return this.request(`/analytics/admin/students/${id}/`)
  }

  async adminDeleteStudent(id: number): Promise<void> {
    return this.request(`/analytics/admin/students/${id}/`, { method: 'DELETE' })
  }

  async adminOverview(): Promise<AdminOverview> {
    return this.request('/analytics/admin/overview/')
  }
}

export const api = new ApiClient()
