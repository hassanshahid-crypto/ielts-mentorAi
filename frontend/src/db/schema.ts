import { pgTable, serial, varchar, text, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 150 }).notNull().unique(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  password: varchar('password', { length: 128 }).notNull(),
  firstName: varchar('first_name', { length: 150 }),
  lastName: varchar('last_name', { length: 150 }),
  role: varchar('role', { length: 10 }).default('student').notNull(),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  isActive: boolean('is_active').default(true).notNull(),
  isStaff: boolean('is_staff').default(false).notNull(),
  isSuperuser: boolean('is_superuser').default(false).notNull(),
  lastLogin: timestamp('last_login'),
  dateJoined: timestamp('date_joined').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const writingTests = pgTable('writing_tests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskType: varchar('task_type', { length: 5 }).notNull(),
  topic: text('topic').notNull(),
  instructions: text('instructions'),
  writingText: text('writing_text'),
  wordCount: integer('word_count').default(0),
  timeSpent: integer('time_spent').default(0),
  status: varchar('status', { length: 10 }).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const writingFeedback = pgTable('writing_feedback', {
  id: serial('id').primaryKey(),
  writingTestId: integer('writing_test_id').references(() => writingTests.id).notNull().unique(),
  taskAchievement: real('task_achievement').default(0),
  coherenceCohesion: real('coherence_cohesion').default(0),
  lexicalResource: real('lexical_resource').default(0),
  grammaticalRange: real('grammatical_range').default(0),
  overallBand: real('overall_band').default(0),
  feedbackText: text('feedback_text'),
  suggestions: text('suggestions'),
  aiModelUsed: varchar('ai_model_used', { length: 50 }).default('gemini-flash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const speakingTests = pgTable('speaking_tests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  topic: text('topic').notNull(),
  partNumber: integer('part_number').default(1).notNull(),
  status: varchar('status', { length: 15 }).default('in_progress').notNull(),
  transcript: text('transcript'),
  duration: integer('duration').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const audioFiles = pgTable('audio_files', {
  id: serial('id').primaryKey(),
  speakingTestId: integer('speaking_test_id').references(() => speakingTests.id).notNull(),
  file: varchar('file', { length: 255 }).notNull(),
  duration: real('duration').default(0),
  format: varchar('format', { length: 10 }).default('webm'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const speakingFeedback = pgTable('speaking_feedback', {
  id: serial('id').primaryKey(),
  speakingTestId: integer('speaking_test_id').references(() => speakingTests.id).notNull().unique(),
  pronunciationScore: real('pronunciation_score').default(0),
  fluencyScore: real('fluency_score').default(0),
  grammarScore: real('grammar_score').default(0),
  coherenceScore: real('coherence_score').default(0),
  vocabularyScore: real('vocabulary_score').default(0),
  overallBand: real('overall_band').default(0),
  feedbackText: text('feedback_text'),
  suggestions: text('suggestions'),
  aiModelUsed: varchar('ai_model_used', { length: 50 }).default('gemini-flash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const readingPassages = pgTable('reading_passages', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  passageText: text('passage_text').notNull(),
  difficulty: varchar('difficulty', { length: 10 }).default('medium').notNull(),
  category: varchar('category', { length: 100 }),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const readingQuestions = pgTable('reading_questions', {
  id: serial('id').primaryKey(),
  passageId: integer('passage_id').references(() => readingPassages.id).notNull(),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 15 }).notNull(),
  options: jsonb('options'),
  correctAnswer: varchar('correct_answer', { length: 500 }).notNull(),
  explanation: text('explanation'),
  order: integer('order').default(0),
})

export const readingTests = pgTable('reading_tests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  passageId: integer('passage_id').references(() => readingPassages.id).notNull(),
  answers: jsonb('answers').default({}),
  score: real('score').default(0),
  totalQuestions: integer('total_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  timeSpent: integer('time_spent').default(0),
  status: varchar('status', { length: 15 }).default('in_progress').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  writingTests: many(writingTests),
  speakingTests: many(speakingTests),
  readingTests: many(readingTests),
}))

export const writingTestsRelations = relations(writingTests, ({ one }) => ({
  user: one(users, { fields: [writingTests.userId], references: [users.id] }),
  feedback: one(writingFeedback),
}))

export const writingFeedbackRelations = relations(writingFeedback, ({ one }) => ({
  writingTest: one(writingTests, { fields: [writingFeedback.writingTestId], references: [writingTests.id] }),
}))

export const speakingTestsRelations = relations(speakingTests, ({ one, many }) => ({
  user: one(users, { fields: [speakingTests.userId], references: [users.id] }),
  feedback: one(speakingFeedback),
  audioFiles: many(audioFiles),
}))

export const speakingFeedbackRelations = relations(speakingFeedback, ({ one }) => ({
  speakingTest: one(speakingTests, { fields: [speakingFeedback.speakingTestId], references: [speakingTests.id] }),
}))

export const audioFilesRelations = relations(audioFiles, ({ one }) => ({
  speakingTest: one(speakingTests, { fields: [audioFiles.speakingTestId], references: [speakingTests.id] }),
}))

export const readingPassagesRelations = relations(readingPassages, ({ many }) => ({
  questions: many(readingQuestions),
  tests: many(readingTests),
}))

export const readingQuestionsRelations = relations(readingQuestions, ({ one }) => ({
  passage: one(readingPassages, { fields: [readingQuestions.passageId], references: [readingPassages.id] }),
}))

export const readingTestsRelations = relations(readingTests, ({ one }) => ({
  user: one(users, { fields: [readingTests.userId], references: [users.id] }),
  passage: one(readingPassages, { fields: [readingTests.passageId], references: [readingPassages.id] }),
}))
