'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#07001a] text-white">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-bold text-xl">
              !
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6 text-sm">{error.message || 'A critical error occurred.'}</p>
            <button onClick={reset} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#EC4899]">
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
