'use client'
import dynamic from 'next/dynamic'

// Load game only client-side (Three.js needs browser)
const GameScene = dynamic(() => import('./GameScene'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-[#0d0d1a] flex items-center justify-center">
      <p className="font-mono text-[#5e72e4] text-sm tracking-widest animate-pulse">LOADING WORLD...</p>
    </div>
  ),
})

export default function GamePage() {
  return <GameScene />
}
