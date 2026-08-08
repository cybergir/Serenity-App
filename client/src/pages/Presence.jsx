import { useState, useEffect } from 'react'

export default function Presence() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <p className="text-6xl mb-8">🧘</p>
      <p className="text-slate-400 text-lg mb-2">You don't have to do anything right now.</p>
      <p className="text-slate-300 text-sm">
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </p>
    </div>
  )
}