export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-surface-700 py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-500">FatimaZehra AI Tutor</h1>
          <div className="space-x-4">
            <a href="/auth/login" className="text-gray-400 hover:text-white transition">
              Login
            </a>
            <a href="/auth/signup" className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition">
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">Master Python with AI Coaching</h2>
        <p className="text-xl text-gray-400 mb-8">
          Learn 10 chapters of Python with personalized AI assistance
        </p>
        <div className="space-x-4">
          <a href="/auth/signup" className="btn-primary">
            Get Started
          </a>
          <a href="#features" className="btn-secondary">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <h3 className="text-3xl font-bold mb-12 text-center">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: '10 Chapters', desc: 'Complete Python curriculum' },
            { title: 'AI Tutor', desc: 'GPT-4 powered assistance' },
            { title: 'Interactive Quiz', desc: '10 questions per chapter' },
            { title: 'Progress Tracking', desc: 'Track your learning journey' },
            { title: 'Dark Mode', desc: 'Easy on the eyes' },
            { title: 'Responsive', desc: 'Works on all devices' },
          ].map((feature, i) => (
            <div key={i} className="card">
              <h4 className="font-bold mb-2">{feature.title}</h4>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700 py-8 mt-20">
        <div className="container text-center text-gray-400">
          <p>&copy; 2026 FatimaZehra AI Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
