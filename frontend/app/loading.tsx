export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-bold text-sm animate-pulse-glow">
          FZ
        </div>
        <div className="h-1.5 w-32 mx-auto rounded-full bg-gradient-to-r from-[#6C63FF] via-[#EC4899] to-[#3B82F6] animate-shimmer" />
      </div>
    </div>
  )
}
