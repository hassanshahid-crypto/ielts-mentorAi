export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'admin'
  phone?: string
  bio?: string
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
  role: 'student' | 'admin'
  first_name?: string
  last_name?: string
}

export interface WritingTest {
  id: number
  user: number
  user_name: string
  task_type: 'task1' | 'task2'
  topic: string
  instructions: string
  writing_text: string
  word_count: number
  time_spent: number
  status: 'draft' | 'submitted' | 'evaluated'
  feedback?: WritingFeedback
  created_at: string
  updated_at: string
}

export interface WritingFeedback {
  id: number
  writing_test: number
  task_achievement: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_range: number
  overall_band: number
  feedback_text: string
  suggestions: string
  ai_model_used: string
  created_at: string
}

export interface WritingTestCreate {
  task_type: 'task1' | 'task2'
  topic: string
  instructions?: string
}

export interface WritingTestSubmit {
  writing_text: string
  time_spent?: number
}

export interface SpeakingTest {
  id: number
  user: number
  user_name: string
  topic: string
  part_number: 1 | 2 | 3
  status: 'in_progress' | 'completed' | 'evaluated'
  transcript: string
  duration: number
  feedback?: SpeakingFeedback
  audio_files: AudioFile[]
  created_at: string
  updated_at: string
}

export interface SpeakingFeedback {
  id: number
  speaking_test: number
  pronunciation_score: number
  fluency_score: number
  grammar_score: number
  coherence_score: number
  vocabulary_score: number
  overall_band: number
  feedback_text: string
  suggestions: string
  ai_model_used: string
  created_at: string
}

export interface AudioFile {
  id: number
  speaking_test: number
  file: string
  duration: number
  format: string
  created_at: string
}

export interface ReadingPassage {
  id: number
  title: string
  passage_text: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question_count?: number
  questions?: ReadingQuestion[]
  created_at: string
}

export interface ReadingQuestion {
  id: number
  question_text: string
  question_type: 'mcq' | 'true_false_ng' | 'fill_blank' | 'matching' | 'short_answer'
  options?: string[]
  correct_answer?: string
  explanation?: string
  order: number
}

export interface ReadingTest {
  id: number
  user: number
  user_name?: string
  passage: number
  passage_title: string
  answers: Record<string, string>
  score: number
  total_questions: number
  correct_answers: number
  time_spent: number
  status: 'in_progress' | 'completed'
  questions?: ReadingQuestion[]
  started_at: string
  completed_at?: string
  created_at: string
}

export interface ReadingTestSubmit {
  answers: Record<string, string>
  time_spent?: number
}

export interface DashboardStats {
  total_tests: number
  writing_count: number
  speaking_count: number
  reading_count: number
  writing_avg_band: number
  speaking_avg_band: number
  reading_avg_score: number
  overall_avg: number
  recent_writing: Array<{ id: number; task_type: string; status: string; created_at: string }>
  recent_speaking: Array<{ id: number; part_number: number; status: string; created_at: string }>
  recent_reading: Array<{ id: number; passage__title: string; score: number; created_at: string }>
}

export interface StudentProgress {
  writing_progress: Array<{ date: string; band: number; task_type: string; type: string }>
  speaking_progress: Array<{ date: string; band: number; part: number; type: string }>
  reading_progress: Array<{ date: string; score: number; type: string }>
}

export interface AdminStudentStats {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  total_tests: number
  writing_tests: number
  speaking_tests: number
  reading_tests: number
  avg_score: number
  last_active: string | null
  joined: string
}

export interface AdminOverview {
  total_students: number
  active_students: number
  total_tests: number
  total_writing_tests: number
  total_speaking_tests: number
  total_reading_tests: number
  avg_writing_band: number
  avg_speaking_band: number
  avg_reading_score: number
}
