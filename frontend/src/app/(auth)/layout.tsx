export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            Master IELTS<br />
            with Confidence
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            AI-powered practice for Reading, Writing, and Speaking.
            Get personalized feedback and track your progress toward your target band score.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/70">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-semibold text-white">1</div>
              <span>Adaptive difficulty that grows with you</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-semibold text-white">2</div>
              <span>AI-generated feedback on every response</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-semibold text-white">3</div>
              <span>Full-length practice tests for all modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50 lg:bg-none lg:bg-gray-50">
        {children}
      </div>
    </div>
  )
}
