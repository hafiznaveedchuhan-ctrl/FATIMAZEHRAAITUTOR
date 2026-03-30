'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-bold text-xl">
          !
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Something went wrong</h2>
        <p className="dark:text-gray-400 text-gray-600 mb-6 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient">
          Try Again
        </button>
      </div>
    </div>
  )
}
