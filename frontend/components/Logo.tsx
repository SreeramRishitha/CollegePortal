import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 40 }: LogoProps) {
  const uniqueId = `logo-${size}`
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id={`glow-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A1E1E" stopOpacity="1" />
          <stop offset="100%" stopColor="#A03030" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Head - Circle */}
      <circle
        cx="50"
        cy="20"
        r="12"
        fill={`url(#glow-gradient-${uniqueId})`}
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 4px rgba(138, 30, 30, 0.6))' }}
      />
      
      {/* Central Body */}
      <ellipse
        cx="50"
        cy="50"
        rx="15"
        ry="18"
        fill={`url(#glow-gradient-${uniqueId})`}
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 4px rgba(138, 30, 30, 0.6))' }}
      />
      
      {/* Left Arm - Curved upward and outward */}
      <path
        d="M 35 50 Q 20 35 12 20"
        stroke={`url(#glow-gradient-${uniqueId})`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 3px rgba(138, 30, 30, 0.5))' }}
      />
      
      {/* Right Arm - Curved upward and outward */}
      <path
        d="M 65 50 Q 80 35 88 20"
        stroke={`url(#glow-gradient-${uniqueId})`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 3px rgba(138, 30, 30, 0.5))' }}
      />
      
      {/* Left Leg - Curved downward and outward */}
      <path
        d="M 35 50 Q 20 65 12 80"
        stroke={`url(#glow-gradient-${uniqueId})`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 3px rgba(138, 30, 30, 0.5))' }}
      />
      
      {/* Right Leg - Curved downward and outward */}
      <path
        d="M 65 50 Q 80 65 88 80"
        stroke={`url(#glow-gradient-${uniqueId})`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${uniqueId})`}
        style={{ filter: 'drop-shadow(0 0 3px rgba(138, 30, 30, 0.5))' }}
      />
    </svg>
  )
}

